const WorkSpace = require('../models/WorkSpace');

module.exports = async (nsEndPoint = String, userId = String) => {
    // Fetching Workspace through the database
    const workSpace = await WorkSpace.findOne({endPoint: nsEndPoint});

    const permissionObj = {
        fullAccess: false,
        privateRooms: false,
        editRoles: false,
        deletedMessages: false,
        pinMessages: false,
        roomHandler: false,
        workSpaceSettings: false,
        invitations: false
    }

    // Fetching Roles of the highest priority
    const roles = workSpace.roles.custom.filter(cur => {
        // Fetching if member is part of the role
        const member = cur.members.filter(cur1 => cur1.toString() === userId.toString());

        // yes if it is part of the role
        if(member) {
            // Permission Object
            const keys = Object.keys(cur.permissions);
    
            for(let i = 0; i < keys.length; i++) {
                if(cur.permissions[keys[i]]) {
                    permissionObj[keys[i]] = true;
                }
            }
        }
    })

    return {
        workSpace: workSpace,
        permissionObj: permissionObj
    };

}