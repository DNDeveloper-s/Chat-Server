const io = require('socket.io-client');
const { updateStatus } = require('../User/friend'); 
const { updateNotificationCount } = require('../User/notification'); 
const { pushRecievedMessageToUI, showTypingStatus } = require('../User/message'); 
const { addMessageToRoom } = require('../Room/roomUI'); 
const { loader } = require('../../utilities');

const { showRooms, loadRoom, addNewRoom, addRooms, deleteRooom, updateClients } = require('../Room/roomUI'); 
// const { joinRoom } = require('../Room/addRoom');

let nsSocket;

function getNsSocket() {
    return nsSocket;
} 

async function connectToNs(nsEndPoint, dontJoinDefaultRoom) {
    const { fetchRooms } = require('../../utilities');
    let connecting = true;

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

    // Global variables
    const MAX_RECONNECTS = 500;
    const RECONNECTION_DELAY = 100000;

    // Creating connection to socket.io with custom namespace - 'nsEndPoint'
    nsSocket = io(`${window.location.origin}${nsEndPoint}`, {
        reconnectionDelay: RECONNECTION_DELAY,
        reconnectionAttempts: MAX_RECONNECTS
    });
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

    nsSocket.on('ping', function() {
		console.log(`Socket :: Ping sent.`);
    })

    nsSocket.on('pong', function(ms) {
		console.log(`Socket :: Latency :: ${ms} ms`);
    })

    nsSocket.on('checkStatus', (data) => {
        console.log(data);
        nsSocket.emit('connectedSuc');
    })

    nsSocket.on('connectedByLink', function(data) {
        
    });

    nsSocket.on('connectedToNamespace', async function(data) {

        // Working with sessionStorage
        let jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        if(!jsonRooms) {
            await fetchRooms();
            jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        }
        const rooms = JSON.parse(jsonRooms);
        console.log(rooms);
        // showRooms(rooms);

        if(!dontJoinDefaultRoom) {
            nsSocket.emit('joinDefaultRoom', {nsEndPoint: nsEndPoint}, (roomData) => {
                console.log(roomData);
                // loadRoom(roomData);
            });
        } else {
            
        }

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
            await fetchRooms();
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
            workspaces[data.roomDetails.endPoint].rooms.push({
                _id: data.roomDetails._id,
                name: data.roomDetails.name
            });
            sessionStorage.setItem(`all_workspaces`, JSON.stringify(workspaces));
        }
        
        console.log(data);
        addRooms(data.roomDetails);
    });

    nsSocket.on('roomDeleted', async(data) => {

        // Working with sessionStorage
        let jsonRooms = sessionStorage.getItem(`nsRooms-${nsEndPoint}`);
        if(!jsonRooms) {
            await fetchRooms();
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
            workspaces[data.nsEndPoint].rooms = workspaces[data.nsEndPoint].rooms.filter(cur => cur._id.toString() !== data.roomId.toString());
            sessionStorage.setItem(`all_workspaces`, JSON.stringify(workspaces));
        }

        console.log(data);
        deleteRooom(data);
    });

    nsSocket.on('messageToRoom', async(data) => {
        console.log(data);
        if(data.type === "toAllConnectedClients") {

            // Working with sessionStorage
            let jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            if(!jsonRooms) {
                await fetchRooms();
                jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            }
            let rooms = JSON.parse(jsonRooms);
            rooms = rooms.filter(cur => {
                if(cur._id.toString() === data.roomId.toString()) {
                    cur.messages.push(data.messageObj);
                }
                return cur;
            });
            sessionStorage.setItem(`nsRooms-${data.nsEndPoint}`, JSON.stringify(rooms));

            addMessageToRoom(data.messageObj, data.roomId, data.nsEndPoint, false);
        } else if(data.type === 'toMentions') {

            // Pushing Notification to UI
            updateNotificationCount(data.count);

            // Pushing mention to session storage
            const jsonData = sessionStorage.getItem('mentions');
            const arr = JSON.parse(jsonData);
            arr.push(data.mentionDetails);
            sessionStorage.setItem('mentions', arr);

        } else if(data.type === 'toSender') {

            // Working with sessionStorage
            let jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            if(!jsonRooms) {
                await fetchRooms();
                jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            }
            let rooms = JSON.parse(jsonRooms);
            rooms = rooms.filter(cur => {
                if(cur._id.toString() === data.roomId.toString()) {
                    cur.messages.push(data.messageObj);
                }
                return cur;
            });

            const loader = document.querySelector('.image-loader');
            if(loader) {
                const imageHtml = `<span class="image-input"><img src="${data.image_path}" alt="${data.image_name}"></span>`;

                loader.parentElement.insertAdjacentHTML('afterbegin', imageHtml);  
                loader.remove();
            } 
            
            sessionStorage.setItem(`nsRooms-${data.nsEndPoint}`, JSON.stringify(rooms));

            // const messageContainer = document.querySelector(`.message-display__container > .messages[data-roomid="${data.roomId}"]`);
            // messageContainer.querySelector('.message-status > i').innerHTML = 'done_all';
            // Working with sessionStorage
            // let jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            // if(!jsonRooms) {
            //     await fetchRooms();
            //     jsonRooms = sessionStorage.getItem(`nsRooms-${data.nsEndPoint}`);
            // }
            // let rooms = JSON.parse(jsonRooms);
            // const room = rooms.filter(cur => cur._id.toString() === data.roomId.toString());
            // rooms = rooms.map(cur => {
            //     if(cur._id.toString() === data.roomId.toString()) {
            //         cur.messages.push(data.messageObj);
            //         return cur;
            //     }
            //     return cur;
            // });
            // sessionStorage.setItem(`nsRooms-${data.nsEndPoint}`, JSON.stringify(rooms));

            // addMessageToRoom(data.messageObj, data.roomId, data.nsEndPoint, true);
        }
    });

    nsSocket.on('toClients', async (data) => {
        updateStatusToClients(data);
    });

    nsSocket.on('workSpace', async(data) => {
        if(data.type === 'update') {
            console.log(data);
            const workSpaceTitle = data.workSpace.title;
            const workSpaceImage = data.workSpace.image;

            if(data.change) {
                const nsNameContainer = document.querySelector('.namespace-name > .namespace-event > h3');
                const nsImageContainer = document.querySelector(`.name_space.image_holder[data-ns="${data.nsEndPoint}"] > img`);
            
                nsNameContainer.innerHTML = workSpaceTitle;
                nsImageContainer.setAttribute('title', workSpaceTitle);
                
                nsImageContainer.setAttribute('src', workSpaceImage);
            }
            

            // Updating to Session Storage
            const jsonData = sessionStorage.getItem('all_workspaces');
            const storageData = JSON.parse(jsonData);
            console.log(storageData);
            storageData[data.nsEndPoint].title = workSpaceTitle;
            storageData[data.nsEndPoint].image = workSpaceImage;

            sessionStorage.setItem('all_workspaces', JSON.stringify(storageData));

        } else if(data.type === 'remove') {
            const nsEndPoint = data.nsEndPoint;
            const defaultWorkSpaceEndPoint = data.defaultWorkSpace;

            const namespaceItem = document.querySelector(`.name_space.image_holder[data-ns="${nsEndPoint}"]`);
            namespaceItem.remove();

            console.log(data);
            
            if(defaultWorkSpaceEndPoint) {
                loadNamespace(defaultWorkSpaceEndPoint);
                connectToNs(defaultWorkSpaceEndPoint);  
            } 

            // Update key 'all_workspaces' in sessionStorage for deleted workSpace
            const jsonData = sessionStorage.getItem('all_workspaces');
            const datae = JSON.parse(jsonData);
            datae[nsEndPoint] = undefined;

            sessionStorage.setItem(`all_workspaces`, JSON.stringify(datae));
        }
    });

    nsSocket.on('role', data => {
        const jsonData = sessionStorage.getItem('all_workspaces');
        const workspaces = JSON.parse(jsonData);
        if(data.type === 'role_added') {
            workspaces[data.nsEndPoint].roles.custom.push(data.roleObj);

        } else if(data.type === 'user_added') {
            workspaces[data.nsEndPoint].roles.custom.filter(role => {
                if(role.roleTag === data.roleTag) {
                    role.members.push(data.user);
                }
            });

        } else if(data.type === 'user_removed') {
            workspaces[data.nsEndPoint].roles.custom.filter(role => {
                if(role.roleTag === data.roleTag) {
                    role.members = role.members.filter(member => member._id.toString() !== data.userId.toString());
                }
            });
            
        } else if(data.type === 'permission_edit') {
            workspaces[data.nsEndPoint].roles.custom.filter(role => {
                if(role.roleTag === data.roleTag) {
                    role.permissions[data.permission] = data.value;
                }
            });
        } else if(data.type === 'role_deleted') {
            workspaces[data.nsEndPoint].roles.custom = workspaces[data.nsEndPoint].roles.custom.filter(role => role.roleTag !== data.roleTag);
        } else if(data.type === 'color_updated') {
            workspaces[data.nsEndPoint].roles.custom.filter(cur => {
                if(cur.roleTag === data.roleTag) {
                    cur.color = data.color;
                }
            })
            // Setting role color to UI
            const role_tag = document.querySelector(`.roles_container > .role_tag[data-roletag="${data.roleTag}"]`);
            if(role_tag) {
                const role_name = role_tag.querySelector(`.role_name`);
                const show_role_name = document.querySelector('.show_role_name');
                const role_cross = role_tag.querySelector('.del_btn');
                role_tag.style.borderColor = data.color;
                role_name.style.color = data.color;
                show_role_name.style.color = data.color;
                role_cross.style.color = data.color;
            }
        }

        sessionStorage.setItem('all_workspaces', JSON.stringify(workspaces));
    });

    let connected;
    const disconnectedModal = document.querySelector('.disconnected-modal');

    // nsSocket.on('connect', (data) => {
    //     connected = true;
    //     disconnectedModal.classList.remove('enable');
    // })

    // nsSocket.on('reconnecting', (delay, attempt) => {
    //     console.log(attempt);
    //     if(attempt === MAX_RECONNECTS) {
    //         console.log('Not able to reconnect succesfully!');
    //     }
    // })

    // nsSocket.on('reconnect_error', (error) => {
    //     if(error) {
    //         disconnectedModal.classList.add('enable');
    //         console.log('Disconnected from the server!', error.message);
    //     }
    // });

    // Disconnection Handler
    // nsSocket.on('disconnect', async (data) => {
    //     connecting = false;
    // });
    
    // nsSocket.on('reconnect', (attemptNumber) => {
    //     if(!connecting) {
    //         loadNamespace(nsEndPoint);
    //         connectToNs(nsEndPoint);
    //         disconnectedModal.classList.remove('enable');
    //         console.log('Reconnected!', attemptNumber);
    //     }
    // })
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
            const isIt = isItSameNs(nsSocket, ns.dataset.ns);
            if(!isIt) {           
                loadNamespace(ns.dataset.ns)
                connectToNs(ns.dataset.ns);
            }
        });
    })
}

async function loadNamespace(endPoint, dontLoadDefaultRoom) {
    const { fetchRooms } = require('../../utilities');

    // Injecting nsid to page
    const nsContainer = document.querySelector('.nameSpaceDetails-Room_container');
    nsContainer.dataset.nsendpoint = endPoint;

    // Working with sessionStorage
    let jsonRooms = sessionStorage.getItem(`nsRooms-${endPoint}`);
    if(!jsonRooms) {
        await fetchRooms();
        jsonRooms = sessionStorage.getItem(`nsRooms-${endPoint}`);
    }
    const rooms = JSON.parse(jsonRooms);
    console.log(rooms);
    showRooms(rooms);

    // Working with sessionStorage
    let jsonData = sessionStorage.getItem(`all_workspaces`);
    const workSpace = JSON.parse(jsonData);

    // Injecting the Namespace Name
    const nameSpaceNameHolder = document.querySelector('.namespace-name > .namespace-event > h3');
    const nsOptions = document.querySelector('.namespace-name > .ns-options.dropdown');
    nameSpaceNameHolder.innerHTML = workSpace[endPoint].title;
    nameSpaceNameHolder.setAttribute('title', workSpace[endPoint].title.toUpperCase());
    nsOptions.dataset.id =  rooms[0].endPoint;

    if(!dontLoadDefaultRoom) {
        loadRoom(rooms[0]);
    }

    // Working with the workspace clients
    // 1. Adding Loader to UI
    const onlineClients = document.querySelector('.workspace-clients > .online-clients');
    const offlineClients = document.querySelector('.workspace-clients > .offline-clients');
    onlineClients.innerHTML = '<div class="loader-container"><svg width="40" height="40"><circle class="loader" cx="20" cy="20" r="17"></circle></svg></div>';
    offlineClients.innerHTML = '<div class="loader-container"><svg width="40" height="40"><circle class="loader" cx="20" cy="20" r="17"></circle></svg></div>';

    loader();

    // Fetching 
    const res = await fetch(`${window.location.origin}/dashboard/fetch?clientsStatus=true&nsEndPoint=${endPoint}`, {
        method: "GET"
    })
    const data = await res.json();

    if(data.acknowledgment.type === "success") {
        const members = data.acknowledgment.members;
        console.log(members);
        clientsUI(members);
    }
}

function clientsUI(members) {
    const onlineClients = document.querySelector('.workspace-clients > .online-clients');
    const offlineClients = document.querySelector('.workspace-clients > .offline-clients');
    onlineClients.innerHTML = '';
    offlineClients.innerHTML = '';
    const userId = document.querySelector('.user_dp.image_holder.remove_sidebar').dataset.userid;
    let className = '';
    members.forEach(member => {
        className = '';
        if(userId.toString() === member._id.toString()) {
            className = 'user_dp';
        }
        const htmlToInject = `
            <div class="client userLink pointer" data-userid="${member._id}" title="${member.name}">
                <div class="image ${className}">
                    <img src="${member.image}" class="message-user_dp" alt="${member.name}">
                    <span class="status" data-status="${member.status}"></span>
                </div>
                <div class="name">
                    <p>${member.name}</p>
                </div>
            </div>
        `;  
        if(member.status === "online") {
            onlineClients.insertAdjacentHTML('beforeend', htmlToInject);
        } else if(member.status === "offline") {
            offlineClients.insertAdjacentHTML('beforeend', htmlToInject);
        }
        const userLinks = document.querySelectorAll('.userLink');
        userLinks.forEach(userLink => {
            if(!userLink.dataset.eventactive) {
                userLink.dataset.eventactive = 'true';
                userLink.addEventListener('click', function(e) {
                    const userId = userLink.dataset.userid;
                    const { addModal } = require('../Modal/addModal');
                    addModal('USER_PROFILE' ,{
                        user: {
                            _id: userId
                        }
                    }); 
                })
            }
        });
    })
}

function updateStatusToClients(data) {
    const clientContainer = document.querySelector('.workspace-clients');
    const client = clientContainer.querySelector(`[data-userid="${data.userDetails._id}"]`);
    const clientStatus = client.querySelector('.status').dataset.status;
    console.log(clientStatus, data.userDetails.status);
    if(clientStatus !== data.userDetails.status) {
        client.remove();
        const htmlToInject = `
            <div class="client userLink pointer" data-userid="${data.userDetails._id}">
                <div class="image">
                    <img src="${data.userDetails.image}" class="message-user_dp" alt="${data.userDetails.name}">
                    <span class="status" data-status="${data.userDetails.status}"></span>
                </div>
                <div class="name">
                    <p>${data.userDetails.name}</p>
                </div>
            </div>
        `;
        const containerToAdd = document.querySelector(`.${data.userDetails.status}-clients`);
        containerToAdd.insertAdjacentHTML('beforeend', htmlToInject);

        // userlink EventListener
        const userLinks = document.querySelectorAll('.userLink');
        userLinks.forEach(userLink => {
            if(!userLink.dataset.eventactive) {
                userLink.dataset.eventactive = 'true';
                userLink.addEventListener('click', function(e) {
                    const userId = userLink.dataset.userid;
                    const { addModal } = require('../Modal/addModal');
                    addModal('USER_PROFILE' ,{
                        user: {
                            _id: userId
                        }
                    }); 
                })
            }
        });
    }
}

module.exports = { connectToNs, nsListeners, getNsSocket, loadNamespace };