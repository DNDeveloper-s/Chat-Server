const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    messageBody: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

module.exports = mongoose.model('Room', messageSchema);