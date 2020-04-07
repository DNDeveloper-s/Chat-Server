const { nsListeners } = require('./dashboard/Namespace/nsFunctionaily');
const { addModal } = require('./dashboard/Modal/addModal'); 
const { addFriend, addMessageModal } = require('./dashboard/User/friend');
const { remove_sidebar, sendImageData, loader, fetchWorkSpaces, tagImplementation, toggleSwitch, outOfTarget } = require('./utilities');

// const $ = require('jquery');
// window.jQuery = $;
// window.$ = $;
// require('emojionearea');

// $('#editable').emojioneArea({
//     pickerPosition: "top"
// });

window.addEventListener('load', function(e) {
    tagImplementation('#editable');
});

// searchBtn.addEventLi stener('click', async function(e) {
//     console.log('clicked');
//     const res = await fetch(`${window.location.origin}/message/download`, {
//         method: "GET"
//     });
//     const data = await res.json();
//     console.log(data);

//     window.open(`${window.location.origin}/message/download`);
// })

require('./eventDashboards')();

loader();

nsListeners();

toggleSwitch();

const searchBtn = document.querySelector('#search-btn');

searchBtn.addEventListener('click', async function(e) {

    
    
    // const res = await fetch(`${window.location.origin}/message/download`, {
    //     method: "GET"
    // });
    // const data = await res.json();
    // console.log(data);

    // window.open('/download?foo=bar&xxx=yyy');
})

console.log('dashboard');

Array.prototype.deleteItem = function(item) {
    return this.filter(cur => cur.toString() !== item.toString())
}

function tutorial() {
    const nameSpaceContainer = document.querySelector('.nameSpaceContainer');
    const nameSpace = nameSpaceContainer.querySelector('.name_space.image_holder');

    

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
                e.preventDefault();
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

        const updateProfile = document.getElementById('update-profile');

        if(updateProfile) {
            updateProfile.addEventListener('click', async function(e) {
                e.preventDefault();
                this.classList.add('loading');
                const el = updateProfile.closest('form');
                const userId = el.querySelector('[name="user_id"]').value;
                const data = await sendImageData(el, userId);
                console.log(data);
                this.classList.remove('loading');
                
                if(data.acknowledgment.type === 'success') {
                    const userDp = document.querySelectorAll('.user_dp > img');
                    userDp.forEach(cur => {
                        cur.setAttribute('src', data.acknowledgment.imageSrc);
                    })
                }
            });
        }

        // const inputFile = document.querySelector('.input__file.input__dp');

        // inputFile.addEventListener('change', function() {
        //     const fiel = document.querySelector('input[type="file"]');
        //     const img = document.querySelector('.user_modal_img');
        //     var URL = window.webkitURL || window.URL;
        //     var url = URL.createObjectURL(fiel.files[0]);
        //     // var img = new Image();
        //     img.src = url;

        //     console.log(url);
        // })
        
        
        
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