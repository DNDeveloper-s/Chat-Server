module.exports.deleteRoomMsg = async (messageId = String, roomId = String, nsEndPoint = String) => {
    const res = await fetch(`${window.location.origin}/room/message?action=delete`,{
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roomId: roomId,
            messageId: messageId,
            nsEndPoint: nsEndPoint
        })
    })

    // Returning Promise
    return res.json();
}