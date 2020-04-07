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

module.exports.fetchRoles = async(nsEndPoint) => {
    const res = await fetch(`${window.location.origin}/workspace/roles?nsEndPoint=${nsEndPoint}`,{
        method: 'GET'
    })

    // Returning Promise
    return res.json();
}