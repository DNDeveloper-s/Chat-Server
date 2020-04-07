const { addModal } = require('./dashboard/Modal/addModal');
// const { addUserModal } = require('./dashboard/User/userUI');
const { messageToRoomHandler } = require('./dashBoard/User/message');
const { fetchMentions } = require('./utilities');
const { workSpaceSettings } = require('./dashboard/Namespace/workSpaceSettings/workspaceSettings');
// const randomize = require('randomatic');

module.exports = () => {
    console.log('counting');
    const addNameSpaceBtn = document.querySelector('.add-name_space');
    addNameSpaceBtn.addEventListener('click', () => {
        console.log('Its clicked!');
        
        console.log(addModal);
        

        addModal('NS');
    });
    const addRoomBtn = document.querySelector('.add-room');
    addRoomBtn.addEventListener('click', () => {
        console.log('Its clicked!');
        
        console.log(addModal);
        addModal('ROOM');
    });
    const logOutBtn = document.querySelector('.logout-btn');
    logOutBtn.addEventListener('click', async () => {

        const res = await fetch(`${window.location.origin}/auth/logout`, {
            method: "POST"
        })

        const data = await res.json();

        if(data.acknowledgment.type === "success") {
            console.log('Done!');
            
            window.location = `${window.location.origin}/auth/ui`;
        }
    });
    const nameSpaceNameHolder = document.querySelector('.namespace-name > .namespace-event');
    const nsDropdown = document.querySelector('.namespace-name > .ns-options.dropdown');
    nameSpaceNameHolder.addEventListener('click', function(e) {
        nsDropdown.classList.add('opened');
        document.querySelector('#root').insertAdjacentHTML('afterbegin', `<div class="back-drop noOpaque"></div>`);
        const backDrop = document.querySelector('.back-drop.noOpaque');
        backDrop.addEventListener('click', removeModal);
        const nsOptions = document.querySelectorAll('.ns-option.removeBackDropOnClick');
        nsOptions.forEach(cur => {
            cur.addEventListener('click', removeModal);
        })

        function removeModal() {
            nsDropdown.classList.remove('opened');
            backDrop.remove();
        }
    });
    const getInvCode = nsDropdown.querySelector('.invite-friend');
    getInvCode.addEventListener('click', async(e) => {
        e.preventDefault();

        addModal(`GETINVCODE`);

        const nsEndPoint = getInvCode.closest('.ns-options').dataset.id.slice(1);


        const res = await fetch(`${window.location.origin}/dashboard/workspace?nsName=${nsEndPoint}&genInvLink=true`, {
            method: "POST"
        });

        data = await res.json();

        if(data.acknowledgment.type === 'success') {
            const modalEl = document.querySelector('.modal[data-id="getInvCode"]');
            modalEl.querySelector('.invite-code').innerHTML = `<p>${data.acknowledgment.link}</p>`
        }
    })
    const workspaceSettings = nsDropdown.querySelector('.workspace-settings');
    workspaceSettings.addEventListener('click', async(e) => {
        e.preventDefault();

        const nsEndPoint = workspaceSettings.closest('.ns-options').dataset.id;

        addModal(`WORKSPACESETTINGS`, {
            nsEndPoint: nsEndPoint
        });
        // const res = await fetch(`${window.location.origin}/dashboard/workspace?nsEndPoint=${nsEndPoint}&getWorkspaceDetails=true`, {
        //     method: "GET"
        // });

        // const data = await res.json();

        // console.log(data);
        
        // if(data.acknowledgment.type === 'success') {
        workSpaceSettings();
            // workSpaceSettings(data);
        // }
        
    });
    
    const notificationCount = document.querySelector('.notification-count');
    notificationCount.addEventListener('click', function () {
        const userId = notificationCount.parentElement.dataset.userid;
        addModal('NOTIFICATIONS', {
            userId: userId
        });
    });
    const roomDetailsContainer = document.querySelector('.room-details');
    const sendMessageToRoomBtn = document.querySelector('.send-message > button');
    // const inputBox = document.querySelector('.send-message > .input');

    // inputBox.focus();
    const form = document.querySelector('.send-message');
    const nsContainer = document.querySelector('.nameSpaceDetails-Room_container');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    });

    sendMessageToRoomBtn.addEventListener('click', function() {
        const nsEndPoint = nsContainer.dataset.nsendpoint;
        const roomId = roomDetailsContainer.dataset.roomid;
        messageToRoomHandler(roomId, nsEndPoint);
    })

    // Input image on room message event handler
    const imageInput = document.querySelector('.image_input > input[type="file"]');
    imageInput.addEventListener('change', function(e) {
        const image = imageInput.files[0];
        const URL = window.webkitURL || window.URL;
        const url = URL.createObjectURL(image);

        addModal('SEND_DOC_TO_ROOM', {
            input_image_src: url,
            input_image: image
        });
    })

    // Input image on room message event handler
    // const imageInput = document.querySelector('.image_input > input[type="file"]');
    // imageInput.addEventListener('change', async function(e) {
    //     const file = imageInput.files[0];
    //     // const URL = window.webkitURL || window.URL;
    //     // const url = URL.createObjectURL(image);
    //     console.log(file);
    //     const roomId = document.querySelector('.room-details').dataset.roomid;
    //     const formData = new FormData();
    //     formData.append('image', file);

    //     const res = await fetch(`${window.location.origin}/message/send?roomId=${roomId}&pdfType=true`, {
    //         method: "POST",
    //         body: formData
    //     });
    
    //     const data = await res.json();
    //     console.log(data);
    
    // })

    // Clients Toggle Button Handler
    const clientIcon = document.querySelector('.workspace-clients-icon');
    clientIcon.addEventListener('click', function(e) {
        const workspaceClientContainer = document.querySelector('.workspace-clients');
        workspaceClientContainer.classList.toggle('open');
    });

    // Mentions Toggle button Handler
    const mentionBtn = document.querySelector('.mentions-btn > img');
    mentionBtn.addEventListener('click', async function(e) {
        const mentionsModal = document.querySelector('.mentions-modal');
        mentionsModal.classList.toggle('open');

        await fetchMentions();
        const jsonData = sessionStorage.getItem('mentions');

        const mentions = JSON.parse(jsonData);
        const mentionsContainer = mentionsModal.querySelector('.mentions-container');
        mentionsModal.style.height = '500px';
        mentionsContainer.innerHTML = '';
        mentions.forEach(mention => {
            const htmlToAdd = `
                <div class="channel-separator"></div>
                <div class="message">
                    <div class="channel-details" data-endpoint="${mention.nsDetails.endPoint}">
                        <div class="channel">
                            <div class="details">
                                <div class="channel-img">
                                    <img src="${mention.nsDetails.image}" class="message-user_dp" alt="${mention.nsDetails.title}">
                                </div>
                                <div class="channel-name">
                                    <p>${mention.nsDetails.title}</p>
                                </div>
                            </div>
                        </div>
                        <div class="room-id" data-roomid="${mention.roomDetails._id}">
                            <div class="room-name">
                                <p># ${mention.roomDetails.name}</p>
                            </div>
                            <div class="message-details">
                                <div class="message" id="${mention.messageObj._id}">
                                    <div class="message-inner">
                                        <div class="user-img">
                                            <img src="${mention.messageObj.user.image}" class="message-user_dp" alt="${mention.messageObj.user.name}">
                                        </div>
                                        <div class="message-body">
                                            <div class="message-header">
                                                <div class="user">
                                                    <span class="message-user_name">${mention.messageObj.user.name}</span>
                                                </div>
                                                <div class="action_btn">
                                                    <p>Jump</p>
                                                </div>
                                            </div>
                                            <div class="message-data">
                                                <p>${mention.messageObj.body}</p>
                                            </div>
                                            <span class="message-time_stamp">${mention.messageObj.time}</span>
                                            <div class="message-status">
                                                <i class="material-icons">done_all</i>
                                            </div>
                                        </div>
                                    </div>
                                </div> 
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            mentionsContainer.insertAdjacentHTML('afterbegin', htmlToAdd);
        })
        const jumpBtns = mentionsContainer.querySelectorAll('.action_btn');
        jumpBtns.forEach(jumpBtn => {
            jumpBtn.addEventListener('click', function(e) {
                const { joinRoom } = require('./dashboard/Room/addRoom');

                const { connectToNs, loadNamespace } = require('./dashboard/Namespace/nsFunctionaily');

                const messageId = jumpBtn.closest('.message').getAttribute('id');

                loadNamespace(this.closest('.channel-details').dataset.endpoint, true);
                connectToNs(this.closest('.channel-details').dataset.endpoint, true);
                joinRoom({
                    roomId: this.closest('.room-id').dataset.roomid,
                    nsEndPoint: this.closest('.channel-details').dataset.endpoint
                }, messageId);
                console.log(messageId);
            })
        })
    });

    // Jump to message button Handler
    // const jumpBtn = document.getElementById('search-btn');
    // jumpBtn.addEventListener('click', function() {
    //     const container = document.querySelector('.message-display__container > .messages');
    // })
}
