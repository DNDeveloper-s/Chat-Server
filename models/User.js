const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: String,
    email: {
        type: String,
        required: true
    },
    messages: {
        direct: [
            {
                userId: {
                    type: Schema.Types.ObjectID,
                    ref: 'User'
                },
                body: String,
                time: String,
                sender: String
            }
        ]
    },
    status: String,
    notifications: {
        count: {
            type: Number,
            default: 0
        },
        list: [
            {
                message: String,
                notificationType: String,
                userDetails: {
                    image: String,
                    userId: {
                        type: Schema.Types.ObjectID,
                        ref: 'User'
                    },
                    userName: String
                }
            }
        ]
    },
    connectedDetails: {
        socketId: String,
        endPoint: String
    },
    password: {
        type: String,
        required: true
    },
    friendsList: [
        {
            type: Schema.Types.ObjectID,
            ref: 'User'
        }
    ],
    workSpaces: [
        {
            type: Schema.Types.ObjectID,
            ref: 'WorkSpace'
        }
    ],
    config: {
        defaultWorkSpace: {
            type: Schema.Types.ObjectID,
            ref: 'WorkSpace'
        }
    },
    joinedRoom: {
        type: Schema.Types.ObjectID,
        ref: 'Room'
    }
}, {timestamps: true})

module.exports = mongoose.model('User', userSchema);