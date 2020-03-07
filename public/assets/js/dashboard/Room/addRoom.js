const io = require('socket.io-client');

const { addNewRoom } = require('./roomUI');
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

module.exports = { postNewRoom };