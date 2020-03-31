module.exports.getEndPoint = (endPoint) => {
    // Checking endPoint
    if(endPoint.slice(0, 1) !== '/') {
        return `/${endPoint}`;
    } 
    return endPoint;
}

module.exports.setPriorityToRoles = (workSpace) => {
    // Setting priority to roles
    const priority = workSpace.roles.custom.map(role => {
        let priorityLenth = [];
        const arr = Object.values(role.permissions);
        arr.splice(0, 4);
        arr.forEach(cur1 => {
            if(cur1 === true) {
                priorityLenth.push('');
            }
        })
    });

    
}