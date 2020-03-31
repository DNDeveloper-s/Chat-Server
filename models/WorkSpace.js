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
    endPoint: {
        type: String,
        required: true
    },
    roles: {
        owner: {
            type: Schema.Types.ObjectID,
            ref: 'User'
        },
        custom: [
            {
                name: String,
                roleTag: String,
                priority: Number,
                members: [
                    {
                        type: Schema.Types.ObjectID,
                        ref: 'User'
                    }
                ],
                color: String,
                permissions: {
                    fullAccess: Boolean,
                    privateRooms: Boolean,
                    editRoles: Boolean,
                    deltedMessages: Boolean,
                    pinMessages: Boolean,
                    roomHandler: Boolean,
                    workSpaceSettings: Boolean,
                    invitations: Boolean,
                }
            }
        ],
        admins: [
            {
                type: Schema.Types.ObjectID,
                ref: 'User'
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
            type: Schema.Types.ObjectID,
            ref: 'Room'
        }
    ],
    invLink: {
        link: String,
        linkExpiration: Date
    },
    connectedClients: [
        {
            type: Schema.Types.ObjectID,
            ref: 'User'
        }
    ]
}, {timestamps: true});

module.exports = mongoose.model('WorkSpace', workSpaceSchema);