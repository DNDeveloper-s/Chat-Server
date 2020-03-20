const mongoose = require('mongoose');
const DOMParser = require('dom-parser');
const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');

exports.fetchMessages = async (req, res, next) => {
    const direct = req.query.direct;
    const userId = req.query.userId;
    // const byNs = req.query.byNs;


    if(direct) {
        const curUser = await User.findOne({email: req.session.user.email});
    
        // const toUser = await User.findById(userId);
        
        const fetchMessagesFromParticualUser = curUser.messages.direct.filter(cur => cur.userId.toString() === userId.toString());


        return res.json({
            acknowledgment: {
                type: 'success',
                message: 'Succesfully posted the message',
                messages: fetchMessagesFromParticualUser
            }
        })
    }

    // if(byNs) {
    //     const nsEndPoint = req.query.nsEndPoint;
    //     const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

    //     const user = await User.findOne({email: req.session.user.email});

    //     if(!workSpace) {    
    //         return next('Invalid Workspace');
    //     }

    //     if(user.workSpaces.includes(workSpace._id.toString())) {

    //         await WorkSpace.findOne({endPoint: nsEndPoint})
    //         .populate('rooms')
    //         .exec((err, workSpace) => {
    //             if(err) {
    //                 return next('Internal Error!');
    //             }
    //             const roomMessages = workSpace.rooms.map(cur => {
    //                 return {
    //                     _id: cur._id,
    //                     name: cur.name,
    //                     messages: cur.messages
    //                 }
    //             })

    //             function toObject(arr) {
    //                 var rv = {};
    //                 for (var i = 0; i < arr.length; ++i)
    //                     if (arr[i] !== undefined) {
    //                         // const name = arr[i].name
    //                         rv[arr[i]._id] = arr[i].messages;
    //                     }
    //                 return rv;
    //             }

    //             const msgs = toObject(roomMessages);

    //             return res.json({
    //                 acknowledgment: {
    //                     type: 'success',
    //                     message: 'Succesfully fetched all message of the workspace',
    //                     rooms: msgs
    //                 }
    //             })
    //         }); 
    //     }
        // return res.json({
        //     acknowledgment: {
        //         type: 'success',
        //         message: 'Succesfully fetched all message of the workspace',
        //         workSpaces: user.workSpaces
        //     }
        // })
    // }

}

exports.postMessages = async(req, res, next) => {
    try {
        const io = req.app.get('socketio');
        const direct = req.query.direct;
        const toRoom = req.query.toRoom;
        const userId = req.query.userId;
        const messageInput = req.body.message;
        const time = req.body.time;

        if(direct) {
            const curUser = await User.findOne({email: req.session.user.email});
            const toUser = await User.findById(userId);

            const otherMessageObj = {
                userId: curUser._id,
                body: messageInput,
                time: time,
                sender: 'other'
            }

            const selfMessageObj = {
                userId: userId,
                body: messageInput,
                time: time,
                sender: 'self'
            }


            curUser.messages.direct.push(selfMessageObj);
            toUser.messages.direct.push(otherMessageObj);

            if(toUser.status === "offline") {
        
                const notiticationObj = {
                    message: `${curUser.name} has sent you a message!`,
                    notificationType: 'rcvd_msg',
                    userDetails: {
                        image: curUser.image,
                        userId: curUser._id,
                        userName: curUser.name
                    }
                }
                toUser.notifications.list.push(notiticationObj);
                toUser.notifications.count = toUser.notifications.list.length;
            }

            await curUser.save();
            await toUser.save();

            io.of(toUser.connectedDetails.endPoint).to(toUser.connectedDetails.socketId).emit('message', {
                type: 'recieved',
                messageObj: otherMessageObj,
                sender: {
                    name: curUser.name,
                    image: curUser.image,
                    _id: curUser._id,
                    status: curUser.status
                }
            })


            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Succesfully posted the message',
                    messageObj: selfMessageObj
                }
            })
        }




        // userId: userId,
        // body: messageInput,
        // time: time,
        // sender: 'self'

        // if(toRoom) {
        //     const roomId = req.query.roomId;
        //     await Room.findById(roomId)
        //     .populate('messages.user.id')
        //     .exec((err, room) => {

        //         return res.json({
        //             acknowledgment: {
        //                 type: 'error',
        //                 message: 'Succesfully posted the message to room',
        //                 room: room.messages[room.messages.length - 1].user.id.name
        //             }
        //         })
        //     }) 
        // } else 
        
        if(toRoom) {
            const roomId = req.query.roomId;
            const nsEndPoint = req.body.nsEndPoint;
            const message = req.body.message;
            const time = req.body.time;

            console.log(message);

            const user = await User.findOne({email: req.session.user.email});

            const messageToPush = {
                user: {
                    id: user._id
                },
                body: message,
                time: time
            }

            const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});
            const room = await Room.findById(roomId);

            if(!room) {
                return next('Invalid Room!');
            }

            room.messages.push(messageToPush);
            await room.save();

            await Room.findById(roomId)
            .populate('messages.user.id')
            .exec(async (err, room) => {

                const messageObj = {
                    user: {
                        id: user._id,
                        name: room.messages[room.messages.length - 1].user.id.name,
                        image: room.messages[room.messages.length - 1].user.id.image,
                    },
                    body: message,
                    time: time
                }

                messageObj._id = room.messages[room.messages.length - 1]._id;

                // Parsing the message input for mentions
                let parser = new DOMParser();
                let doc = parser.parseFromString(messageInput, 'text/html');
                let ids = [];
                const links = doc.getElementsByClassName('userLink');
                links.forEach(link => {
                    const attr = link.attributes.filter(cur => cur.name === 'data-userid');
                    ids.push(...attr);
                })

                ids.forEach(async (cur) => {
                    const idUser = await User.findById(cur.value);
                    const mentionObj = {
                        nsDetails: {
                            title: workSpace.title,
                            image: workSpace.image,
                            endPoint: nsEndPoint
                        },
                        roomDetails: {
                            name: room.name,
                            _id: roomId
                        },
                        messageObj: {
                            _id: room.messages[room.messages.length - 1]._id,
                            userId: messageObj.user.id,
                            body: messageObj.body,
                            time: messageObj.time
                        }
                    };
                    idUser.mentions.push(mentionObj)
                    idUser.notifications.list.push({
                        message: `You are mentioned by <span class="primary">${user.name}</span> in room <span class="secondary">#${room.name.toLowerCase()}</span>`,
                        notificationType: 'mentioned_msg',
                        userDetails: {
                            image: user.image,
                            userId: user._id,
                            userName: user.name
                        },
                        nsEndPoint: nsEndPoint,
                        roomId: roomId,
                        messageId: messageObj._id
                    })
                    idUser.notifications.count = idUser.notifications.list.length;

                    const notificationCount = idUser.notifications.list.filter(cur => cur.notificationType !== 'rcvd_msg');

                    await idUser.save();
                    
                    // Socket for pushing notification to Mentioned Users
                    io.of(idUser.connectedDetails.endPoint).to(idUser.connectedDetails.socketId).emit('messageToRoom', {
                        type: "toMentions",
                        count: notificationCount.length,
                        mentionDetails: mentionObj
                    })
                })

                

                // Now time for message to workspace
                await WorkSpace.findOne({endPoint: nsEndPoint})
                .populate('roles.members')
                .exec((err, workSpace) => {
                    if(!workSpace) {
                        return next('Invalid Workspace! Line 246');
                    }
                    workSpace.roles.members.forEach(async (member) => {

                        if(member._id.toString() !== user._id.toString()) {
                            // Handling cases where members are online     /- Pushing to UI -/
                            io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('messageToRoom', {
                                type: "toAllConnectedClients",
                                roomId: roomId,
                                nsEndPoint: nsEndPoint,
                                messageObj: messageObj
                            })

                            const memberUser = await User.findById(member._id);
                            
                            // Not emitting to the cur User
                            if(memberUser.status === "offline" || (user._id.toString() !== member._id.toString() && member.joinedRoom.toString() !== roomId.toString())) {

                                // Checking if the notification is already exists for the same room
                                const isAlreadyExists = memberUser.notifications.list.filter(cur => cur.notificationType === 'msgToRoom' && cur.roomId.toString() === roomId.toString());

                                if(!isAlreadyExists.length > 0) {
                                    // Handling cases where members are offline or online     /- Pushing to notifications -/
                                    // const notiticationObj = {
                                    //     message: `New Messages in ${room.name} room.`,
                                    //     notificationType: 'msgToRoom',
                                    //     userDetails: {
                                    //         image: user.image,
                                    //         userId: user._id,
                                    //         userName: user.name
                                    //     },
                                    //     roomId: roomId,
                                    //     nsEndPoint: nsEndPoint
                                    // }
                                    // memberUser.notifications.list.push(notiticationObj);
                                    // memberUser.notifications.count = memberUser.notifications.list.length;
                                    // await memberUser.save();
                                }
                            }
                        } else {
                            // Handling cases where members are online     /- Pushing to UI -/
                            io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('messageToRoom', {
                                type: "toSender",
                                roomId: roomId,
                                nsEndPoint: nsEndPoint,
                                messageObj: messageObj
                            })
                        }
                    })
                    return res.json({
                        acknowledgment: {
                            type: 'success',
                            message: 'Succesfully posted the message to room',
                            messageObj: messageObj
                        }
                    })

                })
            })

            // io.of(nsEndPoint).to(roomId).emit('messageToRoom', {
            //     type: "toRoom",
            //     messageObj: messageObj
            // });
        }

    } catch(e) {
        console.log(e);
        return next(e);
    }
}

