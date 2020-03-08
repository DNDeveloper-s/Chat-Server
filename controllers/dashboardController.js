const mongoose = require('mongoose');

const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
    console.log('Rendering Dashboard');

    const user = await User.findOne({email: req.session.user.email});
    await User.findOne({ email: req.session.user.email})
    .populate('workSpaces')
    .populate('config.defaultWorkSpace')
    .exec(function(err, user){
        res.render('dashboard', {
            pageTitle: `Dashboard | ${req.session.user.name}`,
            userName: req.session.user.name,
            workSpaces: user.workSpaces,
            config: user.config
        });
    });
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

    if(!user.workSpaces.length > 0) {
        user.config.defaultWorkspace = workSpace._id;
    }

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

    const io = req.app.get('socketio');

    const nsName = req.query.nsName;
    const genInvLink = req.query.genInvLink;
    const connectByLink = req.query.connectByLink;
    const createRoom = req.query.createRoom;
    const deleteRoom = req.query.deleteRoom;
    const joinRoom = req.query.joinRoom;

    let nsp = io.of(`/${nsName}`);
    

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

    if(createRoom) {
        
        const name = req.body.name;
        const privacy = req.body.privacy;
        const nsEndPoint = req.query.nsEndPoint;

        nsp = io.of(`/${nsEndPoint}`);

        const workSpace = await WorkSpace.findOne({endPoint: `/${nsEndPoint}`});

        if(!workSpace) {
            return next(`Line 201 Invalid Workspace! /${nsEndPoint}`);
        }

        const room = new Room({
            name: name,
            privacy: privacy,
            workSpaceId: workSpace._id
        });

        await room.save();

        workSpace.rooms.push(room._id);

        await workSpace.save();

        nsp.emit('roomCreated', {
            roomDetails: room,
            workSpace: workSpace
        })

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Created Room Successfully!',
                roomDetails: room,
                workSpace: workSpace
            }
        })

    }

    if(deleteRoom) {
        const nsId = req.body.nsId;
        const roomId = req.body.roomId;
        const nsEndPoint = req.query.nsEndPoint;

        nsp = io.of(`/${nsEndPoint}`);
        

        const workSpace = await WorkSpace.findById(nsId);

        if(!workSpace) {
            return next('Invalid Workspace from Line 223');
        }

        if(workSpace.rooms.length > 1) {
            if(workSpace.defRoom.id.toString() === roomId.toString()) {
                workSpace.rooms = workSpace.rooms.filter(id => id !== roomId.toString());
                workSpace.defRoom.id = workSpace.rooms[0];
            } else {
                workSpace.rooms = workSpace.rooms.filter(id => id !== roomId.toString());
            }
        } else {
            return next('You don\'t have enough room to delete!');
        }

        await Room.findByIdAndRemove(roomId);

        nsp.emit('roomDeleted', {
            roomId: roomId,
            nsId: nsId
        })

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Deleted Room Successfully!',
                roomDetails: {
                    roomId: roomId,
                    nsId: nsId
                }
            }
        }) 
    }

    if(joinRoom) {
        const nsEndPoint = req.query.nsEndPoint;

        nsp = io.of(`/${nsEndPoint}`);
        nsp.to('someRoom').emit('roomEvent', {data: 'Its a room event!'});
    }

}

exports.getWorkSpaceFunctions = async (req, res, next) => {

    const isLoad = req.query.isLoad;
    let nsEndPoint = req.query.nsEndPoint;
    const defaultOne = req.query.defaultOne;
    const joinRoom = req.query.joinRoom;

    if(defaultOne) {
        
        await User.findOne({email: req.session.user.email})
        .populate('config.defaultWorkSpace')
        .exec((err, user) => {
            if(err) next(err.message);
            if(!user) {
                return next('Invalid User!');
            }

            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Succesfully Got the default Workspace!',
                    config: user.config,
                }
            })

        })

    }

    if(isLoad) {
            
        try {
            const socket_id = [];

            const io = req.app.get('socketio');

            const nsp = io.of(nsEndPoint);

            nsp.on('connection', async (nsSocket) => {

                const user = await User.findOne({email: req.session.user.email});

                if(!user) {
                    throw new Error('Invalid User From Line 282 in dashboardController.js!');
                }

                socket_id.push(nsSocket.id);
                if (socket_id[0] === nsSocket.id) {
                    // remove the connection listener for any subsequent 
                    // connections with the same ID
                    nsp.removeAllListeners('connection'); 
                }

                if(nsEndPoint.slice(0, 1) !== '/') {
                    nsEndPoint = `/${nsEndPoint}`;
                }

                // On Connection, Updating Namespace clients
                const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});
                

                if(!workSpace) {
                    throw new Error(`Invalid Workspace From Line 296 in dashboardController.js! ${nsEndPoint}`);
                }

                const updatedConnectedClients = workSpace.connectedClients.filter(cur => cur.toString() === user._id.toString());

                if(!updatedConnectedClients.length > 0) {
                    workSpace.connectedClients.push(user._id);
                }

                await workSpace.save();
                await user.save();


                // Fetch all rooms
                await WorkSpace.findOne({endPoint: nsEndPoint})
                .populate('rooms')
                .exec((err, workSpace) => {
                    nsp.emit('connectedToNamespace', {rooms: workSpace.rooms, workSpace: workSpace  , type: 'fetchedRooms'});
                })
                

                nsSocket.on('joinDefaultRoom', async(dataNs, callback) => {
                    console.log('Joining Default Room');
                    
                    const workSpace = await WorkSpace.findOne({endPoint: dataNs.nsEndPoint});
                    const roomId = workSpace.rooms[0].toString();
                    if(user.joinedRoom !== undefined) {
                        nsSocket.leave(user.joinedRoom, async() => {
                            // const clients = nsSocket.adapter.rooms[user.joinedRoom];
                            // io.of(user.lastNsEndPoint).to(user.joinedRoom).emit('roomLeft', {clients: clients, data: 'a User left the room!'}); // broadcast to everyone in the room
                            user.joinedRoom = roomId;
                            await user.save();
                            nsSocket.join(roomId, async () => {
                                const room = await Room.findById(roomId);
                                let rooms = Object.keys(nsSocket.rooms);
                                // console.log(rooms); // [ <socket.id>, 'room 237' ]
                                callback(room);
                                nsp.in(roomId).clients((err, clients) => {
                                    // nsSocket.broadcast.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                    nsp.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                });
                            });
                        });
                    } else {
                        user.joinedRoom = roomId;
                        await user.save();
                        nsSocket.join(roomId, async () => {
                            const room = await Room.findById(roomId);
                            let rooms = Object.keys(nsSocket.rooms);
                            // console.log(rooms); // [ <socket.id>, 'room 237' ]
                            callback(room);
                            nsp.in(roomId).clients((err, clients) => {
                                // nsSocket.broadcast.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                nsp.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                            });
                          });
                    }
                })

                nsSocket.on('joinRoom', async (data, callback) => {
                    console.log('Line 350', nsSocket.id);
                    
                    if(!user.joinedRoom) {
                        user.joinedRoom = data.roomId;
                        await user.save();
                        nsSocket.join(data.roomId, async () => {
                            const room = await Room.findById(data.roomId);
                            let rooms = Object.keys(nsSocket.rooms);
                            // console.log(rooms); // [ <socket.id>, 'room 237' ]
                            callback(room);
                            nsp.in(data.roomId).clients((err, clients) => {
                                // nsSocket.broadcast.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                nsp.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                            });
                          });
                    } else {
                        
                        // console.log('Line 360', user.joinedRoom.toString(), data.roomId.toString());
                        if(user.joinedRoom.toString() !== data.roomId.toString()) {
                            nsSocket.leave(user.joinedRoom, async() => {
                                const clients = nsSocket.adapter.rooms[user.joinedRoom];
                                nsp.to(user.joinedRoom).emit('roomLeft', {clients: clients, data: 'a User left the room!'}); // broadcast to everyone in the room
                                user.joinedRoom = data.roomId;
                                await user.save();
                                nsSocket.join(data.roomId, async () => {
                                    const room = await Room.findById(data.roomId);
                                    let rooms = Object.keys(nsSocket.rooms);
                                    // console.log(rooms); // [ <socket.id>, 'room 237' ]
                                    callback(room);
                                    nsp.in(data.roomId).clients((err, clients) => {
                                        // nsSocket.broadcast.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                        nsp.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                    });
                                });
                            });
                        }
                    }
                })


                // On Disconnection, Updating Namespace clients
                nsSocket.on('disconnect', async () => {
                    nsp.emit('disconnected', {data: 'Disconnected!', user: req.session.user.name});
                    
                    const clients = nsSocket.adapter.rooms[user.joinedRoom];
                    nsp.to(user.joinedRoom).emit('roomLeft', {clients: clients, data: 'a User left the room!'}); // broadcast to everyone in the room

                    const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

                    if(!workSpace) {
                        throw new Error('Invalid Workspace From Line 322 in dashboardController.js!');
                    }

                    user.joinedRoom = undefined;
                    
                    await user.save();

                    const updatedConnectedClients = workSpace.connectedClients.filter(cur => cur.toString() !== req.session.user._id.toString());
            
                    workSpace.connectedClients = updatedConnectedClients;

                    await workSpace.save();

                    nsp.emit('toMe', {data: workSpace.connectedClients, type: 'disconnect', id: req.session.user._id});

                });

            })
            

            await User.findOne({ email: req.session.user.email})
            .populate('workSpaces')
            .populate('config.defaultWorkSpace') // <==
            .exec(function(err, user){
                return res.render('dashboard', {
                    pageTitle: `Dashboard | ${req.session.user.name}`,
                    userName: req.session.user.name,
                    workSpaces: user.workSpaces,
                    config: user.config
                });
            });
        } catch (e) {
            return next(e.message);
        }



        // return res.json({
        //     acknowledgment: {
        //         type: 'success',
        //         message: 'Succesfully Posted the Workspace!'
        //     }
        // });
    }
}

// function getClients(room) {
//     nsp.in(data.roomId).clients((err, clients) => {
//         return clients.length;
//     });
// }