const { getRoomId } = require('./roomUtils');
const { addModal } = require('../../Modal/addModal');
const { playSound } = require('../../../utilities');

function initHandlers(roomId = String, nsEndPoint = String) {
    // Grabbing options for all messages
    const messageContainer = document.querySelector('.message-display__container > .messages');

    // Initializing Delete Button
    initDeleteButton(messageContainer, roomId, nsEndPoint);

}

function initDeleteButton(messageContainer = Element, roomId = String, nsEndPoint = String) {
    // Delete Message Buttons
    const messageDelBtns = messageContainer.querySelectorAll('.message .react_container > .delete-icon');

    // Looping through all btns
    messageDelBtns.forEach(messageDelBtn => {

        // Adding Event Listeners
        if(!messageDelBtn.dataset.clickevent || messageDelBtn.dataset.clickevent !== 'true') {
            messageDelBtn.addEventListener('click', async function(e) {
                messageDelBtn.dataset.clickevent = true;
                
                // Getting Message ID using react_container element
                const react_container = messageDelBtn.closest('.react_container');
                const {messageId, messageText} = getRoomId(react_container);
    
                // Playing Sound
                playSound({
                    name: 'confirmSound',
                    volume: 0.1
                })
                
                // Adding Confirmation Modal // User will get two options "Yes" or "No"
                addModal('CONFIRMATION_MODAL', {
                    message: `Are you sure you want to delete message, This cannot be undone!
                        <div class="message-data">
                            <p>${messageText}</p>
                        </div>
                    `,
                    callback: async function(res) {
    
                        // User clicked "No"
                        if(!res) {
                            return 'Nothing To Do!';
                        }
    
                        // User clicked "Yes"
                        // Posting Delete Role
    
                        const { deleteRoomMsg } = require('../Server/deleteRoomMsg');
    
                        // Making Request and Getting Data from the Server
                        console.log(nsEndPoint);
                        const data = await deleteRoomMsg(messageId, roomId, nsEndPoint);
                        console.log(data);
                    },
                    dontPlaySound: true     // default is false
                })
            });
        }
    })

}

module.exports = {
    initHandlers
}