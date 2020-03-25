const WorkSpace = require('../models/WorkSpace');


module.exports = async (userId, nsEndPoint) => {
    let allowed = false,
        ifNotMessage = '';

    const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint})
        .populate('roles.members');

    if(!workSpace) {
        ifNotMessage = 'Invalid Workspace! Line 1402';
    }

    if(workSpace.roles.owner.toString() !== userId.toString()) {
        workSpace.roles.admins.forEach(admin => {
            if(admin.toString() === userId.toString()) {
                allowed = true;
            }
        })
        if(!allowed) {
            ifNotMessage = 'Only admins are allowed for such action!';
        }
    } else {
        allowed = true;
    }
    return {
        allowed: allowed, 
        workSpace: workSpace,
        ifNotMessage: ifNotMessage
    };
}