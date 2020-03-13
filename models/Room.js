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
            user: {
                id: {
                    type: Schema.Types.ObjectID,
                    ref: 'User'
                },
                name: String,
                image: String
            },
            body: String,
            time: String
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model('Room', roomSchema);