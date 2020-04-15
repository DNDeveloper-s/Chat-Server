module.exports.postNewRole = async (role_name = String, nsEndPoint = String) => {
    const res = await fetch(`${window.location.origin}/workspace/postroles`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: role_name,
            endPoint: nsEndPoint
        })
    })

    // Returning Promise
    return res.json();
}