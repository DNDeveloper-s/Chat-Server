const mongoose = require('mongoose');

const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');
const compression = require('../compress-image');

let colors = [
    '#121218',
    '#3EB650',
    '#FCC133',
    '#E12B38',
    '#3CBCC3',
    '#2742bd',
    '#bd27a9',
    '#2763bd',
    '#90bd27',
    '#5c4107',
];

module.exports.fetchRoles = async (req, res, next) => {
    const nsEndPoint = req.query.nsEndPoint;

    const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint})
        .populate('roles.custom.members');

    const customRoles = workSpace.roles.custom.map(role => {
        const memberDetails = role.members.map(member => {
            return {
                name: member.name,
                image: member.image,
                status: member.status,
                _id: member._id,
            }
        })
        return {
            name: role.name,
            color: role.color,
            permissions: role.permissions,
            members: memberDetails,
            roleTag: role.roleTag
        }
    });

    return res.json({
        acknowledgment: {
            type: 'success',
            mesage: 'Roles are fetched!',
            nsEndPoint: nsEndPoint,
            rolesDetails: customRoles
        }
    })
}

module.exports.postRoles = async (req, res, next) => {
    try {
        const nsEndPoint = req.body.endPoint;
        const name = req.body.name;
        const io = req.app.get('socketio');

        const {allowed, ifNotMessage} = await require('../middleware/isAdminOfWorkspace')(req.session.user._id, nsEndPoint);

        if(allowed) {
            const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint})
                .populate('roles.members');

            let roleTag;

            while(true) {
                let randomNum = Math.ceil(Math.random() * 8798778);
                roleTag = `/${name.replace(/ /g,'')}${randomNum}`;

                const workSpaceRoleTag = workSpace.roles.custom.filter(cur => cur.roleTag == roleTag);
                if(workSpaceRoleTag.length > 0) {
                    continue;
                } 
                break;
            }
            let color;
            let i = 0;
            while(i < colors.length) {
                color = colors[i];
                const workSpaceColor = workSpace.roles.custom.filter(cur => cur.color == color);
                if(workSpaceColor.length > 0) {
                    i++
                    continue;
                }
                break;
            }

            const roleObj = {
                name: name,
                roleTag: roleTag,
                members: [],
                color: color,
                permissions: {}
            }

            workSpace.roles.custom.push(roleObj);

            await workSpace.save();

            workSpace.roles.members.forEach(member => {
                io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('role', {
                    type: 'role_added',
                    roleObj: roleObj,
                    nsEndPoint: nsEndPoint
                });
            })

            return res.json({
                acknowledgment: {
                    type: 'success',
                    mesage: 'Role posted successfully!',
                    nsEndPoint: nsEndPoint,
                    roleDetails: roleObj
                }
            })
        } else {
            return res.json({
                acknowledgment: {
                    type: 'error',
                    allowed: allowed,
                    message: ifNotMessage
                }
            })
        }
        
    } catch(e) {
        return next(e);
    }
}

module.exports.postUserToRole = async (req, res, next) => {
    try {
        const nsEndPoint = req.query.nsEndPoint;
        const action = req.query.action;
        const userId = req.body.userId;
        const roleTag = req.body.roleTag;
        const io = req.app.get('socketio');

        const {allowed, ifNotMessage} = await require('../middleware/isAdminOfWorkspace')(req.session.user._id, nsEndPoint);

        if(allowed) {
            const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint})
                .populate('roles.members');
            const user = await User.findById(userId);

            if(action === 'add') {

                workSpace.roles.custom.filter(cur => {
                    if(cur.roleTag == roleTag) {
                        cur.members.push(userId);
                    }
                });
    
                await workSpace.save();

                workSpace.roles.members.forEach(member => {
                    io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('role', {
                        type: 'user_added',
                        roleTag: roleTag,
                        nsEndPoint: nsEndPoint,
                        user: {
                            _id: user._id,
                            name: user.name,
                            image: user.image,
                            status: user.status
                        },
                    });
                })
    
                return res.json({
                    acknowledgment: {
                        type: 'success',
                        message: `User added to the role ${roleTag} successfully!`,
                        nsEndPoint: nsEndPoint,
                        user: {
                            _id: user._id,
                            name: user.name,
                            image: user.image,
                            status: user.status
                        },
                        roleTag: roleTag
                    }
                })
            }

            if(action === 'remove') {

                workSpace.roles.custom.filter(cur => {
                    if(cur.roleTag == roleTag) {
                        cur.members = cur.members.filter(cur => cur.toString() !== userId.toString());
                    }
                });
    
                await workSpace.save();

                workSpace.roles.members.forEach(member => {
                    io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('role', {
                        type: 'user_removed',
                        roleTag: roleTag,
                        nsEndPoint: nsEndPoint,
                        userId: userId
                    });
                })

                return res.json({
                    acknowledgment: {
                        type: 'success',
                        message: `User removed from the role ${roleTag} successfully!`,
                        nsEndPoint: nsEndPoint,
                        user: {
                            _id: user._id,
                            name: user.name,
                            image: user.image,
                            status: user.status
                        },
                        roleTag: roleTag
                    }
                })
            }
        } else {
            return res.json({
                acknowledgment: {
                    type: 'error',
                    allowed: allowed,
                    message: ifNotMessage
                }
            })
        }
        
    } catch(e) {
        return next(e);
    }
}