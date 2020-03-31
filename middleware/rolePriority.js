const WorkSpace = require('../models/WorkSpace');

module.exports = async(options) => {
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
            priority: priorityLenth.length,
            arr: arr
        }
    })
    return {
        allowed: allowed,
        workSpace: workSpace
    };
}