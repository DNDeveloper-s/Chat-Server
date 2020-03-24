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

    let memberDetails = [];

    if(workSpace.roles.custom.members) {
        memberDetails = workSpace.roles.custom.members.map(member => {
            return {
                name: member.name,
                image: member.image,
                status: member.status,
                _id: member._id,
            }
        })
    }

    const customRoles = workSpace.roles.custom.map(role => {
        return {
            name: role.name,
            color: role.color,
            permissions: role.permissions,
            members: memberDetails
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

        const {allowed, ifNotMessage} = await require('../middleware/isAdminOfWorkspace')(req.session.user._id, nsEndPoint);

        if(allowed) {
            const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

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
                memebers: [],
                color: color,
                premissions: {}
            }

            workSpace.roles.custom.push(roleObj);

            await workSpace.save();

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