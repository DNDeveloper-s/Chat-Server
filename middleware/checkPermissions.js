const WorkSpace = require('../models/WorkSpace');

/** 
 * options = {
 *      endPoint
 *      userId
 *      permission
 * }
 */

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

    console.log('Line 32', allowed);

    return {
        allowed: allowed,
        workSpace: workSpace
    };
}