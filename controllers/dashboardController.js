const mongoose = require('mongoose');

const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');
const compression = require('../compress-image');

exports.getDashboard = async (req, res, next) => {
    console.log('Rendering Dashboard');

    await User.findOne({ email: req.session.user.email})
    .populate('workSpaces')
    .populate('config.defaultWorkSpace')
    .populate('friendsList')
    .exec(function(err, user){
        // Preparing Friends Details
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
        // Preparing Workspaces
        const workSpaceDetails = user.workSpaces.map(cur => {
            const newRoomMessageCount = user.notifications.list.filter(cur1 => cur.endPoint === cur1.nsEndPoint && cur1.notificationType === 'msgToRoom');
            if(newRoomMessageCount.length > 0) {
                return {
                    title: cur.title,
                    image: cur.image,
                    _id: cur._id,
                    endPoint: cur.endPoint,
                    nothing: false
                }
            }
            return {
                title: cur.title,
                image: cur.image,
                _id: cur._id,
                endPoint: cur.endPoint,
                nothing: true
            }
        })
        // Preparing User Notifications
        const userNotificationCount = user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg').length;
        const userDetails  = {
            name: user.name,
            _id: user._id,
            status: user.status,
            image: user.image,
            notificationCount: userNotificationCount
        };
        res.render('dashboardHome', {
            pageTitle: `Dashboard | ${req.session.user.name}`,
            user: userDetails,
            loadOnDefault: false,
            workSpaces: workSpaceDetails,
            config: user.config,
            friends: friendsDetails,
            loggedIn: true
            // friendsList: user.friendsList
        });
    });
}

exports.postWorkspace = async (req, res, next) => {
    try {
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
            endPoint = `/${title.replace(/ /g,'')}${randomNum}`;

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
                owner: req.session.user._id
            },
            rooms: [
                room._id
            ],
            image: '/assets/images/default.jpg'
        });

        workSpace.roles.members.push(req.session.user._id);

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
                message: 'Succesfully Created the Workspace!',
                workSpace: workSpace
            }
        })
    } catch(e) {
        return next(e);
    }
}

exports.postDeleteWorkspace = async(req, res, next) => {
    const nsEndPoint = req.query.nsEndPoint;
    const userId = req.query.userId;
    const io = req.app.get('socketio');

    if(userId.toString() !== req.session.user._id.toString()) {
        return next('You are not allowed for this action!');
    }

    // Checking if the user is allowed for such action (Checking roles)
    const {allowed, workSpace, ifNotMessage} = await require('../middleware/isAdminOfWorkspace')(userId, nsEndPoint);

    if(allowed) {
        // All rooms related to the workspace removed form db collections
        workSpace.rooms.forEach(async (roomId) => {
            await Room.findByIdAndRemove(roomId);
        });

        // Looping through members are in the workspace
        workSpace.roles.members.forEach(async(memberId) => {
            const user = await User.findById(memberId)
                .populate('config.defaultWorkSpace');

            // Removing entries from user model of workspaces
            user.workSpaces = user.workSpaces.filter(cur => cur.toString() !== workSpace._id.toString());

            // Checking if the user is connected to the workspace currently
            let d;
            nsEndPoint === user.connectedDetails.endPoint ? d = user.config.defaultWorkSpace.endPoint : d = false

            // Emitting event to all the members of workspace to leave the ns if connected
            io.of(user.connectedDetails.endPoint).to(user.connectedDetails.socketId).emit('workSpace', {
                type: 'remove',
                nsEndPoint: nsEndPoint,
                defaultWorkSpace: d
            });

            if(memberId.toString() !== userId.toString()) {
                // Pushing Notification to all members of workspace
                const notificationOBJ = {
                    message: `${req.session.user.name} has been deleted the workspace "${workSpace.title}"`, 
                    notificationType: 'workspace_removed', 
                    userDetails: {
                        image: req.session.user.image, 
                        userId: req.session.user._id, 
                        userName: req.session.user.name
                    }
                };
                user.notifications.list.push(notificationOBJ);
                user.notifications.count = user.notifications.list.length;

                // Emitting events to all the members of workspace of notification
                io.of(user.connectedDetails.endPoint).to(user.connectedDetails.socketId).emit('notification', {
                    curUser: {
                        notifications: {
                            count: user.notifications.filter(cur => cur.notificationType !== 'rcvd_msg').count
                        }
                    }
                });
            }
            await user.save();
        });

        // Now time to remove the actual workspace
        await WorkSpace.findByIdAndRemove(workSpace._id);

        // Sending the JSON response with message and type in terms of acknowledgment
        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Workspace Deleted Succesfully!'
            }
        })

    } else {

        return res.json({
            acknowledgment: {
                type: 'error',
                allowed: allowed,
                message: ifNotMessage
            }
        })
    }
    
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
            return next('Invalid Workspace! Line 192');
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

        nsp.emit('connectedByLink', {
            user: {
                name: user.name,
                image: user.image,
                _id: user._id,
                status: user.status
            }
        });

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
                notificationCount: user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg').length
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

        // Preapring room details for sessionStorage Schema
        // Preparing rooms for notifications
        const roomDetails = {
            _id: room._id,
            workSpaceId: workSpace._id,
            endPoint: `/${nsEndPoint}`,
            workSpaceTitle: workSpace.title,
            name: room.name,
            privacy: room.privacy,
            nothing: true,
            messages: room.messages
        };

        nsp.emit('roomCreated', {
            roomDetails: roomDetails
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
            // Preparing Workspaces
            const workSpaceDetails = user.workSpaces.map(cur => {
                const newRoomMessageCount = user.notifications.list.filter(cur1 => cur.endPoint === cur1.nsEndPoint && cur1.notificationType === 'msgToRoom');
                if(newRoomMessageCount.length > 0) {
                    return {
                        title: cur.title,
                        image: cur.image,
                        _id: cur._id,
                        endPoint: cur.endPoint,
                        nothing: false
                    }
                }
                return {
                    title: cur.title,
                    image: cur.image,
                    _id: cur._id,
                    endPoint: cur.endPoint,
                    nothing: true
                }
            })
            const userNotificationCount = user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg').length;
            const userDetails  = {
                name: user.name,
                _id: user._id,
                status: user.status,
                image: user.image,
                notificationCount: userNotificationCount
            };
            // console.log('Line 429, isFriend', user.friendsList, gotUser._id);
            return res.render('dashboardHome', {
                pageTitle: `Dashboard | ${req.session.user.name}`,
                gotUser: gotUser,
                user: userDetails,
                workSpaces: workSpaceDetails,
                loadOnDefault: true,
                friends: friendsDetails,
                isFriend: isFriend,
                isItAuthenticatedUser: isItAuthenticatedUser,
                config: user.config,
                loggedIn: true
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

                // setInterval(async () => {
                //     const user = await User.findOne({email: req.session.user.email});
                //     const timer = setTimeout(async () => {
                //         user.status = 'offline';
                //         await user.save();
                //     }, 2000);
                //     io.of(nsEndPoint).to(nsSocket.id).emit('checkStatus', {status: 'connected'});
                //     nsSocket.on('connectedSuc', async () => {
                //         clearTimeout(timer);
                //         user.status = 'online';
                //         await user.save();
                //     });
                // }, 1000);

                // nsSocket.on('ping', function() {
                //     nsSocket.emit('pong');
                // });

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
                .populate('workSpaces')
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

                    
                    // Emitting event to all the workspaces, user is connected in that he is online/ available
                    const allEndPoints = user.workSpaces.map(cur => cur.endPoint);
                    allEndPoints.forEach(endPoint => {
                        io.of(endPoint).emit('toClients', {
                            userDetails: {
                                _id: user._id,
                                name: user.name,
                                image: user.image,
                                status: user.status,
                                uniqueTag: user.uniqueTag
                            },
                            endPoint: endPoint
                        });
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


                // // Fetch all rooms
                // await WorkSpace.findOne({endPoint: nsEndPoint})
                // .populate('rooms')
                // .exec((err, workSpace) => {
                //     // Preparing rooms for notifications
                //     const roomDetails = workSpace.rooms.map(cur => {
                //         const msgToRoom = user.notifications.list.filter(cur1 => cur1.notificationType === 'msgToRoom' && cur1.roomId.toString() === cur._id.toString());
                //         if(msgToRoom.length > 0) {
                //             return {
                //                 _id: cur._id,
                //                 name: cur.name,
                //                 privacy: cur.privacy,
                //                 nothing: false
                //             }
                //         }
                //         return {
                //             _id: cur._id,
                //             name: cur.name,
                //             privacy: cur.privacy,
                //             nothing: true
                //         }
                //     })
                //     nsSocket.emit('connectedToNamespace', {rooms: roomDetails, workSpace: workSpace  , type: 'fetchedRooms'});
                // })

                nsSocket.emit('connectedToNamespace', {type: 'fetchedRooms'});
                

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
                                user.notifications.list = user.notifications.list.filter(cur => cur.notificationType !== 'msgToRoom' || cur.roomId.toString() !== roomId);
                                user.notifications.count = user.notifications.list.length;
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
                            user.notifications.list = user.notifications.list.filter(cur => cur.notificationType !== 'msgToRoom' || cur.roomId.toString() !== roomId);
                            user.notifications.count = user.notifications.list.length;
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

                nsSocket.on('leaveRoom', (data, callback) => {
                    nsSocket.leave(data.roomId, async () => {
                        const user = await User.findOne({email: req.session.user.email})
                            // .then(user => {
                            // })
                        const clients = nsSocket.adapter.rooms[data.roomId];
                        nsp.to(data.roomId).emit('roomLeft', {clients: clients, data: 'a User left the room!'}); // broadcast to everyone in the room
                        user.joinedRoom = undefined;
                        user.save();
                        callback({type: "success"});
                    })
                })

                nsSocket.on('roomClients', async(data, callback) => {
                    nsp.in(data.roomId).clients((err, clients) => {
                        callback(clients);
                    });
                })

                // Updated for session Store
                nsSocket.on('joinRoom', async(data, callback) => {
                    nsSocket.join(data.roomId, async () => {
                        User.findOne({email: req.session.user.email})
                            .then((user) => {
                                user.notifications.list = user.notifications.list.filter(cur => cur.notificationType !== 'msgToRoom' || cur.roomId.toString() !== data.roomId.toString());
                                user.notifications.count = user.notifications.list.length;
                                user.joinedRoom = data.roomId;
                                return user.save();
                            })
                            .catch(e => {
                                return next(e);
                            })
                        nsp.in(data.roomId).clients((err, clients) => {
                            // nsSocket.broadcast.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                            nsp.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                        });
                        callback();
                    })
                })

                // nsSocket.on('joinRoom', async(data, callback) => {
                //     nsSocket.join(data.roomId, async () => {
                //         const user = await User.findOne({email: req.session.user.email});
                //         const room = await Room.findById(data.roomId);
                //         user.notifications.list = user.notifications.list.filter(cur => cur.notificationType !== 'msgToRoom' || cur.roomId.toString() !== data.roomId.toString());
                //         user.notifications.count = user.notifications.list.length;
                //         nsp.in(data.roomId).clients((err, clients) => {
                //             // nsSocket.broadcast.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                //             nsp.to(data.roomId).emit('roomJoined', {clients: clients, data: 'a new user has joined the room'}); // broadcast to everyone in the room 
                //         });
                //         user.joinedRoom = data.roomId;
                //         await user.save();
                //         callback(room);
                //     })
                // })


                // On Disconnection, Updating Namespace clients
                nsSocket.on('disconnect', async () => {

                    nsp.emit('disconnected', {data: 'Disconnected!', user: req.session.user.name});


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
                        .populate('workSpaces')
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

                    
                            // Emitting event to all the workspaces, user is connected in that he is online/ available
                            const allEndPoints = user.workSpaces.map(cur => cur.endPoint);
                            allEndPoints.forEach(endPoint => {
                                io.of(endPoint).emit('toClients', {
                                    userDetails: {
                                        _id: user._id,
                                        name: user.name,
                                        image: user.image,
                                        status: user.status,
                                        uniqueTag: user.uniqueTag
                                    },
                                    endPoint: endPoint
                                });
                            })
                        });
                    }, 1000);

                    const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

                    if(!workSpace) {
                        throw new Error('Invalid Workspace From Line 322 in dashboardController.js!');
                    }

                    workSpace.connectedClients = workSpace.connectedClients.filter(cur => cur.toString() !== req.session.user._id.toString());

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
                // Preparing Workspaces
                const workSpaceDetails = user.workSpaces.map(cur => {
                    const newRoomMessageCount = user.notifications.list.filter(cur1 => cur.endPoint === cur1.nsEndPoint && cur1.notificationType === 'msgToRoom');
                    if(newRoomMessageCount.length > 0) {
                        return {
                            title: cur.title,
                            image: cur.image,
                            _id: cur._id,
                            endPoint: cur.endPoint,
                            nothing: false
                        }
                    }
                    return {
                        title: cur.title,
                        image: cur.image,
                        _id: cur._id,
                        endPoint: cur.endPoint,
                        nothing: true
                    }
                })
                const userNotificationCount = user.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg').length;
                const userDetails  = {
                    name: user.name,
                    _id: user._id,
                    status: user.status,
                    image: user.image,
                    notificationCount: userNotificationCount
                };
                return res.render('dashboardHome', {
                    pageTitle: `Dashboard | ${req.session.user.name}`,
                    user: userDetails,
                    loadOnDefault: false,
                    workSpaces: workSpaceDetails,
                    friends: friendsDetails,
                    config: user.config,
                    loggedIn: true
                });
            });
        } catch (e) {
            return next(e.message);
        }
    }
}

exports.fetchDetails = async (req, res, next) => {
    const rooms = req.query.rooms;
    const workspaces = req.query.workspaces;
    const clientsStatus = req.query.clientsStatus;
    const mentions = req.query.mentions;
    
    if(mentions) {
        const user = await User.findOne({email: req.session.user.email})
            .populate('mentions.messageObj.userId');
        if(!user) {
            return next('Invalid User');
        }

        const mentions = user.mentions.map(cur => {
            return {
                nsDetails: cur.nsDetails,
                roomDetails: cur.roomDetails,
                messageObj: {
                    _id: cur.messageObj._id,
                    user: {
                        id: cur.messageObj.userId._id,
                        name: cur.messageObj.userId.name,
                        image: cur.messageObj.userId.image
                    },
                    body: cur.messageObj.body,
                    time: cur.messageObj.time
                }
            }
        })
        
        console.log(mentions);

        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully Got the Mentions!',
                mentions: mentions
            }
        })

    } else if(clientsStatus) {
    
        const nsEndPoint = req.query.nsEndPoint;
        await WorkSpace.findOne({endPoint: nsEndPoint})
        .populate('roles.members')
        .exec((err, workSpace) => {
            const members = workSpace.roles.members.map(cur => {
                return {
                    _id: cur._id,
                    name: cur.name,
                    image: cur.image,
                    status: cur.status,
                    uniqueTag: cur.uniqueTag
                }
            })

            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Succesfully Got the Users!',
                    members: members
                }
            })
        })
    } else  {
    
        const nsEndPoint = req.query.nsEndPoint;
        const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});
    
        const user = await User.findOne({email: req.session.user.email});
    
        if(!workSpace) {    
            return next('Invalid Workspace Line 1070');
        }
    
        if(user.workSpaces.includes(workSpace._id.toString())) {

            // let doc = await WorkSpace.findOne({endPoint: nsEndPoint})
            //     .populate('rooms');
            
            // doc = await WorkSpace.findOne({endPoint: nsEndPoint})
            //     .populate({ path: 'rooms' , populate: { path: 'messages.user.id'} });

            // return res.json({
            //     acknowledgment: {
            //         type: 'error',
            //         workSpace: doc
            //     }
            // })
    
            await WorkSpace.findOne({endPoint: nsEndPoint})
            .populate('rooms')
            .populate({ path: 'rooms' , populate: { path: 'messages.user.id'} })
            .populate('connectedClients')
            .populate('roles.members')
            .populate('roles.owner')
            .populate('roles.admins')
            .populate('roles.custom.members')
            .exec((err, workSpace) => {
                // Checking for internal error
                if(err) {
                    return next('Internal Error!');
                }
                // console.log(workSpace);
    
                if(workspaces) {
                    const workSpaceConnectedClients = workSpace.connectedClients.map(client => {
                        return {
                            name: client.name,
                            image: client.image,
                            uniqueTag: client.uniqueTag,
                            status: client.status,
                            _id: client._id
                        }
                    });
    
                    const rooms = workSpace.rooms.map(cur => {
                        return {
                            _id: cur._id,
                            name: cur.name
                        }
                    })
    
                    const members = workSpace.roles.members.map(cur => {
                        return {
                            name: cur.name,
                            _id: cur._id,
                            image: cur.image,
                            status: cur.status,
                            uniqueTag: cur.uniqueTag
                        }
                    });
                    const custom = workSpace.roles.custom.map(cur => {
                        const memberDetails = cur.members.map(member => {
                            return {
                                name: member.name,
                                image: member.image,
                                status: member.status,
                                _id: member._id
                            }
                        })

                        return {
                            name: cur.name,
                            roleTag: cur.roleTag,
                            members: memberDetails,
                            color: cur.color,
                            permissions: cur.permissions
                        }
                    })
                    const owner = {
                        name: workSpace.roles.owner.name,
                        _id: workSpace.roles.owner._id,
                        image: workSpace.roles.owner.image,
                        status: workSpace.roles.owner.status,
                        uniqueTag: workSpace.roles.owner.uniqueTag
                    };
    
                    const admins = workSpace.roles.admins.map(cur => {
                        return {
                            name: cur.name,
                            _id: cur._id,
                            image: cur.image,
                            status: cur.status,
                            uniqueTag: cur.uniqueTag
                        }
                    });
    
                    return res.json({
                        title: workSpace.title,
                        _id: workSpace._id,
                        endPoint: workSpace.endPoint,
                        roles: {
                            owner: owner,
                            admins: admins,
                            members: members,
                            custom: custom
                        },
                        rooms: rooms,
                        connectedClients: workSpaceConnectedClients
                    }) 
                }
    
                if(rooms) {

                    // Preparing rooms for notifications
                    const roomDetails = workSpace.rooms.map(cur => {
                        const roomMessages = cur.messages.map(message => {
                            return {
                                _id: message._id,
                                user: {
                                    id: message.user.id._id,
                                    name: message.user.id.name,
                                    image: message.user.id.image
                                },
                                body: message.body,
                                time: message.time
                            }
                        });
                        const msgToRoom = user.notifications.list.filter(cur1 => cur1.notificationType === 'msgToRoom' && cur1.roomId.toString() === cur._id.toString());
                        if(msgToRoom.length > 0) {
                            return {
                                _id: cur._id,
                                name: cur.name,
                                workSpaceId: workSpace._id,
                                endPoint: nsEndPoint,
                                privacy: cur.privacy,
                                nothing: false,
                                messages: roomMessages
                            }
                        }
                        return {
                            _id: cur._id,
                            workSpaceId: workSpace._id,
                            endPoint: nsEndPoint,
                            name: cur.name,
                            privacy: cur.privacy,
                            nothing: true,
                            messages: roomMessages
                        }
                    })
    
                    // Response JSON data
                    return res.json({
                        acknowledgment: {
                            type: 'success',
                            message: 'Succesfully fetched all rooms of the workspace',
                            rooms: roomDetails,
                        }
                    })
                }
    
                // // Converting array to object
                // function toObject(arr) {
                //     var rv = {};
                //     for (var i = 0; i < arr.length; ++i)
                //         if (arr[i] !== undefined) {
                //             // const name = arr[i].name
                //             rv[arr[i]._id] = arr[i];
                //         }
                //     return rv;
                // }
                // const rooms = toObject(roomDetails);
            }); 
        }
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
                message: 'Friend Request Sent!',
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

                if(accept == 'true') {
                    curUser.friendsList.push(newFriend._id);
                    newFriend.friendsList.push(curUser._id);
                }

                await curUser.save();
                await newFriend.save();

                if(accept == 'false') {

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
                        message: 'Friend Request Accepted!',
                    }
                })
            }

            return next('Invalid Request');

        // }

    }
}

exports.updateWorkSpaceDetails = async(req, res, next) => {
    const nsEndPoint = req.query.nsEndPoint;
    const userId = req.query.userId;
    const name = req.body.name;
    const image = req.file;
    const io = req.app.get('socketio');

    if(userId.toString() !== req.session.user._id.toString()) {
        return next('You are not allowed for this action!');
    }

    const {allowed, workSpace, ifNotMessage} = await require('../middleware/isAdminOfWorkspace')(userId, nsEndPoint); 
    
    if(allowed) {
    
        if(image) {
            let input = `productImages/user_images/${image.filename}`;
            let output = 'productImages/workspace_images/resized/';

            compression(input, output, async(error, completed, statistic) => {
                let image_path = statistic.path_out_new.slice(13);

                workSpace.title = name;
                workSpace.image = image_path;

                await workSpace.save();

                workSpace.roles.members.forEach(member => {

                    // Checking if the user is connected to the workspace currently
                    let change;
                    nsEndPoint === member.connectedDetails.endPoint ? change = true : change = false

                    io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('workSpace', {
                        type: 'update',
                        workSpace: {
                            title: workSpace.title,
                            image: workSpace.image
                        },
                        nsEndPoint: nsEndPoint,
                        change: change
                    })
                })

                return res.json({
                    acknowledgment: {
                        type: 'success',
                        allowed: allowed,
                        message: 'Succesfully updated the worspace',
                        data: {
                            nsEndPoint: nsEndPoint,
                            userId: userId,
                            name: name,
                            image: image,
                        }
                    }
                })
            });
        } else {
            workSpace.title = name;
            await workSpace.save();

            workSpace.roles.members.forEach(member => {

                // Checking if the user is connected to the workspace currently
                let change;
                nsEndPoint === member.connectedDetails.endPoint ? change = true : change = false

                io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('workSpace', {
                    type: 'update',
                    workSpace: {
                        title: workSpace.title,
                        image: workSpace.image
                    },
                    nsEndPoint: nsEndPoint,
                    change: change
                })
            })

            return res.json({
                acknowledgment: {
                    type: 'success',
                    allowed: allowed,
                    message: 'Succesfully updated the worspace',
                    data: {
                        nsEndPoint: nsEndPoint,
                        userId: userId,
                        name: name,
                    }
                }
            })
        }

    } else {

        return res.json({
            acknowledgment: {
                type: 'error',
                allowed: allowed,
                message: ifNotMessage
            }
        })
    }
}