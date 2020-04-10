const mongoose = require('mongoose');

const WorkSpace = require('../models/WorkSpace');
const Room = require('../models/Room');
const User = require('../models/User');
const checkPermissions = require('../middleware/checkPermissions');

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
            roleTag: role.roleTag,
            priority: role.priority
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
                permissions: {
                    fullAccess: false,
                    privateRooms: false,
                    editRoles: false,
                    deletedMessages: false,
                    pinMessages: false,
                    roomHandler: false,
                    workSpaceSettings: false,
                    invitations: false,
                }
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

        if(roleTag !== '/everyone') {
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
        } else {
            throw new Error('You cannot edit the universal role!');
        }
        
    } catch(e) {
        return next(e);
    }
}

module.exports.postPermissionsToRole = async(req, res, next) => {
    const permission = req.body.permission;
    const nsEndPoint = req.body.nsEndPoint;
    const roleTag = req.body.roleTag;
    const value = req.body.value;
    const userId = req.session.user._id;
    const io = req.app.get('socketio');

    const {allowed, workSpace} = await checkPermissions({
        endPoint: nsEndPoint,
        userId: userId,
        permission: 'editRoles'
    });

    // if(allowed) {
    //     workSpace.roles.custom.filter(custom => {
    //         if(custom.roleTag === roleTag) {
    //             custom.permissions[permission] = value;
    //         }
    //     })

    //     await workSpace.save();
    // }

    const rolePriority = workSpace.roles.custom.map(cur => {
        let priorityLenth = [];
        const arr = Object.values(cur.permissions);
        arr.splice(0, 4);
        arr.forEach(cur1 => {
            if(cur1 === true) {
                priorityLenth.push('');
            }
        })
        return {
            name: cur.name,
            roleTag: cur.roleTag,
            priority: priorityLenth.length
        }
    });

    // workSpace.roles.members.forEach(member => {
    //     io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('role', {
    //         type: 'permission_edit',
    //         roleTag: roleTag,
    //         nsEndPoint: nsEndPoint,
    //         permission: permission,
    //         value: value
    //     });
    // })

    return res.json({
        permission: permission,
        nsEndPoint: nsEndPoint,
        value: value,
        roleTag: roleTag,
        allowed: allowed,
        rolePriority: rolePriority
    })
}

module.exports.deleteRoles = async (req, res, next) => {
    try {
        const nsEndPoint = req.query.nsEndPoint;
        const roleTag = req.body.roleTag;
        const io = req.app.get('socketio');

        if(roleTag !== '/everyone') {
            const {workSpace, allowed, ifNotMessage} = await require('../middleware/isAdminOfWorkspace')(req.session.user._id, nsEndPoint);

            if(allowed) {

                workSpace.roles.custom = workSpace.roles.custom.filter(cur => cur.roleTag !== roleTag);

                await workSpace.save();

                workSpace.roles.members.forEach(member => {
                    io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('role', {
                        type: 'role_deleted',
                        roleTag: roleTag,
                        nsEndPoint: nsEndPoint
                    });
                })

                return res.json({
                    acknowledgment: {
                        type: 'success',
                        mesage: 'Role deleted successfully!',
                        nsEndPoint: nsEndPoint,
                        roleDetails: roleTag
                    }
                });
            } else {
                return res.json({
                    acknowledgment: {
                        type: 'error',
                        allowed: allowed,
                        message: ifNotMessage
                    }
                })
            }
        } else {
            throw new Error('You cannot edit the universal role!');
        }
        
    } catch(e) {
        return next(e);
    }
}

module.exports.updateColorToRole = async (req, res, next) => {
    try {
        const nsEndPoint = req.query.nsEndPoint;
        const roleTag = req.body.roleTag;
        const color = req.body.color;
        const io = req.app.get('socketio');

        if(roleTag !== '/everyone') {
            const {workSpace, allowed, ifNotMessage} = await require('../middleware/isAdminOfWorkspace')(req.session.user._id, nsEndPoint);

            if(allowed) {

                workSpace.roles.custom.filter(cur => {
                    if(cur.roleTag === roleTag) {
                        cur.color = color;
                    }
                })

                await workSpace.save();

                workSpace.roles.members.forEach(member => {
                    io.of(member.connectedDetails.endPoint).to(member.connectedDetails.socketId).emit('role', {
                        type: 'color_updated',
                        roleTag: roleTag,
                        nsEndPoint: nsEndPoint,
                        color: color
                    });
                })

                return res.json({
                    acknowledgment: {
                        type: 'success',
                        mesage: 'Role colored successfully!',
                        nsEndPoint: nsEndPoint,
                        roleDetails: roleTag,
                        color: color
                    }
                });
            } else {
                return res.json({
                    acknowledgment: {
                        type: 'error',
                        allowed: allowed,
                        message: ifNotMessage
                    }
                })
            }
        } else {
            throw new Error('You cannot edit the universal role!');
        }
        
    } catch(e) {
        return next(e);
    }
}

module.exports.postSettings = async(req, res, next) => {
    try {
        const save = req.query.save;
        const settingObj = req.body.settingObj;

        if(save) {
            // Fetching Workspace from Database
            const workSpace = await WorkSpace.findOne({endPoint: settingObj.nsEndPoint});

            // Handling If Something went wrong with workSpace
            if(!workSpace) {
                return next('Something went wrong with the workspace, Try again!');
            }

            // Updating the workSpace Object | Instance (Mongoose Obj Model)
            workSpace.title = settingObj.title || workSpace.title;
            workSpace.image = settingObj.image || workSpace.image;

            workSpace.roles.custom.forEach(role => {
                // RoleTag ['/everyone'] is not editable
                if(role.roleTag !== '/everyone') {
                    role.name = settingObj.roles.custom[role.roleTag].name || role.name;
                    role.color = settingObj.roles.custom[role.roleTag].color || role.color;
                    role.priority = settingObj.roles.custom[role.roleTag].priority || role.priority;
                }
            });

            // Posting Save to Database
            await workSpace.save();

            // Sending Response to the Client
            return res.json({
                acknowledgment: {
                    type: 'success',
                    mesage: 'Settings posted successfully!',
                    nsEndPoint: settingObj.nsEndPoint
                }
            });
        }
    } catch (e) {
        return next(e);
    }
}