const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    workSpaces: [
        {
            type: Schema.Types.ObjectID,
            ref: 'WorkSpace'
        }
    ],
    socketId: {
        type: String,
    }
}, {timestamps: true})

module.exports = mongoose.model('User', userSchema);