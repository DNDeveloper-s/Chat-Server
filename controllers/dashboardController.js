const mongoose = require('mongoose');

const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
    console.log('Rendering Dashboard');

    const user = await User.findOne({email: req.session.user.email});
    await User.findOne({ email: req.session.user.email})
    .populate('workSpaces') // <==
    .exec(function(err, user){
        res.render('dashboard', {
            pageTitle: `Dashboard | ${req.session.user.name}`,
            userName: req.session.user.name,
            workSpaces: user.workSpaces
        });
    });
    // const workSpaces = [];


    // if(user.workSpaces.length > 0) {
    //     user.workSpaces.forEach(async (curId, ind) => {
    //         const workSpace = await WorkSpace.findById(curId.id);
    //         workSpaces.push(workSpace);
    
    //         if(user.workSpaces.length - 1 === ind) {
    //             console.log(workSpaces);
                
    //             res.render('dashboard', {
    //                 pageTitle: `Dashboard | ${req.session.user.name}`,
    //                 userName: req.session.user.name,
    //                 workSpaces: workSpaces
    //             });
    //         }
    //     })
    // } else {
    //     res.render('dashboard', {
    //         pageTitle: `Dashboard | ${req.session.user.name}`,
    //         userName: req.session.user.name,
    //         workSpaces: workSpaces
    //     });
    // }
}

exports.postWorkspace = async (req, res, next) => {
    const title = req.body.title;
    const defRoomTitle  = req.body.defRoomTitle;

    const user = await User.findOne({email: req.session.user.email});

    const room = new Room({
        name: defRoomTitle,
        privacy: 'Public'
    });

    await room.save();

    let endPoint;

    while(true) {
        let randomNum = Math.ceil(Math.random() * 8798778);
        endPoint = `/${title}${randomNum}`;

        const workSpace = await WorkSpace.findOne({endPoint: endPoint});
        if(workSpace) {
            continue;
        } 
        break;
    }

    const workSpace = new WorkSpace({
        title: title,
        defRoom: {
            id: room._id
        },
        endPoint: endPoint,
        roles: {
            owner: {
                id: req.session.user._id
            }
        },
        rooms: [
            room._id
        ]
    });

    await workSpace.save();

    room.workSpaceId = workSpace._id;

    user.workSpaces.push(workSpace._id);

    await room.save();
    await user.save();

    return res.json({
        acknowledgment: {
            type: 'success',
            message: 'Succesfully Posted the Workspace!',
            workSpace: workSpace
        }
    })
}


exports.workSpaceFunctions = async(req, res, next) => {
    const io = require('../socket').getIO();

    const nsName = req.query.nsName;
    const genInvLink = req.query.genInvLink;
    const connectByLink = req.query.connectByLink;

    const nsp = io.of(`/${nsName}`);

    if(genInvLink) {
        const randomNum = Math.ceil(Math.random() * 487749);
        const link = `${nsName}-${randomNum}`;

        const workSpace = await WorkSpace.findOne({endPoint: `/${nsName}`});

        workSpace.invLinks.push(link);

        await workSpace.save();

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Posted the Workspace!',
                link: link
            }
        })
    }

    if(connectByLink) {
        const link = req.query.connectTo;

        const workSpace = await WorkSpace.findOne({endPoint: `/${nsName}`});

        if(!workSpace) {
            next('Invalid Workspace!');
        }

        const linkIsValid = workSpace.invLinks.filter(invLink => {
            return invLink === link;
        })

        if(!linkIsValid.length > 0) {
            return res.json({
                acknowledgment: {
                    type: 'error',
                    message: 'Invalid Invite Link!'
                }
            })
        }

        workSpace.roles.members.push(req.session.user._id);

        const updatedInvLinks = workSpace.invLinks.filter(cur => cur !== link);

        workSpace.invLinks = updatedInvLinks;

        const user = await User.findOne({email: req.session.user.email});

        user.workSpaces.push(workSpace._id);

        nsp.emit('connectedByLink', {data: {
            userName: user.name
        }});

        await workSpace.save();

        await user.save();

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Connected the Workspace!',
                link: linkIsValid
            }
        })

    }

}

exports.getWorkSpaceFunctions = async (req, res, next) => {

    const isLoad = req.query.isLoad;
    const nsEndPoint = req.query.nsEndPoint;

    if(isLoad) {
            
        // const io = require('../socket').getIO();
        const socket_id = [];

        const io = req.app.get('socketio');

        const nsp = io.of(nsEndPoint);

        console.log('Line 185', nsEndPoint);

        nsp.on('connection', async (nsSocket) => {
            console.log('Line 107', nsSocket.id);

            const user = await User.findOne({email: req.session.user.email});

            if(!user) {
                next('Invalid User From Line 212 in dashboardController.js!');
            }

            socket_id.push(nsSocket.id);
            if (socket_id[0] === nsSocket.id) {
                // remove the connection listener for any subsequent 
                // connections with the same ID
                nsp.removeAllListeners('connection'); 
            }

            // On Connection, Updating Namespace clients
            const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

            if(!workSpace) {
                next('Invalid Workspace From Line 224 in dashboardController.js!');
            }

            const updatedConnectedClients = workSpace.connectedClients.filter(cur => cur.toString() === user._id.toString());

            if(!updatedConnectedClients.length > 0) {
                workSpace.connectedClients.push(user._id);
            }

            await workSpace.save();
            await user.save();

            nsp.emit('toMe', {data: workSpace.connectedClients, type: 'connect'});

            // Fetch all rooms

            await WorkSpace.findOne({endPoint: nsEndPoint})
            .populate('rooms')
            .exec((err, workSpace) => {
                nsp.emit('rooms', {rooms: workSpace.rooms, type: 'fetchedRooms'});
            })

            // On Disconnection, Updating Namespace clients
            nsSocket.on('disconnect', async () => {
                nsp.emit('disconnected', {data: 'Disconnected!', user: req.session.user.name});
                const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

                if(!workSpace) {
                    next('Invalid Workspace From Line 224 in dashboardController.js!');
                }

                const updatedConnectedClients = workSpace.connectedClients.filter(cur => cur.toString() !== req.session.user._id.toString());
        
                workSpace.connectedClients = updatedConnectedClients;

                await workSpace.save();

                nsp.emit('toMe', {data: workSpace.connectedClients, type: 'disconnect', id: req.session.user._id});

            });

        })
        

        await User.findOne({ email: req.session.user.email})
        .populate('workSpaces') // <==
        .exec(function(err, user){
            return res.render('dashboard', {
                pageTitle: `Dashboard | ${req.session.user.name}`,
                userName: req.session.user.name,
                workSpaces: user.workSpaces
            });
        });



        // return res.json({
        //     acknowledgment: {
        //         type: 'success',
        //         message: 'Succesfully Posted the Workspace!'
        //     }
        // });
    }
}