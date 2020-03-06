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

    const workSpace = new WorkSpace({
        title: title,
        defRoom: {
            id: room._id
        },
        roles: {
            owner: {
                id: req.session.user._id
            }
        },
        rooms: [
            {
                id: room._id
            }
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

        const workSpace = await WorkSpace.findOne({title: nsName});

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

        const workSpace = await WorkSpace.findOne({title: nsName});

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
            
        const io = require('../socket').getIO();

        console.log('Line 185', nsEndPoint);

        const nsp = io.of(nsEndPoint);

        nsp.on('connection', nsSocket => {
            // nsSocket.emit('hi', {data: 'Nice'});
            console.log('Line 107', nsSocket.id);

            nsp.clients((error, clients) => {
                if (error) throw error;
    
                nsp.emit('clients', {data: clients});
    
                console.log('Line 195', clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
            }); 
        })

        nsp.emit('toMe', {data: 'Its to me only!'});
        

        const user = await User.findOne({email: req.session.user.email});
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