const io = require('socket.io-client');

const { addNewRoom, deleteRooom } = require('./roomUI');
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
    const nsEndPoint = window.location.search.split('nsEndPoint=')[1];

    const nsSocket = getNsSocket();

    nsSocket.emit('joinRoom', {roomId: roomDetails.roomId});

    console.log(nsSocket);
    
    
    // await fetch(`${window.location.origin}/dashboard/workspace?isLoad=true&joinRoom=true&nsEndPoint=${nsEndPoint}`, {
    //     method: "GET"
    // });
    
    // const res = await fetch(`${window.location.origin}/dashboard/workspace?&joinRoom=true&nsEndPoint=${nsEndPoint}`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //         roomId: roomDetails.roomId,
    //         nsId: roomDetails.nsId,
    //     })
    // });

    // const data = await res.json();

    // console.log(data);

    // deleteRooom(data.acknowledgment.roomDetails);
}


module.exports = { postNewRoom, postDeleteRoom, joinRoom };