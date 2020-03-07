const io = require('socket.io-client');

const { showRooms, addNewRoom, deleteRooom } = require('../Room/roomUI'); 

let nsSocket;

function getNsSocket() {
    return nsSocket;
} 

async function connectToNs(nsEndPoint) {


    if (window.history.replaceState) {
        //prevents browser from storing history with each change:
        window.history.replaceState('Workspace', `${nsEndPoint.slice(1)}`, `/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint.slice(1)}`);
     }

    // Blurring the whole Workspace area between interchanging the workspace
    const root = document.getElementById('root');
    root.classList.add('namespace-interchange');
    
    await fetch(`${window.location.origin}/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}`, {
        method: "GET"
    });

    nsSocket = io(`${window.location.origin}${nsEndPoint}`);

    

    nsSocket.on('clients', function(data) {
        console.log(data);
    })  

    nsSocket.on('connectedByLink', function(data) {
        console.log(data);
    });

    nsSocket.on('connectedToNamespace', function(data) {
        showRooms(data.rooms, data.workSpace);

        // Injecting the Namespace Name
        const nameSpaceNameHolder = document.querySelector('.namespace-name > h3');
        nameSpaceNameHolder.innerHTML = data.workSpace.title.toUpperCase();

        // Removing the blur effect
        root.classList.remove('namespace-interchange');
    });

    nsSocket.on('roomCreated', data => {
        console.log(data);
        addNewRoom(data.roomDetails, data.workSpace);
    });

    nsSocket.on('roomDeleted', data => {
        console.log(data);
        deleteRooom(data);
    });

    nsSocket.on('disconnected', function(data) {
        console.log(data);
    });

    nsSocket.on('roomJoined', data => {
        // console.clear();
        console.log(data);
    })

    nsSocket.on('roomLeft', data => {
        // console.clear();
        console.log(data);
    })
    
}

function isItSameNs(nsSocket, nsEndPoint) {
    if(nsSocket) {
        
        if(nsEndPoint === nsSocket.nsp) {
            console.log('it same nsSocket');
            return true;
        } else {
            nsSocket.close();
            return false;
        }

    } else {
        return false;
    }
}

async function nsListeners() {
    const nameSpaces = document.querySelectorAll('.nameSpaceContainer > .name_space');

    const res = await fetch(`${window.location.origin}/dashboard/workspace?defaultOne=true`, {
        method: "GET"
    });

    const data = await res.json();

    console.log(data);
    
    
    connectToNs(data.acknowledgment.config.defaultWorkSpace.endPoint);

    nameSpaces.forEach(ns => {
        ns.addEventListener('click', async (e) => {
            const isIt = isItSameNs(nsSocket, ns.dataset.ns);
            if(!isIt) {           
                connectToNs(ns.dataset.ns);
            }
        });
    })
}

module.exports = { connectToNs, nsListeners, getNsSocket };