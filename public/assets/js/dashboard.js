require('./eventDashboards')();

const { nsListeners } = require('./dashboard/Namespace/nsFunctionaily');
const { addUserModal } = require('./dashboard/User/userUI'); 
const { addFriend, addMessageModal } = require('./dashboard/User/friend');
const { remove_sidebar } = require('./utilities');

nsListeners();

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

if(window.innerWidth < 768) {
    toggle_nav_on_mob();
    toggle_frnds_list();
}

defaultModal();