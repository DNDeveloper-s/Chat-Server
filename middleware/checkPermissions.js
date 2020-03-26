const WorkSpace = require('../models/WorkSpace');

module.exports = async(options) => {
    let allowed = false;
    const workSpace = await WorkSpace.findOne({endPoint: options.endPoint})
        .populate('roles.members');

    if(workSpace.roles.owner.toString() === options.userId.toString()) {
        return {
            allowed: true,
            workSpace: workSpace
        };
    }

    const allowedRoles = workSpace.roles.custom.filter(cur => cur.permissions[options.permission] === true);

    allowedRoles.forEach(role => {
        const allowedMember = role.members.filter(cur => cur.toString() === options.userId.toString());
        if(allowedMember.length > 0) {
            allowed = true;
        }
    });
    return {
        allowed: allowed,
        workSpace: workSpace
    };
}