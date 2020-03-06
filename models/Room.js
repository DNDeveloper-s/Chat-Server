const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    privacy: {
        type: String,
        required: true
    },
    workSpaceId: {
        type: Schema.Types.ObjectId
    },
    messages: [
        {
            id: {
                type: Schema.Types.ObjectID,
                ref: 'Message'
            },
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model('Room', roomSchema);