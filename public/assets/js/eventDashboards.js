const { addModal } = require('./dashboard/Modal/addModal');
// const { addUserModal } = require('./dashboard/User/userUI');
const { messageToRoomHandler } = require('./dashBoard/User/message');
const { fetchMentions, focusMessageById } = require('./utilities');
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

        addModal(`WORKSPACESETTINGS`);

        const nsEndPoint = workspaceSettings.closest('.ns-options').dataset.id;
        const res = await fetch(`${window.location.origin}/dashboard/workspace?nsEndPoint=${nsEndPoint}&getWorkspaceDetails=true`, {
            method: "GET"
        });

        const data = await res.json();

        console.log(data);
        
        if(data.acknowledgment.type === 'success') {
            const htmlToAdd = `
                <div class="first-choice center-content alone">  
                    <h5 class="bigger">Your Workspace</h5>
                    <div class="nsImage">
                        <input name="image" type="file" class="input__file input__dp">
                        <figure>
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="30%" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg>
                        </figure>
                        <label for="image" class="dp__name"></label>
                        <img src="${data.acknowledgment.workSpace.image}" alt="DNDeveloper">
                    </div>
                    <div class="input-control">
                        <label for="">Edit workspace name</label>
                        <input type="text" name="" value="${data.acknowledgment.workSpace.title}" placeholder="Enter Workspace name...">
                    </div>
                    <div class="input-control">
                        <label for="" class="small">Edit Your Workspace EndPoint</label>
                        <input type="text" name="" value="${data.acknowledgment.workSpace.endPoint.slice(1)}" placeholder="Enter Workspace name...">
                    </div>
                    <div class="input-control">
                        <label class="finalize" for="">Finalize changes</label>
                        <button class="pointer blueLienar yes" data-closemodal="true">Save Changes</button>
                    </div>
                </div>
                <div class="option-choice center-content">
                    <div class="input-control">
                        <label class="strict-action" for="">Strict Action</label>
                        <button class="pointer redLinear another">Delete Workspace</button>
                    </div>
                </div>
            `;

            const modalEl = document.querySelector('.modal[data-id="workspace_settings"]');
            modalEl.innerHTML = htmlToAdd;
        }
        
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
    const inputBox = document.querySelector('.send-message > .input');
    inputBox.innerHTML = "";
    // inputBox.focus();
    const form = document.querySelector('.send-message');
    const nsContainer = document.querySelector('.nameSpaceDetails-Room_container');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    });
    inputBox.addEventListener('focus', e => {
        if(inputBox.childElementCount === 0) {
            inputBox.innerHTML = '<span class="text"></span>';
        }
    })
    inputBox.addEventListener('keypress', function(e){ return e.which != 13 });
    inputBox.addEventListener('keyup', function(e) {
        if(inputBox.childElementCount === 0) {
            inputBox.innerHTML = '<span class="text"></span>';
        }

        const nsEndPoint = nsContainer.dataset.nsendpoint;
        if((e.keyCode >= 64 && e.keyCode <= 91) || e.key === '@' || e.key === "Backspace") {
            const textEl = inputBox.querySelectorAll('.text');
            const arr = textEl[textEl.length - 1].textContent.split(' ');
            const string = arr[arr.length - 1].trim();
            if(string.startsWith('@')) {
                const str = string.slice('1');
                showTags(nsEndPoint, str.toLowerCase());
            } else {
                // Remove Tag List
                remove_tag_list();
            }
        } else if(e.key === "Enter") {
            e.preventDefault();
            const roomId = roomDetailsContainer.dataset.roomid;
            messageToRoomHandler(roomId, nsEndPoint);
        } else if(e.key === " ") {
            // Remove Tag List
            remove_tag_list();
        }
    })
    inputBox.addEventListener('keydown', function(e) {
        if(e.key === 'ArrowUp' || e.key == 'ArrowDown' || e.key === 'Tab' || e.key === 'Enter') {
            e.preventDefault();
        }
    })
    sendMessageToRoomBtn.addEventListener('click', function() {
        const nsEndPoint = nsContainer.dataset.nsendpoint;
        const roomId = roomDetailsContainer.dataset.roomid;
        messageToRoomHandler(roomId, nsEndPoint);
    })

    // Tab Event for Tags
    window.addEventListener('keydown', e => {
        if(e.key === 'Tab') {
            const focusedTag = document.querySelector('.focus-tag');
            if(focusedTag) {
                const user_name = focusedTag.querySelector('.tag-name').innerText;
                const user_id = focusedTag.querySelector('.tag-body').dataset.userid;
                const user_image = focusedTag.querySelector('.tag-img > img').getAttribute('src');

                const textEl = inputBox.querySelectorAll('.text');
                const arr = textEl[textEl.length - 1];
                console.log(arr);
                const l = arr.textContent.split('@')[0];
                console.log(l);
                arr.innerHTML = l;

                const tagHtml = `
                    <span class="tag-details userLink" aria-label="${user_name}" data-userid="${user_id}" contenteditable="false" ><img src="${user_image}" alt="${user_name}">@${user_name}</span><span class="text"></span
                `;

                inputBox.insertAdjacentHTML('beforeend', tagHtml);
                remove_tag_list();
                inputBox.focus();
                const sel = window.getSelection();
                sel.collapse(inputBox.lastChild, 0);
            }
        }
    })

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

function remove_tag_list() {
    // Remove Tag List
    const tagList = document.querySelector('.tag-list');
    tagList.classList.remove('open');
    tagList.innerHTML = '';
}

function showTags(nsEndPoint, inputValue) {
    const jsonWorkSpace = sessionStorage.getItem(`all_workspaces`);
    const workspace = JSON.parse(jsonWorkSpace);
    // console.log(workspace[nsEndPoint].roles.members);
    const matchedNames = workspace[nsEndPoint].roles.members.filter(cur => {
        const str = cur.name.toLowerCase();
        return str.search(inputValue) !== -1
    });

    // Remove Tag List
    const tagList = document.querySelector('.tag-list');
    remove_tag_list();

    if(matchedNames.length > 0 && !tagList.classList.contains('open')) {
        tagList.classList.add('open');
    }

    // Adding Tag List
    matchedNames.forEach((cur, ind) => {
        const tagHTML = `
            <div class="tag" id="tag-${ind}" data-num="${ind+1}" tabindex="0">
                <div class="tag-body userLink" data-userid="${cur._id}">
                    <div class="tag-img">
                        <img src="${cur.image}" class="message-user_dp" alt="">
                    </div>
                    <div class="tag-name">${cur.name}</div>
                </div>
                <div class="tag-hash">${cur.uniqueTag}</div>
            </div>
        `;
        tagList.insertAdjacentHTML('beforeend', tagHTML);
    });

    if(document.getElementById('tag-0')) {
        document.getElementById('tag-0').classList.add('focus-tag');
        add_keys(matchedNames.length);
    }

}

function add_keys(length) {
    const tagList = document.querySelector('.tag-list');
    if(tagList.childElementCount > 1) {
        window.removeEventListener('keydown', arrows_handler);
        window.addEventListener('keydown', arrows_handler);
    }
}

function arrows_handler(e, length) {
    let cur;
    switch (e.key) {
        case 'ArrowUp':
            cur = document.querySelector('.focus-tag').dataset.num;
            addUp(+cur);
            break;
        case 'ArrowDown':
            cur = document.querySelector('.focus-tag').dataset.num;
            addDown(+cur);
            break;
        default:
    }

    function addDown(num) {
        const tagElToRemove = document.querySelector(`.tag[data-num="${num}"]`);
        const tagEl = document.querySelector(`.tag[data-num="${num+1}"]`);
        if(tagEl && tagElToRemove) {
            tagElToRemove.classList.remove('focus-tag');
            tagEl.classList.add('focus-tag');
        }
    }

    function addUp(num, length) {
        const tagElToRemove = document.querySelector(`.tag[data-num="${num}"]`);
        const tagEl = document.querySelector(`.tag[data-num="${num-1}"]`);
        if(tagEl && tagElToRemove) {
            tagElToRemove.classList.remove('focus-tag');
            tagEl.classList.add('focus-tag');
        }
    }
      
}
