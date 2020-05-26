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

    }
}