const mongoose = require('mongoose');

const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
    console.log('Rendering Dashboard');

    await User.findOne({ email: req.session.user.email})
    .populate('workSpaces')
    .populate('config.defaultWorkSpace')
    .populate('friendsList')
    .exec(function(err, user){
        const friendsDetails = user.friendsList.map((cur) => {
            const arr = user.notifications.list.filter(cur1 => {
                return (cur1.notificationType === 'rcvd_msg' && cur1.userDetails.userId.toString() === cur._id.toString());
            });
            return {
                _id: cur._id,
                name: cur.name,
                image: cur.image,
                status: cur.status,
                notificationCount: arr.length
            }
        });
        const userNotificationCount = user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg').length;
        const userDetails  = {
            name: user.name,
            _id: user._id,
            status: user.status,
            image: user.image,
            notificationCount: userNotificationCount
        };
        res.render('dashboard', {
            pageTitle: `Dashboard | ${req.session.user.name}`,
            user: userDetails,
            loadOnDefault: false,
            workSpaces: user.workSpaces,
            config: user.config,
            friends: friendsDetails,
            // friendsList: user.friendsList
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
        ],
        image: '/assets/images/Saurabh_DP_square.jpg'
    });

    await workSpace.save();

    room.workSpaceId = workSpace._id;

    if(!user.workSpaces.length > 0) {
        user.config.defaultWorkSpace = workSpace._id;
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
    const deleteNotificationById = req.query.deleteNotificationById;
    const deleteNotificationByType = req.query.deleteNotificationByType;
    const postNotification = req.query.postNotification;

    let nsp = io.of(`/${nsName}`);
    

    if(genInvLink) {

        const workSpace = await WorkSpace.findOne({endPoint: `/${nsName}`});

        if(workSpace.invLink.link && workSpace.invLink.linkExpiration > Date.now()) {
            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Succesfully Got the inv link!',
                    link: workSpace.invLink.link
                }
            })
        }

        const randomNum = Math.ceil(Math.random() * 487749);
        const link = `${nsName}-${randomNum}`;

        workSpace.invLink.link = link;
        workSpace.invLink.linkExpiration = Date.now() + 1 * 60 * 60 * 1000;

        await workSpace.save();

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Got the inv link!',
                link: link
            }
        })
    }

    if(connectByLink) {
        const link = req.query.connectTo;

        const workSpace = await WorkSpace.findOne({endPoint: `/${nsName}`});

        if(!workSpace) {
            return next('Invalid Workspace!');
        }

        if(link !== workSpace.invLink.link || !workSpace.invLink.linkExpiration > Date.now()) {
            return res.json({
                acknowledgment: {
                    type: 'error',
                    message: 'Invalid Invite Link!'
                }
            })
        }

        workSpace.roles.members.push(req.session.user._id);

        workSpace.invLink.link = undefined;
        workSpace.invLink.linkExpiration = undefined;

        const user = await User.findOne({email: req.session.user.email});

        if(!user.workSpaces.length > 0) {
            user.config.defaultWorkSpace = workSpace._id;
        }
    
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
                link: link
            }
        })

    }

    if(deleteNotificationById) {
        const notificationId = req.query.notificationId;

        const user = await User.findOne({email: req.session.user.email});

        user.notifications.list = user.notifications.list.filter(cur => cur._id.toString() !== notificationId.toString());
        user.notifications.count = user.notifications.list.length;

        await user.save();

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Deleted the notification!',
                notificationCount: user.notifications.count
            }
        })

    }

    if(deleteNotificationByType) {
        const userId = req.body.userId;
        const notificationType = req.body.type;

        const user = await User.findOne({email: req.session.user.email});

        if(!user) {
            return next('Invalid User');
        }

        user.notifications.list = user.notifications.list.filter(cur => {
            return ( cur.notificationType !== notificationType || cur.userDetails.userId.toString() !== userId.toString() );
        });

        user.notifications.count = user.notifications.list.length;

        await user.save();

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Deleted the notification!'
            }
        })

    }

    if(postNotification) {
        const notificationObj = req.body.notificationObj;
        const userId = req.body.userId;

        const user = await User.findById(userId);

        console.log(notificationObj);

        user.notifications.list.push(notificationObj);
        user.notifications.count = user.notifications.list.length;

        await user.save();

        if(notificationObj.notificationType === 'rcvd_msg') {
            const arr = user.notifications.list.filter(cur => {
                return (cur.notificationType === 'rcvd_msg' && cur.userDetails.userId.toString() === notificationObj.userDetails.userId.toString());
            })

            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Succesfully Posted the notification!',
                    notificationCount: arr.length
                }
            })
        }

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Posted the notification!',
                notificationCount: user.notifications.count
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

        await workSpace.save();

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
    const getWorkspaceDetails = req.query.getWorkspaceDetails;
    const showUserModal = req.query.showUserModal;
    const showUserModalDefault = req.query.showUserModalDefault;
    const getNotifications = req.query.getNotifications;

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

    if(getNotifications) {
        const userId = req.query.userId;

        const user = await User.findById(userId);

        if(!user) {
            throw new Error('Invalid User, Check your userId!');
        }

        const notifications = user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg');

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Got the Notifications!',
                notifications: notifications
            }
        })
    }

    if(getWorkspaceDetails) {
        const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

        if(!workSpace) {
            throw new Error('Invalid Workspace, Check your endpoint!');
        }

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Got the Workspace!',
                workSpace: workSpace
            }
        })
    }

    if(showUserModal) {
        const userId = req.query.userId;

        const user = await User.findById(userId);
        let isItAuthenticatedUser = false;

        if(!user) {
            throw new Error('Invalid User, Check your userId!');
        }

        if(user.email === req.session.user.email) {
            isItAuthenticatedUser = true;
        }

        const curUser = await User.findOne({email: req.session.user.email});

        const isItFriend = curUser.friendsList.filter(cur => cur.toString() === user._id.toString());
        let isFriend = false;
        if(isItFriend.length > 0) {
            isFriend = true;
        }

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Got the User!',
                user: {
                    name: user.name,
                    _id: user._id,
                    image: user.image
                },
                isFriend: isFriend,
                isItAuthenticatedUser: isItAuthenticatedUser
            }
        })
    }

    if(showUserModalDefault) {
        const userId = req.query.userId;
        console.log('Line 343 ', userId);
        
        const gotUser = await User.findById(userId);
        let isItAuthenticatedUser = false;

        if(!gotUser) {
            return next('Invalid User, Check your userId!');
        }

        if(gotUser && gotUser.email === req.session.user.email) {
            isItAuthenticatedUser = true;
        }
            

        await User.findOne({ email: req.session.user.email})
        .populate('workSpaces')
        .populate('config.defaultWorkSpace')
        .populate('friendsList') // <==
        .exec(function(err, user){
            const isItFriend = user.friendsList.filter(cur => cur._id.toString() === gotUser._id.toString());
            let isFriend = false;
            if(isItFriend.length > 0) {
                isFriend = true;
            }
            const friendsDetails = user.friendsList.map((cur) => {
                const arr = user.notifications.list.filter(cur1 => {
                    return (cur1.notificationType === 'rcvd_msg' && cur1.userDetails.userId.toString() === cur._id.toString());
                });
                return {
                    _id: cur._id,
                    name: cur.name,
                    image: cur.image,
                    status: cur.status,
                    notificationCount: arr.length
                }
            });
            const userNotificationCount = user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg').length;
            const userDetails  = {
                name: user.name,
                _id: user._id,
                status: user.status,
                image: user.image,
                notificationCount: userNotificationCount
            };
            // console.log('Line 429, isFriend', user.friendsList, gotUser._id);
            return res.render('dashboard', {
                pageTitle: `Dashboard | ${req.session.user.name}`,
                gotUser: gotUser,
                user: userDetails,
                workSpaces: user.workSpaces,
                loadOnDefault: true,
                friends: friendsDetails,
                isFriend: isFriend,
                isItAuthenticatedUser: isItAuthenticatedUser,
                config: user.config,
            });
        });
    }

    if(isLoad) {
            
        try {
            const socket_id = [];

            const io = req.app.get('socketio');

            const nsp = io.of(nsEndPoint);


            nsp.on('connection', async (nsSocket) => {

                const user = await User.findOne({email: req.session.user.email});
                user.connectedDetails.socketId = nsSocket.id;
                user.connectedDetails.endPoint = nsEndPoint;
                user.status = 'online';

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
                await user.save();  // -- Changed here

                // Update your status to all of your friends
                await User.findOne({email: req.session.user.email})
                .populate('friendsList')
                .exec(function (err, user) {
                    const friendsSocket = user.friendsList.map(cur => {
                        return {
                            endPoint: cur.connectedDetails.endPoint,
                            socketId: cur.connectedDetails.socketId
                        }
                    });

                    friendsSocket.forEach(cur => {
                        io.of(cur.endPoint).to(cur.socketId).emit('statusUpdate', {
                            user: {
                                _id: user._id,
                                name: user.name,
                                image: user.image,
                                status: user.status
                            }
                        })
                    })
                });

                // Typing Events //
                // Started Typing
                nsSocket.on('message', async function (data) {
                    if(data.type === 'typing') {
                        const userId = data.userId;
                        const sendingUser = data.sendingUser;

                        // Fetching User
                        const user = await User.findById(userId);
                        
                        io.of(user.connectedDetails.endPoint).to(user.connectedDetails.socketId).emit('message', {
                            type: 'typing',
                            userId: user._id,
                            sendingUser: sendingUser
                        })

                    }
                })
                // Stopped Typing
                nsSocket.on('message', async function (data) {
                    if(data.type === 'stopped_typing') {
                        const userId = data.userId;
                        const sendingUser = data.sendingUser;

                        // Fetching User
                        const user = await User.findById(userId);
                        
                        io.of(user.connectedDetails.endPoint).to(user.connectedDetails.socketId).emit('message', {
                            type: 'stopped_typing',
                            userId: user._id,
                            sendingUser: sendingUser
                        })

                    }
                })


                // Fetch all rooms
                await WorkSpace.findOne({endPoint: nsEndPoint})
                .populate('rooms')
                .exec((err, workSpace) => {
                    nsp.emit('connectedToNamespace', {rooms: workSpace.rooms, workSpace: workSpace  , type: 'fetchedRooms'});
                })
                

                nsSocket.on('joinDefaultRoom', async(dataNs, callback) => {

                    const user = await User.findOne({email: req.session.user.email});
                    console.log('Joining Default Room');
                    
                    const workSpace = await WorkSpace.findOne({endPoint: dataNs.nsEndPoint});
                    const roomId = workSpace.rooms[0].toString();
                    if(user.joinedRoom !== undefined && user.joinedRoom.toString() !== roomId.toString()) {
                        const user = await User.findOne({email: req.session.user.email});

                        nsSocket.leave(user.joinedRoom, async() => {
                            nsSocket.join(roomId, async () => {
                                const room = await Room.findById(roomId);
                                let rooms = Object.keys(nsSocket.rooms);
                                // console.log(rooms); // [ <socket.id>, 'room 237' ]
                                user.joinedRoom = roomId;
                                await user.save();
                                nsp.in(roomId).clients((err, clients) => {
                                    // nsSocket.broadcast.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                    nsp.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                });
                                callback(room);
                            });
                        });
                    } else {
                        nsSocket.join(roomId, async () => {
                            const user = await User.findOne({email: req.session.user.email});
                            const room = await Room.findById(roomId);
                            user.joinedRoom = roomId;
                            await user.save();
                            nsp.in(roomId).clients((err, clients) => {
                                // nsSocket.broadcast.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                                nsp.to(roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                            });
                            callback(room);
                          });
                    }
                })

                nsSocket.on('leaveRoom', async (data, callback) => {
                    nsSocket.leave(data.roomId, async() => {
                        const user = await User.findOne({email: req.session.user.email});
                        const clients = nsSocket.adapter.rooms[user.joinedRoom];
                        nsp.to(data.roomId).emit('roomLeft', {clients: clients, data: 'a User left the room!'}); // broadcast to everyone in the room
                        user.joinedRoom = undefined;
                        await user.save();
                        callback({type: "success"});
                    })
                })

                nsSocket.on('roomClients', async(data, callback) => {
                    nsp.in(data.roomId).clients((err, clients) => {
                        callback(clients);
                    });
                })

                nsSocket.on('joinRoom', async(data, callback) => {
                    nsSocket.join(data.roomId, async () => {
                        const user = await User.findOne({email: req.session.user.email});
                        const room = await Room.findById(data.roomId);
                        nsp.in(data.roomId).clients((err, clients) => {
                            // nsSocket.broadcast.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                            nsp.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                        });
                        user.joinedRoom = data.roomId;
                        await user.save();
                        callback(room);
                    })
                })


                // On Disconnection, Updating Namespace clients
                nsSocket.on('disconnect', async () => {

                    nsp.emit('disconnected', {data: 'Disconnected!', user: req.session.user.name});
                    const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

                    if(!workSpace) {
                        throw new Error('Invalid Workspace From Line 322 in dashboardController.js!');
                    }


                    nsSocket.leave(user.joinedRoom, async() => {
                        const clients = nsSocket.adapter.rooms[user.joinedRoom];
                        nsp.to(user.joinedRoom).emit('roomLeft', {clients: clients, data: 'a User left the room!'}); // broadcast to everyone in the room
                    });

                    user.connectedDetails = undefined;
                    user.joinedRoom = undefined;
                    user.status = 'offline';
                    
                    await user.save();

                    // setTimeout(async () => {
                    //     await user.save();
                    // }, 3000);

                    setTimeout(async() => {
                        // Update your status to all of your friends
                        await User.findOne({email: req.session.user.email})
                        .populate('friendsList')
                        .exec(function (err, user) {
                            const friendsSocket = user.friendsList.map(cur => {
                                return {
                                    endPoint: cur.connectedDetails.endPoint,
                                    socketId: cur.connectedDetails.socketId
                                }
                            });
        
                            friendsSocket.forEach(cur => {
                                io.of(cur.endPoint).to(cur.socketId).emit('statusUpdate', {
                                    user: {
                                        _id: user._id,
                                        name: user.name,
                                        image: user.image,
                                        status: user.status
                                    }
                                })
                            });
                        });
                    }, 1000);

                    const updatedConnectedClients = workSpace.connectedClients.filter(cur => cur.toString() !== req.session.user._id.toString());
            
                    workSpace.connectedClients = updatedConnectedClients;

                    await workSpace.save();

                    nsp.emit('toMe', {data: workSpace.connectedClients, type: 'disconnect', id: req.session.user._id});

                });

            });          

            await User.findOne({ email: req.session.user.email})
            .populate('workSpaces')
            .populate('config.defaultWorkSpace')
            .populate('friendsList') // <==
            .exec(function(err, user){
                const friendsDetails = user.friendsList.map((cur) => {
                    const arr = user.notifications.list.filter(cur1 => {
                        return (cur1.notificationType === 'rcvd_msg' && cur1.userDetails.userId.toString() === cur._id.toString());
                    });
                    return {
                        _id: cur._id,
                        name: cur.name,
                        image: cur.image,
                        status: cur.status,
                        notificationCount: arr.length
                    }
                });
                const userNotificationCount = user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg').length;
                const userDetails  = {
                    name: user.name,
                    _id: user._id,
                    status: user.status,
                    image: user.image,
                    notificationCount: userNotificationCount
                };
                return res.render('dashboard', {
                    pageTitle: `Dashboard | ${req.session.user.name}`,
                    user: userDetails,
                    loadOnDefault: false,
                    workSpaces: user.workSpaces,
                    friends: friendsDetails,
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

exports.postAddFriend = async(req, res, next) => {
    const io = req.app.get('socketio');

    const friendId = req.query.friendId;
    const sendRequest = req.query.sendRequest;
    const respondToRequest = req.query.respondToRequest;

    if(sendRequest) {
        const newFriend = await User.findById(friendId);

        if(!newFriend) {
            return next('Invalid User, Check your friendId!');
        }

        const curUser = await User.findOne({email: req.session.user.email});

        const similarFriend = curUser.friendsList.filter(userId => userId === friendId);

        if(similarFriend.length > 0) {
            return next('Already in friends list!');
        }

        // let uniqueId;

        // while(true) {
        //     uniqueId = Math.ceil(Math.random() * 23653);
        //     const isItDuplicate = newFriend.notifications.list.filter(cur => cur._id.toString() === uniqueId.toString());
        //     if(isItDuplicate.length > 0) {
        //         continue;
        //     }
        //     break;
        // }

        const objToPush = {
            message: `${curUser.name} has sent you friend request.`, 
            notificationType: 'frnd_req', 
            userDetails: {
                image: curUser.image, 
                userId: curUser._id, 
                userName: curUser.name
            }
        };

        newFriend.notifications.list.push(objToPush);
        newFriend.notifications.count = newFriend.notifications.list.length;

        await newFriend.save();
        
        io.of(newFriend.connectedDetails.endPoint).to(newFriend.connectedDetails.socketId).emit('notification', {
            notificationType: 'frnd_req',
            sentUser: curUser,
            curUser: newFriend
        });
        
        // curUser.friendsList.push(newFriend._id);

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Added as a friend!',
                newFriend: newFriend
            }
        })
    }

    if(respondToRequest) {
        const accept = req.query.accept;
        
        // if(accept) {
            const newFriend = await User.findById(friendId);
            const curUser = await User.findOne({email: req.session.user.email});  

            const isItAlreadyInFriendList = curUser.friendsList.filter(cur => cur.toString() === friendId.toString());

            if(isItAlreadyInFriendList.length > 0) {

                curUser.notifications.list = curUser.notifications.list.filter(cur => cur.notificationType !== 'frnd_req' && cur.userDetails.userId !== friendId);
                curUser.notifications.count = curUser.notifications.list.length;

                await curUser.save();

                return next('Already in your friend list!');
            }
            
            const requests = curUser.notifications.list.filter(cur => cur.notificationType === 'frnd_req');

            // console.log(requests);

            const isItPending = requests.filter(cur => cur.userDetails.userId.toString() === friendId.toString());

            if(isItPending.length > 0) {

                curUser.notifications.list = curUser.notifications.list.filter(cur => cur.notificationType !== 'frnd_req' && cur.userDetails.userId !== friendId);
                curUser.notifications.count = curUser.notifications.list.length;

                if(accept) {
                    curUser.friendsList.push(newFriend._id);
                    newFriend.friendsList.push(curUser._id);
                }

                await curUser.save();
                await newFriend.save();

                if(!accept) {

                    return res.json({
                        acknowledgment: {
                            type: 'success',
                            message: 'Declined the request!',
                        }
                    })
                }

                return res.json({
                    acknowledgment: {
                        type: 'success',
                        message: 'Added as a friend',
                    }
                })
            }

            return next('Invalid Request');

        // }

    }
}