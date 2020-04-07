/** // Fetched Data
*   { 
*       name,
*       color,
*       permissions,
*       members: {
            name
            image
            status
            _id
        },
*       roleTag,
*   }
*/

/**
 * 
 * @param {String} nsEndPoint
 */

module.exports.fetchRoles = async(nsEndPoint = String) => {
    const res = await fetch(`${window.location.origin}/workspace/roles?nsEndPoint=${nsEndPoint}`,{
        method: 'GET'
    })

    // Returning Promise
    return res.json();
}

/**
 * 
 * @param {String} roleTag
 * @param {String} nsEndPoint
 */

module.exports.fetchRoleByRoleTagSS = (roleTag = String, nsEndPoint = String) => {
    // Fetching Session Storage Data
    const jsonData = sessionStorage.getItem('all_workspaces');
    const data = JSON.parse(jsonData);
    const curWorkspace = data[nsEndPoint];
    const role = curWorkspace.roles.custom.filter(cur => cur.roleTag === roleTag)[0];

    return role;
}