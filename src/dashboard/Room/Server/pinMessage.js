module.exports = async (messageId = String, roomId = String, messageUserId = String, nsEndPoint = String) => {
    const res = await fetch(`${window.location.origin}/room/message?action=pin`,{
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roomId: roomId,
            messageUserId: messageUserId,
            messageId: messageId,
            nsEndPoint: nsEndPoint
        })
    })

    // Returning Promise
    return res.json();
}