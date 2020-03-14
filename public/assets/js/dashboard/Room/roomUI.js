
function showRooms(rooms) {
    const roomContainer = document.querySelector('.roomContainer');
    roomContainer.innerHTML = '';

    // Inserting room according to the namespace to our DOM
    rooms.forEach((roomDetails) => {
        addRooms(roomDetails);
    });

}

function addRooms(roomDetails) {
    const roomContainer = document.querySelector('.roomContainer');
    
    let mode;
    if(roomDetails.privacy === 'Private') {
        mode = `<svg style="margin-right: 6px" fill="#585555" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="12px" height="12px"><path d="M 16 0 C 13.789063 0 11.878906 0.917969 10.6875 2.40625 C 9.496094 3.894531 9 5.824219 9 7.90625 L 9 9 L 12 9 L 12 7.90625 C 12 6.328125 12.390625 5.085938 13.03125 4.28125 C 13.671875 3.476563 14.542969 3 16 3 C 17.460938 3 18.328125 3.449219 18.96875 4.25 C 19.609375 5.050781 20 6.308594 20 7.90625 L 20 9 L 23 9 L 23 7.90625 C 23 5.8125 22.472656 3.863281 21.28125 2.375 C 20.089844 0.886719 18.207031 0 16 0 Z M 9 10 C 7.34375 10 6 11.34375 6 13 L 6 23 C 6 24.65625 7.34375 26 9 26 L 23 26 C 24.65625 26 26 24.65625 26 23 L 26 13 C 26 11.34375 24.65625 10 23 10 Z M 16 15 C 17.105469 15 18 15.894531 18 17 C 18 17.738281 17.597656 18.371094 17 18.71875 L 17 21 C 17 21.550781 16.550781 22 16 22 C 15.449219 22 15 21.550781 15 21 L 15 18.71875 C 14.402344 18.371094 14 17.738281 14 17 C 14 15.894531 14.894531 15 16 15 Z"/></svg>`;
    } else if(roomDetails.privacy === 'Public') {
        mode = `<svg version="1.1" id="Capa_1" fill="#585555" style="margin-right: 6px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 31.416 31.416" style="enable-background:new 0 0 31.416 31.416;" xml:space="preserve"><g><g><path d="M28.755,6.968l-0.47,0.149L25.782,7.34l-0.707,1.129l-0.513-0.163L22.57,6.51l-0.289-0.934L21.894,4.58l-1.252-1.123l-1.477-0.289l-0.034,0.676l1.447,1.412l0.708,0.834L20.49,6.506l-0.648-0.191L18.871,5.91l0.033-0.783l-1.274-0.524l-0.423,1.841l-1.284,0.291l0.127,1.027l1.673,0.322l0.289-1.641l1.381,0.204l0.642,0.376h1.03l0.705,1.412l1.869,1.896l-0.137,0.737l-1.507-0.192l-2.604,1.315l-1.875,2.249l-0.244,0.996h-0.673l-1.254-0.578l-1.218,0.578l0.303,1.285l0.53-0.611l0.932-0.029l-0.065,1.154l0.772,0.226l0.771,0.866l1.259-0.354l1.438,0.227l1.67,0.449l0.834,0.098l1.414,1.605l2.729,1.605l-1.765,3.372l-1.863,0.866l-0.707,1.927l-2.696,1.8l-0.287,1.038c6.892-1.66,12.019-7.851,12.019-15.253C31.413,12.474,30.433,9.465,28.755,6.968z"/><path d="M17.515,23.917l-1.144-2.121l1.05-2.188l-1.05-0.314l-1.179-1.184l-2.612-0.586l-0.867-1.814v1.077h-0.382l-2.251-3.052v-2.507L7.43,8.545L4.81,9.012H3.045L2.157,8.43L3.29,7.532L2.16,7.793c-1.362,2.326-2.156,5.025-2.156,7.916c0,8.673,7.031,15.707,15.705,15.707c0.668,0,1.323-0.059,1.971-0.137l-0.164-1.903c0,0,0.721-2.826,0.721-2.922C18.236,26.357,17.515,23.917,17.515,23.917z"/><path d="M5.84,5.065l2.79-0.389l1.286-0.705l1.447,0.417l2.312-0.128l0.792-1.245l1.155,0.19l2.805-0.263L19.2,2.09l1.09-0.728l1.542,0.232l0.562-0.085C20.363,0.553,18.103,0,15.708,0C10.833,0,6.474,2.222,3.596,5.711h0.008L5.84,5.065z M16.372,1.562l1.604-0.883l1.03,0.595l-1.491,1.135l-1.424,0.143l-0.641-0.416L16.372,1.562z M11.621,1.691l0.708,0.295l0.927-0.295l0.505,0.875l-2.14,0.562l-1.029-0.602C10.591,2.526,11.598,1.878,11.621,1.691z"/></g></g></svg>`;
    }
    const roomHTML = `
        <div class="room anim" data-id="${roomDetails._id}" data-nsId="${roomDetails.workSpaceId}" data-ns="${roomDetails.endPoint}" data-animtochilds="false" data-animDelay="${0.1}" data-animchilddelays="0.1" data-animdirection="leftToRight" data-startoffset="3px">
            <div class="room-name">
                ${mode}                    
                <span># </span><span class="roomName">${roomDetails.name}</span>
                <div class="room-notification" data-nothing="${roomDetails.nothing}"></div>
            </div>
            <i class="pointer material-icons delete-room">delete</i>
            <hr>
        </div>
    `;
    roomContainer.insertAdjacentHTML('beforeend', roomHTML);

    const rooms = roomContainer.querySelectorAll('.room.anim');
    const lastRoom = rooms[rooms.length-1];

    const { addModal } = require('../Modal/addModal');

    const { joinRoom } = require('./addRoom');
    

    lastRoom.querySelector('i.delete-room').addEventListener('click', function(e) {
        addModal('CONFIRM', {
            roomDetails: {
                roomId: this.parentElement.dataset.id,
                roomNsId: this.parentElement.dataset.nsid,
                nsEndPoint: this.parentElement.dataset.ns,
                roomName: this.parentElement.querySelector('.roomName').innerText
            }
        });
    });

    lastRoom.querySelector('.room-name').addEventListener('click', function(e) {
        
        joinRoom({
            nsId: roomDetails.workSpaceId,
            roomId: roomDetails._id
        });
    })

}


function addNewRoom(roomDetails, workSpace) {
    const roomContainer = document.querySelector('.roomContainer');
    
    let mode;
    if(roomDetails.privacy === 'Private') {
        mode = `<svg style="margin-right: 6px" fill="#585555" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" width="12px" height="12px"><path d="M 16 0 C 13.789063 0 11.878906 0.917969 10.6875 2.40625 C 9.496094 3.894531 9 5.824219 9 7.90625 L 9 9 L 12 9 L 12 7.90625 C 12 6.328125 12.390625 5.085938 13.03125 4.28125 C 13.671875 3.476563 14.542969 3 16 3 C 17.460938 3 18.328125 3.449219 18.96875 4.25 C 19.609375 5.050781 20 6.308594 20 7.90625 L 20 9 L 23 9 L 23 7.90625 C 23 5.8125 22.472656 3.863281 21.28125 2.375 C 20.089844 0.886719 18.207031 0 16 0 Z M 9 10 C 7.34375 10 6 11.34375 6 13 L 6 23 C 6 24.65625 7.34375 26 9 26 L 23 26 C 24.65625 26 26 24.65625 26 23 L 26 13 C 26 11.34375 24.65625 10 23 10 Z M 16 15 C 17.105469 15 18 15.894531 18 17 C 18 17.738281 17.597656 18.371094 17 18.71875 L 17 21 C 17 21.550781 16.550781 22 16 22 C 15.449219 22 15 21.550781 15 21 L 15 18.71875 C 14.402344 18.371094 14 17.738281 14 17 C 14 15.894531 14.894531 15 16 15 Z"/></svg>`;
    } else if(roomDetails.privacy === 'Public') {
        mode = `<svg version="1.1" id="Capa_1" fill="#585555" style="margin-right: 6px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 31.416 31.416" style="enable-background:new 0 0 31.416 31.416;" xml:space="preserve"><g><g><path d="M28.755,6.968l-0.47,0.149L25.782,7.34l-0.707,1.129l-0.513-0.163L22.57,6.51l-0.289-0.934L21.894,4.58l-1.252-1.123l-1.477-0.289l-0.034,0.676l1.447,1.412l0.708,0.834L20.49,6.506l-0.648-0.191L18.871,5.91l0.033-0.783l-1.274-0.524l-0.423,1.841l-1.284,0.291l0.127,1.027l1.673,0.322l0.289-1.641l1.381,0.204l0.642,0.376h1.03l0.705,1.412l1.869,1.896l-0.137,0.737l-1.507-0.192l-2.604,1.315l-1.875,2.249l-0.244,0.996h-0.673l-1.254-0.578l-1.218,0.578l0.303,1.285l0.53-0.611l0.932-0.029l-0.065,1.154l0.772,0.226l0.771,0.866l1.259-0.354l1.438,0.227l1.67,0.449l0.834,0.098l1.414,1.605l2.729,1.605l-1.765,3.372l-1.863,0.866l-0.707,1.927l-2.696,1.8l-0.287,1.038c6.892-1.66,12.019-7.851,12.019-15.253C31.413,12.474,30.433,9.465,28.755,6.968z"/><path d="M17.515,23.917l-1.144-2.121l1.05-2.188l-1.05-0.314l-1.179-1.184l-2.612-0.586l-0.867-1.814v1.077h-0.382l-2.251-3.052v-2.507L7.43,8.545L4.81,9.012H3.045L2.157,8.43L3.29,7.532L2.16,7.793c-1.362,2.326-2.156,5.025-2.156,7.916c0,8.673,7.031,15.707,15.705,15.707c0.668,0,1.323-0.059,1.971-0.137l-0.164-1.903c0,0,0.721-2.826,0.721-2.922C18.236,26.357,17.515,23.917,17.515,23.917z"/><path d="M5.84,5.065l2.79-0.389l1.286-0.705l1.447,0.417l2.312-0.128l0.792-1.245l1.155,0.19l2.805-0.263L19.2,2.09l1.09-0.728l1.542,0.232l0.562-0.085C20.363,0.553,18.103,0,15.708,0C10.833,0,6.474,2.222,3.596,5.711h0.008L5.84,5.065z M16.372,1.562l1.604-0.883l1.03,0.595l-1.491,1.135l-1.424,0.143l-0.641-0.416L16.372,1.562z M11.621,1.691l0.708,0.295l0.927-0.295l0.505,0.875l-2.14,0.562l-1.029-0.602C10.591,2.526,11.598,1.878,11.621,1.691z"/></g></g></svg>`;
    }
    const roomHTML = `
        <div class="room anim" data-id="${roomDetails._id}" data-nsId="${workSpace._id}" data-ns="${workSpace.endPoint}" data-animtochilds="false" data-animDelay="${0.1}" data-animchilddelays="0.1" data-animdirection="leftToRight" data-startoffset="3px">
            <div class="room-name">
                ${mode}                    
                <span># </span><span class="roomName">${roomDetails.name}</span>
                <div class="room-notification" data-nothing="${roomDetails.nothing}"></div>
            </div>
            <i class="pointer material-icons delete-room">delete</i>
            <hr>
        </div>
    `;
    roomContainer.insertAdjacentHTML('beforeend', roomHTML);

    const rooms = roomContainer.querySelectorAll('.room.anim');
    const lastRoom = rooms[rooms.length-1];

    const { addModal } = require('../Modal/addModal');

    const { joinRoom } = require('./addRoom');
    

    lastRoom.querySelector('i.delete-room').addEventListener('click', function(e) {
        addModal('CONFIRM', {
            roomDetails: {
                roomId: this.parentElement.dataset.id,
                roomNsId: this.parentElement.dataset.nsid,
                nsEndPoint: this.parentElement.dataset.ns,
                roomName: this.parentElement.querySelector('.roomName').innerText
            }
        });
    });

    lastRoom.querySelector('.room-name').addEventListener('click', function(e) {
        
        joinRoom({
            nsId: workSpace._id,
            roomId: roomDetails._id
        });
    })

}

function deleteRooom(roomDetails) {
    const roomContainer = document.querySelector('.roomContainer');

    const room = roomContainer.querySelector(`.room[data-id="${roomDetails.roomId}"][data-nsId="${roomDetails.nsId}"]`);

    roomContainer.removeChild(room);

}

function loadRoom(roomDetails) {
    const curRoomName = document.querySelector('.current-room-name > span');

    loadMessageToRoom(roomDetails.messages);
    curRoomName.innerHTML = roomDetails.name.toUpperCase();

    // Removing Notifications
    const room = document.querySelector(`.room[data-id="${roomDetails._id}"]`);
    if(room) {
        room.querySelector('.room-notification').dataset.nothing = "true";
        const notifiedRoom = document.querySelectorAll('.nameSpaceDetails-Room_container .room-notification[data-nothing="false"]');
        console.log(notifiedRoom);
        if(notifiedRoom.length === 0) {
            const currentNs = document.querySelector('.nameSpaceDetails-Room_container').dataset.nsendpoint;
            const nsToRemove = document.querySelector(`.name_space[data-ns="${currentNs}"]`);
            nsToRemove.querySelector('.ns-notification').dataset.nothing = "true";
        }
    }

    // Injecting Room Id
    const roomContainer = document.querySelector('.room-details');
    const msgDispContainer = document.querySelector('.message-display__container');
    roomContainer.dataset.roomid = roomDetails._id.toString();
    msgDispContainer.dataset.roomid = roomDetails._id.toString();
}

function loadMessageToRoom(messages) {
    const messageContainer = document.querySelector('.message-display__container');
    messageContainer.innerHTML = "";
    messages.forEach(message => {
        const messageHtml = `
            <div class="message">
                <div class="message-inner">
                    <div class="user-img">
                        <img src="${message.user.image}" class="message-user_dp" alt="">
                    </div>
                    <div class="message-body">
                        <div class="message-header">
                            <div class="user">
                                <span class="message-user_name">${message.user.name}</span>
                            </div>
                            <div class="options pointer">
                                <i class="material-icons">more_vert</i>
                            </div>
                        </div>
                        <div class="message-data">
                            <p>${message.body}</p>
                        </div>
                        <span class="message-time_stamp">${message.time}</span>
                        <div class="message-status">
                            <i class="material-icons">done_all</i>
                        </div>
                    </div>
                </div>
                <hr>
            </div>
        `;
        messageContainer.insertAdjacentHTML('afterbegin', messageHtml);
    });
    messageContainer.scrollTo({
        left: 0,
        top: messageContainer.scrollHeight,
        behavior: "smooth"
    });
}

function addMessageToRoom(messageObj, roomId, nsEndPoint) {
    const messageContainer = document.querySelector(`.message-display__container[data-roomid="${roomId}"]`);
    if(messageContainer) {
        const messageHtml = `
            <div class="message">
                <div class="message-inner">
                    <div class="user-img">
                        <img src="${messageObj.user.image}" class="message-user_dp" alt="">
                    </div>
                    <div class="message-body">
                        <div class="message-header">
                            <div class="user">
                                <span class="message-user_name">${messageObj.user.name}</span>
                            </div>
                            <div class="options pointer">
                                <i class="material-icons">more_vert</i>
                            </div>
                        </div>
                        <div class="message-data">
                            <p>${messageObj.body}</p>
                        </div>
                        <span class="message-time_stamp">${messageObj.time}</span>
                        <div class="message-status">
                            <i class="material-icons">done_all</i>
                        </div>
                    </div>
                </div>
                <hr>
            </div>
        `;
        messageContainer.insertAdjacentHTML('afterbegin', messageHtml);
        messageContainer.scrollTo({
            left: 0,
            top: messageContainer.scrollHeight,
            behavior: "smooth"
        });
    } else {
        // Handling the case where client is not in the same room
        // Two Cases are here

        // Checking case in two of those
        const nsContainer = document.querySelector(`.nameSpaceDetails-Room_container[data-nsendpoint="${nsEndPoint}"]`);
        const roomContainer = document.querySelector('.roomContainer');
        const nameSpaceContainer = document.querySelector('.nameSpaceContainer');

        // 1. When the client is in the same workspace but same room
        // if(nsContainer) {
            const room = roomContainer.querySelector(`.room[data-id="${roomId}"]`);
            if(room) {
                room.querySelector('.room-notification').dataset.nothing = "false";
            }
            const ns = nameSpaceContainer.querySelector(`.name_space[data-ns="${nsEndPoint}"]`);
            console.log(ns, nsEndPoint);
            ns.querySelector('.ns-notification').dataset.nothing = "false";
        // }

        // 2. When the client is completely in another workspace 
    }
}

function updateClients(numOfClients) {
    const curRoomName = document.querySelector('.users-online > p');

    curRoomName.innerHTML = numOfClients;    
}

module.exports = { showRooms, addNewRoom, addRooms, deleteRooom, loadRoom, updateClients, addMessageToRoom };