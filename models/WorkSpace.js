const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const workSpaceSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    roles: {
        owner: {
            id: {
                type: Schema.Types.ObjectID,
                ref: 'User'
            },
        },
        admins: [
            {
                id: {
                    type: Schema.Types.ObjectID,
                    ref: 'User'
                },
            }
        ],
        members: [
            {
                type: Schema.Types.ObjectID,
                ref: 'User'
            }
        ],
    },
    defRoom: {
        id: {
            type: Schema.Types.ObjectID,
            ref: 'Room'
        },
    },
    rooms: [
        {
            id: {
                type: Schema.Types.ObjectID,
                ref: 'Room'
            },
        }
    ],
    invLinks: [
        {
            type: String
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model('WorkSpace', workSpaceSchema);