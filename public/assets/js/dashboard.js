require('./eventDashboards')();

const { nsListeners } = require('./dashboard/Namespace/nsFunctionaily');
const { addUserModal } = require('./dashboard/User/userUI'); 
const { addFriend } = require('./dashboard/User/friend');

nsListeners();

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

defaultModal();