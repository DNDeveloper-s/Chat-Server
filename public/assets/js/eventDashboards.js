const { addModal } = require('./dashboard/Modal/addModal');
// const { addUserModal } = require('./dashboard/User/userUI');
const { messageToRoomHandler } = require('./dashBoard/User/message');
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
        const nsEndPoint = getInvCode.closest('.ns-options').dataset.id.slice(1);
        
        // const dataString = sessionStorage.getItem('invcode');
        // let data = JSON.parse(dataString);



        // if(!dataString) {
            // console.log('Fetching!');
            const res = await fetch(`${window.location.origin}/dashboard/workspace?nsName=${nsEndPoint}&genInvLink=true`, {
                method: "POST"
            });
    
            data = await res.json();
        // }

        // sessionStorage.setItem('invcode', JSON.stringify(data));  

        setTimeout(() => {
            addModal(`GETINVCODE=${data.acknowledgment.link}`, );
        }, 200);
    })
    const workspaceSettings = nsDropdown.querySelector('.workspace-settings');
    workspaceSettings.addEventListener('click', async(e) => {
        e.preventDefault();
        const nsEndPoint = workspaceSettings.closest('.ns-options').dataset.id;
        const res = await fetch(`${window.location.origin}/dashboard/workspace?nsEndPoint=${nsEndPoint}&getWorkspaceDetails=true`, {
            method: "GET"
        });

        const data = await res.json();

        console.log(data);
        setTimeout(() => {
            addModal(`WORKSPACESETTINGS`, {
                workSpace: data.acknowledgment.workSpace
            });
        }, 200);
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
