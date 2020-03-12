const io = require('socket.io-client');
const { updateNotificationCount, pushRecievedMessageToUI, updateStatus } = require('../User/friend'); 

const { showRooms, loadRoom, addNewRoom, deleteRooom, updateClients } = require('../Room/roomUI'); 
// const { joinRoom } = require('../Room/addRoom');

let nsSocket;

function getNsSocket() {
    return nsSocket;
} 

async function connectToNs(nsEndPoint) {

    if (!window.location.search.split('&').includes('showUserModalDefault=true') && window.history.replaceState) {
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

    console.log('Connecting to NS!', nsSocket);

    // nsSocket.emit('joinDefaultRoom', {nsEndPoint: nsEndPoint}, (roomData) => {
    //     loadRoom(roomData);
    // });

    nsSocket.on('clients', function(data) {
        console.log(data);
    });

    nsSocket.on('connectedByLink', function(data) {
        console.log(data);
    });

    nsSocket.on('connectedToNamespace', function(data) {
        showRooms(data.rooms, data.workSpace);

        nsSocket.emit('joinDefaultRoom', {nsEndPoint: nsEndPoint}, (roomData) => {
            console.log(roomData);
            
            loadRoom(roomData);
        });

        // Injecting the Namespace Name
        const nameSpaceNameHolder = document.querySelector('.namespace-name > .namespace-event > h3');
        const nsOptions = document.querySelector('.namespace-name > .ns-options.dropdown');
        nameSpaceNameHolder.innerHTML = data.workSpace.title.toUpperCase();
        nsOptions.dataset.id =  data.workSpace.endPoint;

        // Removing the blur effect
        root.classList.remove('namespace-interchange');
    });

    nsSocket.on('notification', data => {
        updateNotificationCount(data.curUser.notifications.count);
        console.clear();
        console.log(data);
    });

    nsSocket.on('statusUpdate', function(data) {
        updateStatus(data.user);
        console.log(data);
    });

    nsSocket.on('message', function(data) {
        if(data.type === 'recieved') {
            console.log('Message Recieved', data.messageObj);
            pushRecievedMessageToUI(data.messageObj);
        }
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
        updateClients(data.clients.length);
    })

    nsSocket.on('roomLeft', data => {
        // console.clear();
        console.log(data.clients.length, data.data);
        updateClients(data.clients.length);
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
       
    if(data.acknowledgment.config.defaultWorkSpace) {
        connectToNs(data.acknowledgment.config.defaultWorkSpace.endPoint);
    }

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