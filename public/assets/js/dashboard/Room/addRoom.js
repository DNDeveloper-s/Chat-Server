const io = require('socket.io-client');

const { loadRoom } = require('./roomUI');
const { getNsSocket, fetchRooms } = require('../Namespace/nsFunctionaily');

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

    // nsSocket.emit('leaveRoom', {roomId: leaveRoomId}, (data) => {
    //     if(data.type === "success") {
    //         nsSocket.emit('joinRoom', {roomId: roomDetails.roomId}, (roomData) => {
    //             loadRoom(roomData);
    //         });
    //     }
    // });
    nsSocket.emit('leaveRoom', {roomId: leaveRoomId}, (data) => {
        if(data.type === "success") {
            nsSocket.emit('joinRoom', {roomId: roomDetails.roomId}, async() => {

                // Working with sessionStorage
                let jsonRooms = sessionStorage.getItem(`nsRooms-${roomDetails.nsEndPoint}`);
                if(!jsonRooms) {
                    await fetchRooms(roomDetails.nsEndPoint);
                    jsonRooms = sessionStorage.getItem(`nsRooms-${roomDetails.nsEndPoint}`);
                }
                // console.log(jsonRooms);
                const rooms = JSON.parse(jsonRooms);
                console.log(rooms);
                const room = rooms.filter(cur => cur._id.toString() === roomDetails.roomId.toString());

                loadRoom(room[0]);
            });
        }
    });
}


module.exports = { postNewRoom, postDeleteRoom, joinRoom };