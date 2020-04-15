const { postNewNs, joinUsingLink } = require('../Namespace/addNamespace');
const { postNewRoom, postDeleteRoom } = require('../Room/addRoom');
const { copyToClipboard, loader, tagImplementation, playSound } = require('../../utilities');
const { addFriend, removeFriend } = require('../User/friend');
const { loadNotifications } = require('../User/notification');
const { addMessageModal } = require('../User/message');
const { addUserModal } = require('../User/userUI');
const { imageMessageToRoomHandler } = require('../User/message');
const { addMessageToRoom } = require('../Room/roomUI');

const addModal = (el, options) => {

    // Playing Sound
    playSound({
        name: 'doorSound2',
        volume: 0.2
    })

    const rootEl = document.getElementById('root');
    let backDropHTML = `<div class="back-drop"></div>`;
    let addModalHTML;
    if(el === 'NS') {
        addModalHTML = `
            <div class="modal" data-id="addNs" tabindex="0">
                <div class="first-choice">  
                    <h5>Create a new Workspace</h3>
                    <label for="nsTitle">
                        <input name="nsTitle" type="text" placeholder="Namespace Title">
                    </label>
                    <label for="defaultRoomTitle">
                        <input name="defaultRoomTitle" type="text" placeholder="Default Room Title">
                    </label>
                    <button class="pointer yes" data-closemodal="false" type="button">Create</button>
                    <div class="or">
                        <p>or</p>
                    </div>
                </div>
                <div class="option-choice join-using-link" data-id="joinUsingLink">
                    <h5>Join a workspace using invite code</h3>
                    <label for="joiningLink">
                        <input name="joiningLink" type="text" placeholder="Enter invite code">
                    </label>
                    <button class="pointer another btn" type="button">Join
                        <div class="loader-container">
                            <svg class="circular" viewBox="25 25 50 50">
                                <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                            </svg>
                        </div>
                    </button>
                </div>
            </div>
        `;
    } else if(el === 'ROOM') {
        addModalHTML = `
            <div class="modal" data-id="addRoom" tabindex="0">
                <div class="first-choice alone">  
                    <label for="roomTitle">
                        <input name="roomTitle" type="text" placeholder="Room Title">
                    </label>
                    <div class="check-boxes">
                        <label class="checkbox-control" for="roomMode">
                            <input type="radio" value="Private" name="roomMode">
                            Private
                        </label>
                        <label class="checkbox-control" for="roomMode">
                            <input type="radio" value="Public" name="roomMode">
                            Public
                        </label>
                    </div>
                    <button class="pointer yes" data-closemodal="true" type="button">Create</button>
                </div>
            </div>
        `;
    } else if(el === 'CONFIRM') {
        addModalHTML = `
            <div class="modal max-width-500" tabindex="0" data-id="deleteRoom" data-roomId="${options.roomDetails.roomId}" data-nsEndPoint="${options.roomDetails.nsEndPoint}" data-nsId="${options.roomDetails.roomNsId}">
                <div class="first-choice alone">  
                    <h4 class="pl-10">Are you sure?... You want to delete the room <span style="color: red">#${options.roomDetails.roomName}</span>!</h4>
                    <div class="flex align btns">
                        <button class="pointer redLinear yes" type="button" data-closemodal="true">Yes</button>
                        <button class="pointer no" type="button">No</button>
                    </div>
                </div>
            </div>
        `;
    } else if(el === 'GETINVCODE') {
        addModalHTML = `
            <div class="modal" data-id="getInvCode" tabindex="0">
                <div class="first-choice alone">  
                    <h5>Invite Code</h5>
                    <div class="invite-code">
                        <div class="loader-container">
                        <svg class="circular" viewBox="25 25 50 50">
                            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                        </svg>
                        </div>
                    </div>
                    <button class="copy-invite-code pointer yes" data-closemodal="true">Copy to Clipboard</button>
                </div>
            </div>
        `;
    } else if(el === 'WORKSPACESETTINGS') {
        addModalHTML = `
            <div class="modal" data-id="workspace_settings" data-ns="${options.nsEndPoint}" tabindex="0">
                <div class="side_bar">
                    <div class="bg_image">
                        <img src="/assets/images/draw.svg" alt="vector">
                    </div>
                    <div class="overview_section side_nav_section">
                        <div class="header">
                            DNDevelopers
                        </div>
                        <ul class="list">
                            <li class="list_item settings_nav_item" data-navsetting="overview" >Overview</li>
                            <li class="list_item settings_nav_item" data-navsetting="roles" >Roles</li>
                            <li class="list_item settings_nav_item" data-navsetting="moderation" >Moderation</li>
                            <li class="list_item settings_nav_item" data-navsetting="activities" >Activities</li>
                        </ul>
                    </div>
                    <div class="user_section side_nav_section">
                        <div class="header">
                            User Management
                        </div>
                        <ul class="list">
                            <li class="list_item">Members</li>
                            <li class="list_item">Invites</li>
                            <li class="list_item">Bans</li>
                        </ul>
                    </div>
                </div>

                <div class="main_nav">
                    
                </div>
            </div>
        `;
    } else if(el === 'USER_PROFILE') {
        addModalHTML = `
            <div class="modal" data-id="user_profile" data-userId="${options.user._id}" tabindex="0">
                <div class="first-choice center-content alone noRightPadding">  
                    <h5 class="bigger bottomMarginInc white">User Profile</h5>
                    <div class="loader-container">
                        <svg class="circular" viewBox="25 25 50 50">
                            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    } else if(el === 'NOTIFICATIONS') {
        addModalHTML = `
            <div class="modal" data-id="notifications" tabindex="0">
                <div class="first-choice center-content alone noRightPadding">  
                    <h5 class="bigger bottomMarginInc white">Notifications</h5>
                    <div class="loader-container">
                        <svg class="circular" viewBox="25 25 50 50">
                            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    } else if(el === 'SEND_DOC_TO_ROOM') {
        addModalHTML = `
            <div class="modal padding_enable" data-id="send_file" tabindex="0">
                <div class="first-choice center-content alone noRightPadding">  
                    <h5 class="bigger bottomMarginInc white">Send File</h5>
                    <div class="big-image">
                        <img src="${options.input_image_src}" alt="DNDeveloper">
                    </div>
                    <div class="message-input">
                        <div class="input" id="editeable" data-text="Enter Caption here!" contenteditable="true" role="textbox" tabindex="0">

                        </div>
                        <div class="tag-list">
                            <div class="tag-members"></div>
                            <div class="tag-roles"></div>
                        </div>
                    </div>
                    <button type="button" class="pointer yes">Send</button>
                </div>
            </div>
        `;
    } else if(el === 'CONFIRMATION_MODAL') {
        addModalHTML = `
            <div class="modal confirmModal max-width-500 disableMinHeight" data-id="confirmation">
                <div class="first-choice alone">  
                    <h4 class="pl-10 confirmHeading">${options.message}</h4>
                    <div class="flex align btns">
                        <button class="pointer redLinear yes btn" type="button" data-closemodal="true">Yes
                            <div class="loader-container">
                                <svg class="circular" viewBox="25 25 50 50">
                                    <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>
                                </svg>
                            </div>
                        </button>
                        <button class="pointer no" type="button">No</button>
                    </div>
                </div>
            </div>
        `;
    }
    if(el === 'CONFIRMATION_MODAL') {
        backDropHTML = `<div class="back-drop confirmation"></div>`;
    }
    rootEl.insertAdjacentHTML('beforeend', backDropHTML);
    rootEl.insertAdjacentHTML('beforeend', addModalHTML);
    const backDropEl = rootEl.querySelector('.back-drop:not(.noOpaque)');
    const modalEl = rootEl.querySelector('.modal');
    modalEl.focus();
    if(!options) {
        if(modalEl.querySelector('input')) {
            modalEl.querySelector('input').focus();
        }
    } else if(!options.roomDetails) {
        if(modalEl.querySelector('input')) {
            modalEl.querySelector('input').focus();
        }
    } else {
        const cancelBtn = modalEl.querySelector('button.no');
        cancelBtn.addEventListener('click', removeModal);
    }
    
    if(el === 'USER_PROFILE') {
        loader();
        addUserModal(options.user._id, options.openChat);
        backDropEl.addEventListener('click', () => {
            removeModal({
                updateUrl: true
            });
        });
    } else if(el === 'WORKSPACESETTINGS') {
        backDropEl.addEventListener('click', () => {
            sessionStorage.removeItem('settingsToBeSaved');
            saveModal.classList.remove('savePopup');
            removeModal();
        });
    } else if(el === 'NOTIFICATIONS') {
        loader();
        loadNotifications(options.userId);
        backDropEl.addEventListener('click', removeModal);
    } else if(el === 'SEND_DOC_TO_ROOM') {
        tagImplementation('#editeable');
        backDropEl.addEventListener('click', removeModal);
    } else if(el === 'CONFIRMATION_MODAL') {
        loader();
        const declineModalButtonEl = document.querySelector('.modal[data-id="confirmation"]').querySelector('button.no');
        const acceptModalButtonEl = document.querySelector('.modal[data-id="confirmation"]').querySelector('button.yes');

        const modalEl = document.querySelector('.modal[data-id="confirmation"]');
        modalEl.classList.add('comeDown');

        if(acceptModalButtonEl) {
            acceptModalButtonEl.addEventListener('click', async function () {
                this.classList.add('loading');
                await options.callback(true);
                
                this.classList.remove('loading');
                removeConfirmationModal();
            });
        }
        
        if(declineModalButtonEl) {
            declineModalButtonEl.addEventListener('click', async () => {
                await options.callback(false);
                removeConfirmationModal();
            });
        }

        const backDropEl = rootEl.querySelector('.back-drop.confirmation');
        backDropEl.addEventListener('click', removeConfirmationModal)

        function removeConfirmationModal() {
            backDropEl.classList.add('remove');
            modalEl.classList.add('remove');
            modalEl.classList.remove('comeDown');
            setTimeout(() => {
                rootEl.querySelector('.back-drop.confirmation').remove();
                rootEl.querySelector('.modal[data-id="confirmation"]').remove();
            }, 200)
        }

        return;
    } else {
        backDropEl.addEventListener('click', removeModal);
        console.log(backDropEl);
        loader();
    }

    function removeModal(options) {

        // Playing Sound
        playSound({
            name: 'trashSound',
            volume: 0.03
        })

        if(options !== undefined && options.updateUrl) {
            const nsEndPoint = window.location.search.split('&')[1].split('=')[1];
            if (window.history.replaceState) {
                //prevents browser from storing history with each change:
                window.history.replaceState('Workspace', `${nsEndPoint}`, `/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}`);
            }
        }
        backDropEl.classList.add('remove');
        modalEl.classList.add('remove');
        setTimeout(() => {
            rootEl.querySelector('.back-drop').remove();
            rootEl.querySelector('.modal').remove();
        }, 200)
    }

    const inModalButtonEl = modalEl.querySelector('button.yes');

    if(inModalButtonEl) {
        inModalButtonEl.addEventListener('click', modalButtonHandler);
    }

    console.log('its coming here!');

     async function modalButtonHandler (e) {
        if(modalEl.dataset.id === 'addNs') {
            const nsData =  {
                title: modalEl.querySelector('[name="nsTitle"]').value,
                defRoomTitle: modalEl.querySelector('[name="defaultRoomTitle"]').value
            }

            postNewNs(nsData);
            
        } else if(modalEl.dataset.id === 'addRoom') {
            const roomContainer = document.querySelector('.roomContainer');
            const name = modalEl.querySelector('[name="roomTitle"]').value;
            let privacy;
            const roomModes = document.getElementsByName('roomMode');
            for(let i = 0; i < roomModes.length; i++) {
                if(roomModes[i].checked) {
                    privacy = roomModes[i].value
                }
            }

            postNewRoom({
                name: name,
                privacy: privacy
            });

        } else if(modalEl.dataset.id === 'deleteRoom') {
            const roomId = modalEl.dataset.roomid;
            const nsId = modalEl.dataset.nsid;
            const nsEndPoint = modalEl.dataset.nsEndPoint;

            postDeleteRoom({
                roomId: roomId,
                nsId: nsId,
                nsEndPoint: nsEndPoint
            })

        } else if(modalEl.dataset.id === 'getInvCode') {
            const strToCopy = modalEl.querySelector('.invite-code > p').innerText;
            copyToClipboard(strToCopy);
        } else if(modalEl.dataset.id === 'workspace_settings') {
            

        } else if(modalEl.dataset.id === 'user_profile') {
            if(this.dataset.togglechat === 'true') {
                e.preventDefault();
            }
        } else if(modalEl.dataset.id === 'confirmation') {
            console.log(modalEl.dataset.id, console.log(options));
            options.callback('yes');

        } else if(modalEl.dataset.id === 'send_file') {
            const nsEndPoint = document.querySelector('.nameSpaceDetails-Room_container').dataset.nsendpoint;
            const roomId = document.querySelector('.room-details').dataset.roomid;
            const image = options.input_image;
            const caption = modalEl.querySelector('.message-input > .input').innerHTML;

            
            // const nsEndPoint = nsContainer.dataset.nsendpoint;
            // const roomId = roomDetailsContainer.dataset.roomid;

            imageMessageToRoomHandler(nsEndPoint, roomId, {
                image: image,
                caption: caption
            });
            console.log(image, caption);
        }
        
        if(this.dataset.closemodal === 'true') {
            removeModal();
        }
    }

    // Extra for joining namespace using link 
    // Two links on the same modal
    // So New Event Handler for 
    
    const anothermodalEl = modalEl.querySelector('.option-choice');
    const anotherModalButtonEl = modalEl.querySelector('button.another');
    if(anotherModalButtonEl) {
        anotherModalButtonEl.addEventListener('click', anotherModalButtonHandler);  
    }

    async function anotherModalButtonHandler(e) {
        e.preventDefault();
        if(anothermodalEl.dataset.id === 'joinUsingLink') {
            const link = anothermodalEl.querySelector('input[name="joiningLink"]').value;
            anotherModalButtonEl.classList.add('loading');
            joinUsingLink(link);
        } else if(anothermodalEl.dataset.id === 'add_friend') {
            const friendId = modalEl.dataset.userid;
            addFriend(friendId);
        } else if(anothermodalEl.dataset.id === 'remove_friend') {
            const friendId = modalEl.dataset.userid;
            removeFriend(friendId);
        }
        
        if(this.dataset.closemodal === 'true') {
            removeModal();
        }
    }

};

module.exports = { addModal };