const mongoose = require('mongoose');

const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');

exports.fetchMessages = async (req, res, next) => {
    const direct = req.query.direct;
    const userId = req.query.userId;


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

}

exports.postMessages = async(req, res, next) => {
    try {
        const io = req.app.get('socketio');
        const direct = req.query.direct;
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
    } catch(e) {
        console.log(e);
        return next(e);
    }
}