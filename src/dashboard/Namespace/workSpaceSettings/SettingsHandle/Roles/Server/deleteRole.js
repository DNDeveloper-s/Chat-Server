module.exports.postDeleteRole = async (roleTag = String, nsEndPoint = String) => {
    console.log(roleTag, nsEndPoint);
    const res = await fetch(`${window.location.origin}/workspace/deleteroles`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roleTag: roleTag,
            endPoint: nsEndPoint
        })
    })

    // Returning Promise
    return res.json();
}