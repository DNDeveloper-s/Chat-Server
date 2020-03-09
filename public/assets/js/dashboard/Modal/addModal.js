const { postNewNs, joinUsingLink } = require('../Namespace/addNamespace');
const { postNewRoom, postDeleteRoom } = require('../Room/addRoom');
const { copyToClipboard } = require('../../utilities');

const addModal = (el, roomDetails) => {
    const rootEl = document.getElementById('root');
    const backDropHTML = `<div class="back-drop"></div>`;
    let addModalHTML;
    if(el === 'NS') {
        addModalHTML = `
            <div class="modal" data-id="addNs" tabindex="0">
                <div class="first-choice">  
                    <h5>Create a new Workspace</h3>
                    <label for="nsTitle">
                        <input name="nsTitle" type="text" placeholder="Namespace Title">
                    </label>
                    <label for="nsImage">
                        <input type="file" name="nsImage">
                    </label>
                    <label for="defaultRoomTitle">
                        <input name="defaultRoomTitle" type="text" placeholder="Default Room Title">
                    </label>
                    <button class="pointer yes" type="button">Create</button>
                    <div class="or">
                        <p>or</p>
                    </div>
                </div>
                <div class="option-choice join-using-link" data-id="joinUsingLink">
                    <h5>Join a workspace using invite code</h3>
                    <label for="joiningLink">
                        <input name="joiningLink" type="text" placeholder="Enter invite code">
                    </label>
                    <button class="pointer another" type="button">Join</button>
                </div>
            </div>
        `;
    } else if(el === 'ROOM') {
        addModalHTML = `
            <div class="modal" data-id="addRoom" tabindex="0">
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
                <button class="pointer yes" type="button">Create</button>
            </div>
        `;
    } else if(el === 'CONFIRM') {
        addModalHTML = `
            <div class="modal max-width-500" tabindex="0" data-id="deleteRoom" data-roomId="${roomDetails.roomId}" data-nsEndPoint="${roomDetails.nsEndPoint}" data-nsId="${roomDetails.roomNsId}">
                <h4 class="pl-10">Are you sure?... You want to delete the room <span style="color: red">#${roomDetails.roomName}</span>!</h4>
                <div class="flex align btns">
                    <button class="pointer redLinear yes" type="button">Yes</button>
                    <button class="pointer no" type="button">No</button>
                </div>
            </div>
        `;
    } else if(el.split('=')[0] === 'GETINVCODE') {
        addModalHTML = `
            <div class="modal" data-id="getInvCode" tabindex="0">
                <h5>Invite Code</h5>
                <div class="invite-code">
                    <p>${el.split('=')[1]}</p>
                </div>
                <button class="copy-invite-code pointer yes">Copy to Clipboard</button>
            </div>
        `;
    }
    rootEl.insertAdjacentHTML('beforeend', backDropHTML);
    rootEl.insertAdjacentHTML('beforeend', addModalHTML);
    const backDropEl = rootEl.querySelector('.back-drop');
    const modalEl = rootEl.querySelector('.modal');
    modalEl.focus();
    if(!roomDetails) {
        if(modalEl.querySelector('input')) {
            modalEl.querySelector('input').focus();
        }
    } else {
        const cancelBtn = modalEl.querySelector('button.no');
        cancelBtn.addEventListener('click', removeModal);
    }
    console.log(backDropEl);
    
    backDropEl.addEventListener('click', removeModal);

    function removeModal() {
        backDropEl.classList.add('remove');
        modalEl.classList.add('remove');
        setTimeout(() => {
            rootEl.querySelector('.back-drop').remove();
            rootEl.querySelector('.modal').remove();
        }, 200)
    }

    console.log(window.location.origin);

    modalEl.addEventListener('keydown', e => {
        if(e.key === 'Enter') {
            modalButtonHandler(e);
        }
    });

    const inModalButtonEl = modalEl.querySelector('button.yes');
    inModalButtonEl.addEventListener('click', modalButtonHandler);

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
        }
        removeModal();
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
            joinUsingLink(link);
        }
        removeModal();
    }

};

module.exports = { addModal };