const io = require('socket.io-client');
const { updateStatus } = require('../User/friend'); 
const { updateNotificationCount } = require('../User/notification'); 
const { pushRecievedMessageToUI, showTypingStatus } = require('../User/message'); 
const { addMessageToRoom } = require('../Room/roomUI'); 

const { showRooms, loadRoom, addNewRoom, addRooms, deleteRooom, updateClients } = require('../Room/roomUI'); 
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
    // const root = document.getElementById('root');
    // root.classList.add('namespace-interchange');

    // Injecting nsid to page
    // const nsContainer = document.querySelector('.nameSpaceDetails-Room_container');
    // nsContainer.dataset.nsendpoint = nsEndPoint;
    
    // Loading Connected Namespace
    await fetch(`${window.location.origin}/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}`, {
        method: "GET"
    });

    // Creating connection to socket.io with custom namespace - 'nsEndPoint'
    nsSocket = io(`${window.location.origin}${nsEndPoint}`);
    console.log('Connecting to NS!', nsSocket);

    // // Working with sessionStorage
    // const messages = sessionStorage.getItem(`nsMessages-${nsEndPoint}`);
    // if(!messages) {
    //     fetchAllMessages(nsEndPoint);
    // }

    // Listeing all Socket Events
    nsSocket.on('clients', function(data) {
        console.log(data);
    });

    nsSocket.on('connectedByLink', function(data) {
        console.log(data);
    });

    nsSocket.on('connectedToNamespace', async function(data) {

        // Working with sessionStorage
        let jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        if(!jsonRooms) {
            await fetchRooms(nsEndPoint);
            jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        }
        const rooms = JSON.parse(jsonRooms);
        console.log(rooms);
        // showRooms(rooms);

        nsSocket.emit('joinDefaultRoom', {nsEndPoint: nsEndPoint}, (roomData) => {
            console.log(roomData);
            // loadRoom(roomData);
        });

        // Injecting the Namespace Name
        // const nameSpaceNameHolder = document.querySelector('.namespace-name > .namespace-event > h3');
        // const nsOptions = document.querySelector('.namespace-name > .ns-options.dropdown');
        // nameSpaceNameHolder.innerHTML = rooms[0].workSpaceTitle.toUpperCase();
        // nsOptions.dataset.id =  rooms[0].endPoint;

        // Removing the blur effect
        // root.classList.remove('namespace-interchange');
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
            console.log('Message Recieved', data);
            pushRecievedMessageToUI(data);
        } else if(data.type === 'typing') {
            showTypingStatus(data.type, data.sendingUser);
        } else if(data.type === 'stopped_typing') {
            showTypingStatus(data.type, data.sendingUser);
        }
    });

    nsSocket.on('roomCreated', async(data) => {

        // Working with sessionStorage - for rooms
        let jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        if(!jsonRooms) {
            await fetchRooms(nsEndPoint);
            jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        }
        const rooms = JSON.parse(jsonRooms);
        rooms.push(data.roomDetails);
        sessionStorage.setItem(`nsRooms-${nsEndPoint}`, JSON.stringify(rooms));
        console.log(rooms);

        // Working with sessionStorage - for workspaces
        let jsonWorkspaces = sessionStorage.getItem(`all_workspaces`);
        if(jsonWorkspaces) {
            const workspaces = JSON.parse(jsonWorkspaces);
            workspaces[data.roomDetails.workSpaceId].rooms.push({
                _id: data.roomDetails._id,
                name: data.roomDetails.name
            });
            sessionStorage.setItem(`all_workspaces`, workspaces);
        }
        
        console.log(data);
        addRooms(data.roomDetails);
    });

    nsSocket.on('roomDeleted', async(data) => {

        // Working with sessionStorage
        let jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        if(!jsonRooms) {
            await fetchRooms(nsEndPoint);
            jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        }
        let rooms = JSON.parse(jsonRooms);
        console.log(rooms);
        rooms = rooms.filter(cur => cur._id.toString() !== data.roomId.toString());
        sessionStorage.setItem(`nsRooms-${nsEndPoint}`, JSON.stringify(rooms));

        // Working with sessionStorage - for workspaces
        let jsonWorkspaces = sessionStorage.getItem(`all_workspaces`);
        if(jsonWorkspaces) {
            const workspaces = JSON.parse(jsonWorkspaces);
            workspaces[data.roomDetails.nsId].rooms = workspaces[data.roomDetails.nsId].rooms.filter(cur => cur._id.toString() !== data.roomId.toString());
            sessionStorage.setItem(`all_workspaces`, workspaces);
        }

        console.log(data);
        deleteRooom(data);
    });

    nsSocket.on('disconnected', function(data) {
        console.log(data);
        // updateClients(data.clients.length);
        const roomId = document.querySelector('.room-details').dataset.roomid;
        nsSocket.emit('roomClients', {roomId: roomId}, (data) => {
            updateClients(data.length);
        })
    });

    nsSocket.on('roomJoined', data => {
        // console.clear();
        console.log(data);
        updateClients(data.clients.length);
    });

    nsSocket.on('roomLeft', data => {
        // console.clear();
        console.log(data.clients);
        updateClients(data.clients.length);
    });

    nsSocket.on('messageToRoom', async(data) => {
        if(data.type === "toAllConnectedClients") {

            // Working with sessionStorage
            let jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            if(!jsonRooms) {
                await fetchRooms(data.nsEndPoint);
                jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            }
            let rooms = JSON.parse(jsonRooms);
            const room = rooms.filter(cur => cur._id.toString() === data.roomId.toString());
            rooms = rooms.map(cur => {
                if(cur._id.toString() === data.roomId.toString()) {
                    cur.messages.push(data.messageObj);
                    return cur;
                }
                return cur;
            });
            sessionStorage.setItem(`nsRooms-${data.nsEndPoint}`, JSON.stringify(rooms));

            addMessageToRoom(data.messageObj, data.roomId, data.nsEndPoint);
        } else if(data.type === 'toMentions') {

            // Pushing Notification to UI
            updateNotificationCount(data.count);
        }
    });
    
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

        const endPoint = data.acknowledgment.config.defaultWorkSpace.endPoint;

        loadNamespace(endPoint);


        connectToNs(endPoint);
    }

    nameSpaces.forEach(ns => {
        ns.addEventListener('click', async (e) => {
            
            loadNamespace(ns.dataset.ns)
            const isIt = isItSameNs(nsSocket, ns.dataset.ns);
            if(!isIt) {           
                connectToNs(ns.dataset.ns);
            }
        });
    })
}

async function loadNamespace(endPoint) {

    // Injecting nsid to page
    const nsContainer = document.querySelector('.nameSpaceDetails-Room_container');
    nsContainer.dataset.nsendpoint = endPoint;

    // Working with sessionStorage
    let jsonRooms = sessionStorage.getItem(`nsRooms-${endPoint}`);
    if(!jsonRooms) {
        await fetchRooms(endPoint);
        jsonRooms = sessionStorage.getItem(`nsRooms-${endPoint}`);
    }
    const rooms = JSON.parse(jsonRooms);
    console.log(rooms);
    showRooms(rooms);

    // Injecting the Namespace Name
    const nameSpaceNameHolder = document.querySelector('.namespace-name > .namespace-event > h3');
    const nsOptions = document.querySelector('.namespace-name > .ns-options.dropdown');
    nameSpaceNameHolder.innerHTML = rooms[0].workSpaceTitle.toUpperCase();
    nsOptions.dataset.id =  rooms[0].endPoint;

    loadRoom(rooms[0]);
}

// async function fetchAllMessages(nsEndPoint) {
    
//     const res = await fetch(`${window.location.origin}/message/fetch?byNs=true&nsEndPoint=${nsEndPoint}`, {
//         method: "GET"
//     });

//     const data = await res.json();
    
//     console.log(data);

//     sessionStorage.setItem(`nsMessages-${nsEndPoint}`, JSON.stringify(data.acknowledgment.rooms));
// }

async function fetchRooms(nsEndPoint) {
    
    const res = await fetch(`${window.location.origin}/dashboard/fetch?rooms=true&nsEndPoint=${nsEndPoint}`, {
        method: "GET"
    });

    const data = await res.json();
    
    console.log(data);

    sessionStorage.setItem(`nsRooms-${nsEndPoint}`, JSON.stringify(data.acknowledgment.rooms));
}

module.exports = { connectToNs, nsListeners, fetchRooms, getNsSocket };