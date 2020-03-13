const io = require('socket.io-client');

const { loadRoom } = require('./roomUI');
const { getNsSocket } = require('../Namespace/nsFunctionaily');

async function postNewRoom(roomDetails) {
    const nsEndPoint = window.location.search.split('nsEndPoint=')[1];
    console.log(nsEndPoint);
    
    const res = await fetch(`${window.location.origin}/dashboard/workspace?createRoom=true&nsEndPoint=${nsEndPoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: roomDetails.name,
            privacy: roomDetails.privacy
        })
    });

    const data = await res.json();

    console.log(data);
}

async function postDeleteRoom(roomDetails) {
    const nsEndPoint = window.location.search.split('nsEndPoint=')[1];
    console.log(nsEndPoint);
    
    const res = await fetch(`${window.location.origin}/dashboard/workspace?deleteRoom=true&nsEndPoint=${nsEndPoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            roomId: roomDetails.roomId,
            nsId: roomDetails.nsId,
        })
    });

    const data = await res.json();

    console.log(data);

    // deleteRooom(data.acknowledgment.roomDetails);
}

async function joinRoom(roomDetails) {

    const nsSocket = getNsSocket();
    const leaveRoomId = document.querySelector('.room-details').dataset.roomid;

    nsSocket.emit('leaveRoom', {roomId: leaveRoomId}, (data) => {
        if(data.type === "success") {
            nsSocket.emit('joinRoom', {roomId: roomDetails.roomId}, (roomData) => {
                loadRoom(roomData);
            });
        }
    });
}


module.exports = { postNewRoom, postDeleteRoom, joinRoom };