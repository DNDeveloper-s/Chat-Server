const { postNewNs } = require('../Namespace/addNamespace');
const { postNewRoom } = require('../Room/addRoom');

const addModal = (el, roomDetails) => {
    const rootEl = document.getElementById('root');
    const backDropHTML = `<div class="back-drop"></div>`;
    let addModalHTML;
    if(el === 'NS') {
        addModalHTML = `
            <div class="modal" data-id="addNs" tabindex="0">
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
            <div class="modal max-width-500" tabindex="0" data-id="deleteRoom" data-roomId="${roomDetails.roomId}" data-nsId="${roomDetails.roomNsId}">
                <h4 class="pl-10">Are you sure?... You want to delete the room <span style="color: red">#${roomDetails.roomName}</span>!</h4>
                <div class="flex align btns">
                    <button class="pointer redLinear yes" type="button">Yes</button>
                    <button class="pointer no" type="button">No</button>
                </div>
            </div>
        `;
    }
    rootEl.insertAdjacentHTML('beforeend', backDropHTML);
    rootEl.insertAdjacentHTML('beforeend', addModalHTML);
    const backDropEl = rootEl.querySelector('.back-drop');
    const modalEl = rootEl.querySelector('.modal');
    modalEl.focus();
    if(!roomDetails) {
        modalEl.querySelector('input').focus();
    } else {
        const cancelBtn = modalEl.querySelector('button.no');
        cancelBtn.addEventListener('click', removeModal);
    }
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
    // const nsImage = modalEl.querySelector('[name="nsImage"]');

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

            // console.log(socket);
            // socket.emit('namespace', {action: 'create', details: {
            //         nsTitle: nsTitle,
            //         defaultRoomTitle: defaultRoomTitle
            //     }}, (newNs) => {
            //     // console.log(newNs);
            //     addNewNS(newNs);
            // })
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

            // console.log(privacy);
            

            postNewRoom({
                name: name,
                privacy: privacy
            });

            const roomNs = roomContainer.querySelector('.room').dataset.ns;

            // nsSocket.emit('room', {action: 'create', details: {
            //         roomTitle: roomTitle,
            //         roomMode: roomMode,
            //         roomNs: roomNs
            //     }}, () => {
            //     joinNs({
            //         endPoint: '/' + roomNs,
            //         fetchAll: true,
            //         dontAddAnimClass: true
            //     });
            // });
        } else if(modalEl.dataset.id === 'deleteRoom') {
            const roomId = modalEl.dataset.roomid;
            const nsId = modalEl.dataset.nsid;
            // nsSocket.emit('room', {action: 'delete', details: {
            //         roomId: roomId,
            //         nsId: nsId
            //     }}, () => {
            //     console.log('/' + roomId);
            // });
        }
        removeModal();
    }

};

module.exports = { addModal };