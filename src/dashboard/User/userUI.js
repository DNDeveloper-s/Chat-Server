const { sendImageData, loader, addResponseModal } = require('../../utilities');
const {addFriend} = require('./friend');

async function addUserModal(userId, fn) {
    const nsEndPoint = window.location.search.split('&')[1].split('=')[1];
    if (window.history.replaceState) {
        //prevents browser from storing history with each change:
        window.history.replaceState('Workspace', `${nsEndPoint}`, `/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}&showUserModalDefault=true&userId=${userId}`);
    }
    
    const res = await fetch(`${window.location.origin}/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}&showUserModal=true&userId=${userId}`, {
        method: "GET"
    });

    const data = await res.json();

    console.log(data);

    if(data.acknowledgment.type === 'success') {

        const htmlToAdd = `
            <form action="/auth/update_profile" method="POST" enctype="multipart/form-data">
                <div class="first-choice center-content alone">  
                    <h5 class="bigger">User Profile</h5>
                    <div class="modal_image user_dp">
                        <input name="image" type="file" class="input__file input__dp">
                        <figure>
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="30%" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg>
                        </figure>
                        <label for="image" class="dp__name"></label>
                        <img src="${data.acknowledgment.user.image}" alt="${data.acknowledgment.user.name}">
                    </div>
                    <div class="input-control">
                        <label class="finalize" for="">Full Name</label>
                        <input type="text" name="user_name" value="${data.acknowledgment.user.name}" placeholder="Enter Workspace name..." ${data.acknowledgment.isItAuthenticatedUser ? '' : 'readonly'}>
                    </div>
                    <div class="input-control">
                        <label for="" class="finalize">Unique userId</label>
                        <input type="text" name="user_id" value="${data.acknowledgment.user._id}" placeholder="Enter Workspace name..." disabled>
                    </div>
                    ${data.acknowledgment.isItAuthenticatedUser ? '<div class="input-control"><label class="finalize" for="">Finalize Changes</label><button type="submit" id="update-profile" class="pointer blueLienar btn yes">Save Changes<div class="loader-container"> <svg width="40" height="40"> <circle class="loader" cx="20" cy="20" r="17"></circle> </svg> </div></button></div>' : ''}
                    ${ !data.acknowledgment.isItAuthenticatedUser && data.acknowledgment.isFriend ? '<div class="input-control"><label class="finalize" for="">Write a Message</label><button class="pointer blueLienar yes" data-togglechat="true" data-closemodal="false">Toggle Chatbox</button></div>' : ''}
                </div>
                ${ !data.acknowledgment.isItAuthenticatedUser && !data.acknowledgment.isFriend  ? '<div class="option-choice center-content" data-id="add_friend"><div class="input-control"><label class="strict-action" for="">Such Action</label><button class="pointer redLinear another btn">Add as a Friend<div class="loader-container"> <svg width="40" height="40"> <circle class="loader" cx="20" cy="20" r="17"></circle> </svg> </div></button></div></div>' : ''}
                ${ !data.acknowledgment.isItAuthenticatedUser && data.acknowledgment.isFriend ? '<div class="option-choice center-content" data-id="remove_friend"><div class="input-control"><label class="strict-action" for="">Such Action</label><button class="pointer redLinear another btn">Remove Friend<div class="loader-container"> <svg width="40" height="40"> <circle class="loader" cx="20" cy="20" r="17"></circle> </svg> </div></button></div></div>' : '' }
            </form>
        `;

        const modalEl = document.querySelector('.modal[data-id="user_profile"]');
        modalEl.innerHTML = htmlToAdd;

        loader();

        const toggleBtn = modalEl.querySelector('button[data-togglechat="true"]');
        if(toggleBtn) {
            toggleBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const userId = modalEl.dataset.userid;
                const { addMessageModal } = require('./message');
                addMessageModal(userId);
            })
        }

        if(fn) {
            const userId = modalEl.dataset.userid;
            const { addMessageModal } = require('./message');
            addMessageModal(userId);
        }

        const updateProfile = modalEl.querySelector('.first-choice button#update-profile');
        
        if(updateProfile) {
            updateProfile.addEventListener('click', async function(e) {
                e.preventDefault();
                this.classList.add('loading');
                const el = updateProfile.closest('form');
                const userId = el.querySelector('[name="user_id"]').value;
                const data = await sendImageData(el, userId);
                console.log(data);
                this.classList.remove('loading');

                // const modalEl = document.querySelector('.modal[data-id="user_profile"]');
                addResponseModal({
                    selector: '.modal[data-id="user_profile"]',
                    type: data.acknowledgment.type,
                    message: data.acknowledgment.message
                });
                
                if(data.acknowledgment.type === 'success') {
                    console.log(data.acknowledgment.imageSrc);
                    if(data.acknowledgment.imageSrc) {
                        const userDp = document.querySelectorAll('.user_dp > img');
                        userDp.forEach(cur => {
                            cur.setAttribute('src', data.acknowledgment.imageSrc);
                        })
                    }
                }
            });
        }

        const add_friend = document.querySelector('.option-choice[data-id="add_friend"] button');
        if(add_friend) {
            add_friend.addEventListener('click', async function(e) {
                e.preventDefault();
                this.classList.add('loading');
                const friendId = modalEl.dataset.userid;
                const data = await addFriend(friendId);
                this.classList.remove('loading');
                addResponseModal({
                    selector: '.modal[data-id="user_profile"]',
                    type: data.acknowledgment.type,
                    message: data.acknowledgment.message
                });
            });
        }
    }

    // if(fn) {
    //     addModal('USER_PROFILE', {
    //         user: data.acknowledgment.user,
    //         isItAuthenticatedUser: data.acknowledgment.isItAuthenticatedUser,
    //         isFriend: data.acknowledgment.isFriend,
    //         openChat: true
    //     });
    // } else {
    //     const { addModal } = require('../Modal/addModal');
    //     addModal('USER_PROFILE', {
    //         user: data.acknowledgment.user,
    //         isItAuthenticatedUser: data.acknowledgment.isItAuthenticatedUser,
    //         isFriend: data.acknowledgment.isFriend
    //     });
    // }
    
}


module.exports = { addUserModal };