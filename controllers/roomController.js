const Room = require('../models/Room');
const User = require('../models/User');
const checkPermissions = require('../middleware/checkPermissions');

module.exports.messageActions = async (req, res, next) => {
    const action = req.query.action;
    const io = req.app.get('socketio');

    if(action === 'delete') {
        const roomId = req.body.roomId;
        const messageId = req.body.messageId;
        const nsEndPoint = req.body.nsEndPoint;

        const {allowed, workSpace} = await checkPermissions({
            endPoint: nsEndPoint,
            userId: req.session.user._id,
            permission: 'deletedMessages'
        });
        console.log(allowed, 'Line 17');
        // Checking if user is allowed for this action
        if(allowed) {
            // User has power to do this action
            const room = await Room.findById(roomId);

            if(!room) {
                return next('Room is not valid!');
            }

            // Removing message from "room.messages" Array
            room.messages = room.messages.filter(cur => cur._id.toString() !== messageId.toString());

            await room.save();

            // Updating User Mentions
            const user = await User.find();
        
            // Emitting Event to all the connected 'online' sockets to the workspace 
            workSpace.roles.members.forEach(member => {
                if(member.status === 'online') {
                    io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('room', {
                        type: 'deleteMessage',
                        roomId: roomId,
                        messageId: messageId,
                        nsEndPoint: nsEndPoint
                    });
                }
            })

            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Succesfully deleted the message from room',
                    messageId: messageId,
                    roomId: roomId,
                }
            })
        } else {
            
            // User has power to do this action
            return res.json({
                acknowledgment: {
                    type: 'error',
                    allowed: allowed,
                }
            })
        }

    } else if(action === 'pin') {
        const pinnedByUserId = req.session.user._id;
        const messageUserId = req.body.messageUserId;
        const roomId = req.body.roomId;
        const messageId = req.body.messageId;
        const nsEndPoint = req.body.nsEndPoint;

        const {allowed, workSpace} = await checkPermissions({
            endPoint: nsEndPoint,
            userId: req.session.user._id,
            permission: 'pinMessages'
        });

        if(allowed) {
            // Creating Pin Object
            const pinObj = {
                roomId: roomId,
                pinnedByUserId: pinnedByUserId,
                messageId: messageId
            }

            // Checking if this message is already pinned
            const pinnedMessage = workSpace.pins.find(pin => pin.messageId.toString() === messageId.toString());

            if(pinnedMessage) {
            
                // This message is already pinned
                return res.json({
                    acknowledgment: {
                        type: 'error',
                        allowed: allowed,
                        message: 'Message is already pinned.'
                    }
                })
            }

            // Pushing to workspace model
            workSpace.pins.push(pinObj);

            await workSpace.save();

            if(messageUserId.toString() === req.session.user._id.toString()) {
                return res.json({
                    acknowledgment: {
                        type: 'success',
                        message: 'Succesfully pinned your own message to workspace',
                        messageId: messageId,
                        roomId: roomId,
                    }
                })
            }

            // Fetching Message User
            const messageUser = await User.findById(messageUserId);

            // Pushing to the notification
            const notificationObj = {
                message: `${req.session.user.name} has pinned your message.`, 
                notificationType: 'message_pinned', 
                userDetails: {
                    image: req.session.user.image, 
                    userId: req.session.user._id, 
                    userName: req.session.user.name
                }
            }
            messageUser.notifications.list.push(notificationObj);
            messageUser.notifications.count = messageUser.notifications.list.length;

            if(messageUser.status === 'online') {
                // Sending Notification to the 'message user' that the message is pinned by the 'pinnedByUser'
                io.of(messageUser.connectedDetails.endPoint).to(messageUser.connectedDetails.socketId).emit('room', {
                    type: 'pinMessage',
                    roomId: roomId,
                    messageId: messageId,
                    nsEndPoint: nsEndPoint
                });
            }

            await messageUser.save();

            return res.json({
                acknowledgment: {
                    type: 'success',
                    message: 'Succesfully pinned the message to workspace',
                    messageId: messageId,
                    roomId: roomId,
                }
            })
            
        } else {
            
            // User has power to do this action
            return res.json({
                acknowledgment: {
                    type: 'error',
                    allowed: allowed,
                }
            })
        }

    }
}