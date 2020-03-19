require('./eventDashboards')();

const { nsListeners } = require('./dashboard/Namespace/nsFunctionaily');
const { addModal } = require('./dashboard/Modal/addModal'); 
const { addFriend, addMessageModal } = require('./dashboard/User/friend');
const { remove_sidebar } = require('./utilities');

const $ = require('jquery');
window.jQuery = $;
window.$ = $;
require('emojionearea');

$('#emoji').emojioneArea({
    pickerPosition: "bottom"
});

nsListeners();


console.log('dashboard');

Array.prototype.deleteItem = function(item) {
    return this.filter(cur => cur.toString() !== item.toString())
}

function defaultModal() {
    const rootEl = document.querySelector('#root');
    const modalEl = rootEl.querySelector('.modal');
    const backDropEl = rootEl.querySelector('.back-drop');

    function removeModal() {
        const nsEndPoint = window.location.search.split('&')[1].split('=')[1];
        if (window.history.replaceState) {
            //prevents browser from storing history with each change:
            window.history.replaceState('Workspace', `${nsEndPoint}`, `/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}`);
        }
        backDropEl.classList.add('remove');
        modalEl.classList.add('remove');
        setTimeout(() => {
            rootEl.querySelector('.back-drop').remove();
            rootEl.querySelector('.modal').remove();
        }, 200)
    }

    if(backDropEl) {
        backDropEl.addEventListener('click', removeModal);
    }
    
    if(modalEl) {
        const toggleChat = modalEl.querySelector('button.yes[data-togglechat="true"]');
        if(toggleChat) {
            toggleChat.addEventListener('click', e => {
                const userId = modalEl.dataset.userid;
                addMessageModal(userId);
            })
        }
    }
    
    if(modalEl) {
        const anothermodalEl = modalEl.querySelector('.option-choice');
        const anotherModalButtonEl = modalEl.querySelector('button.another');
        if(anotherModalButtonEl) {
            anotherModalButtonEl.addEventListener('click', anotherModalButtonHandler);  
        }

        async function anotherModalButtonHandler(e) {
            e.preventDefault();
            if(anothermodalEl.dataset.id === 'add_friend') {
                const friendId = modalEl.dataset.userid;
                addFriend(friendId);
            }
            removeModal();
        }
    }
}

function toggle_nav_on_mob() {
    const rootEl = document.getElementById('root');
    const toggle_btn = rootEl.querySelector('.toggle-btn');
    const nav_bar = rootEl.querySelector('.nav_bar');
    // Backdrop HTML
    const backDropHtml = `<div class="back-drop sidebar"></div>`;

    toggle_btn.addEventListener('click', function(e) {
        nav_bar.classList.add('open');
        rootEl.insertAdjacentHTML('afterbegin', backDropHtml);
        const backDropEl = rootEl.querySelector('.back-drop.sidebar');
        backDropEl.addEventListener('click', remove_sidebar);

        const remove_sidebar_links = document.querySelectorAll('.remove_sidebar');
        remove_sidebar_links.forEach(cur => {
            cur.addEventListener('click', remove_sidebar);
        })
    });
}

function toggle_frnds_list() {
    const rootEl = document.getElementById('root');
    const toggle_frnds = rootEl.querySelector('.friends-icon');
    // Backdrop HTML
    const backDropHtml = `<div class="back-drop frndslist"></div>`;
    
    toggle_frnds.addEventListener('click', function(e) {
        const frnds_list_container = rootEl.querySelector('.friends-list');
        rootEl.insertAdjacentHTML('afterbegin', backDropHtml);
        frnds_list_container.classList.add('open');
        const backDropEl = rootEl.querySelector('.back-drop.frndslist');
        backDropEl.addEventListener('click', remove_frndslist);

        const remove_frndslist_links = document.querySelectorAll('.remove_frndslist');
        remove_frndslist_links.forEach(cur => {
            cur.addEventListener('click', remove_frndslist);
        })
    });

}

function remove_frndslist() {
    const rootEl = document.getElementById('root');
    const frnds_list_container = rootEl.querySelector('.friends-list');
    const backDropEl = rootEl.querySelector('.back-drop.frndslist');
    backDropEl.remove();
    frnds_list_container.classList.remove('open');
}

async function fetchWorkSpaces() {
    const allNamespaces = document.querySelectorAll('.nameSpaceContainer > .name_space');
    const allEndPoints = [];
    allNamespaces.forEach(cur => {
        allEndPoints.push(cur.dataset.ns);
    });
    let workspaces = [];
    for(const nsEndPoint of allEndPoints) {
        const res = await fetch(`${window.location.origin}/dashboard/fetch?workspaces=true&nsEndPoint=${nsEndPoint}`, {
            method: "GET"
        })
        const data = await res.json();
        workspaces.push(data);
    }

    // Converting array to object
    function toObject(arr) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i)
            if (arr[i] !== undefined) {
                // const name = arr[i].name
                rv[arr[i].endPoint] = arr[i];
            }
        return rv;
    }

    const obj = toObject(workspaces);
    // Storing to Session Storage
    sessionStorage.setItem(`all_workspaces`, JSON.stringify(obj));
}

const userLinks = document.querySelectorAll('.userLink');
userLinks.forEach(userLink => {
    if(!userLink.dataset.eventactive) {
        userLink.dataset.eventactive = 'true';
        userLink.addEventListener('click', function(e) {
            const userId = userLink.dataset.userid;
            addModal('USER_PROFILE', {
                user: {
                    _id: userId
                }
            });
            // addUserModal(userId); 
        })
    }
});

if(window.innerWidth < 768) {
    toggle_nav_on_mob();
    toggle_frnds_list();
}

defaultModal();

fetchWorkSpaces();

const { fetchRooms, fetchMentions } = require('./utilities');

fetchMentions();

fetchRooms();


// window.addEventListener('click', function(e) {
//     const isTargetInModal = e.target.closest('.modal');
//     const modalEl = document.querySelector('.modal');
//     if(modalEl && isTargetInModal === null) {
//         modalEl.classList.add('remove');
//         setTimeout(() => {
//             // rootEl.querySelector('.back-drop').remove();
//             modalEl.remove();
//         }, 200)
//     }
//     // backDropEl.classList.add('remove');
// })