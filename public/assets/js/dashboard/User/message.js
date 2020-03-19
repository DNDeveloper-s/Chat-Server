const { loader } = require('../../utilities');
const { addUserModal } = require('../User/userUI');
const { updateUserDetails } = require('./friend');
const { addMessageToRoom } = require('../Room/roomUI');

async function addReplyModal(friendId) {
    const modalEl = document.querySelector('.modal[data-id="notifications"]');
    const backDrop = document.querySelector('.back-drop');

    modalEl.remove();
    backDrop.remove();


    const { addUserModal } = require('./userUI');

    addModal('USER_PROFILE', {
        openChat: true,
        friendId: friendId
    });
}

async function addMessageModal(userId) {
    console.log(userId);
    const modalEl = document.querySelector('.modal[data-id="user_profile"]');

    const attachedModal = modalEl.querySelector('.attached-modal');
    if(attachedModal) {
        attachedModal.remove();
    } else {
        const attachedModalHtml = `
            <div class="attached-modal" data-userid="${userId}">
                <div class="head">
                    <div class="user_details pointer">
                        <img src="/assets/images/default.jpg" alt="DNDeveloper">
                        <h5>. . . . . . . . . . . . .</h5>
                    </div>
                    <div class="options pointer">
                        <i class="material-icons">more_vert</i>
                    </div>
                </div>
                <div class="body">
                    <div class="loader-container">
                        <svg width="40" height="40">
                            <circle class="loader" cx="20" cy="20" r="17"></circle>
                        </svg>
                    </div>
                </div>
                <div class="controls">
                    <input type="text" class="input_message" placeholder="Enter your message!">
                    <button class="send_direct_message" type="button">Send<i class="material-icons">send</i></button>
                </div>
            </div>
        `;
        modalEl.insertAdjacentHTML('beforeend', attachedModalHtml);
        
        const messageInput = document.querySelector('.attached-modal .input_message');
        messageInput.focus();

        loader();

        // Fetching and posting user details to UI
        updateUserDetails(userId);

        const arrOfMessages = await fetchMesages(userId);

        // Attaching message to UI
        showMessageToUI(arrOfMessages);

        const attachedModal = modalEl.querySelector('.attached-modal');
        const sendMessageBtn = attachedModal.querySelector('.send_direct_message');

        const {getNsSocket} = require('../Namespace/nsFunctionaily');
        const nsSocket = getNsSocket();

        let timer;
        const curUserId = document.querySelector('.user_dp').dataset.userid;

        messageInput.addEventListener('keydown', function(e) {
            if(e.key === "Enter") {
                console.log("enter pressed");
                postMessage();
            } else if(e.key !== "Tab" && e.key !== "Alt" && e.key !== "Shift" && e.key !== "Control") {
                if(timer) {
                    clearTimeout(timer);
                }
                nsSocket.emit('message', {
                    type: 'typing',
                    userId: userId,
                    sendingUser: curUserId
                })
            }
        });

        messageInput.addEventListener('keyup', function(e) {
            timer = setTimeout(() => {
                nsSocket.emit('message', {
                    type: 'stopped_typing',
                    userId: userId,
                    sendingUser: curUserId
                })
            }, 5000);
        });

        sendMessageBtn.addEventListener('click', postMessage);

        function postMessage() {
            const messageInput = attachedModal.querySelector('.input_message').value;
            const curTime = new Date();
            const timeObj = {
                hours: curTime.getHours(),
                minutes: curTime.getMinutes()
            }
            const time = `${timeObj.hours}:${timeObj.minutes}`;
            const convertedTime = tConvert (time);
            if(messageInput.length > 0) {
                const messageInputContainer = attachedModal.querySelector('.input_message');
                messageInputContainer.value = "";
                messageInputContainer.focus();
                postMessages(userId, messageInput, convertedTime);
            }
        }
    }

}

async function pushRecievedMessageToUI(data) {
    const attachedModal = document.querySelector(`.attached-modal[data-userid="${data.messageObj.userId}"]`); 
    if(attachedModal) {
        const messageBodyContainer = document.querySelector('.attached-modal > .body');
        const typing_loader = messageBodyContainer.querySelector('.typing-loader');
        const messageHTML = `
            <div class="message" data-id="${data.messageObj.sender}">
                <div class="body">
                    ${data.messageObj.body}
                    <div class="time">
                        ${data.messageObj.time}
                        ${data.messageObj.sender === 'self' ? '<img src="/assets/images/send-tick.svg" alt="DNDeveloper">' : ''}
                    </div>
                </div>
            </div>
        `;
        if(typing_loader) {
            typing_loader.remove();
        }
        messageBodyContainer.insertAdjacentHTML('beforeend', messageHTML);
        messageBodyContainer.scrollTo({
            left: 0,
            top: messageBodyContainer.scrollHeight,
            behavior: "smooth"
        });
    } else {
        console.log(data);
        const curUserId = document.querySelector('.user_dp').dataset.userid;
        const notificationObj = {
            message: `${data.sender.name} has sent you a message!`,
            notificationType: 'rcvd_msg',
            userDetails: {
                image: data.sender.image,
                userId: data.sender._id,
                userName: data.sender.name
            }
        }
        const { postNotificationToSelf } = require('./notification');
        postNotificationToSelf(notificationObj, curUserId);
    }
}

async function fetchMesages(userId) {
    
    const res = await fetch(`${window.location.origin}/message/fetch?direct=true&userId=${userId}`, {
        method: "GET"
    });

    const data = await res.json();
    const { deleteNotificationByType } = require('./notification');
    deleteNotificationByType(userId, 'rcvd_msg');

    const friendNotification = document.querySelector(`.friend[data-userid="${userId}"] > .new-notification`);
    friendNotification.dataset.nothing = "true";
    friendNotification.innerHTML = "";

    return data.acknowledgment.messages;
}

async function postMessages(userId, messageInput, time) {
    const res = await fetch(`${window.location.origin}/message/send?direct=true&userId=${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: messageInput,
            time: time
        })
    });

    const data = await res.json();

    if(data.acknowledgment.type === "success") {
        const attachedModal = document.querySelector('.attached-modal'); 
        const messageBodyContainer = document.querySelector('.attached-modal > .body');
        const messageHTML = `
            <div class="message" data-id="${data.acknowledgment.messageObj.sender}">
                <div class="body">
                    ${data.acknowledgment.messageObj.body}
                    <div class="time">
                        ${data.acknowledgment.messageObj.time}
                        ${data.acknowledgment.messageObj.sender === 'self' ? '<img src="/assets/images/send-tick.svg" alt="DNDeveloper">' : ''}
                    </div>
                </div>
            </div>
        `;
        messageBodyContainer.insertAdjacentHTML('beforeend', messageHTML);
        messageBodyContainer.scrollTo({
            left: 0,
            top: messageBodyContainer.scrollHeight,
            behavior: "smooth"
        });
    }
}

function showMessageToUI(messages) {
    const messageBodyContainer = document.querySelector('.attached-modal > .body');
    messageBodyContainer.innerHTML = '';
    messages.forEach(message => {
        const messageHTML = `
            <div class="message" data-id="${message.sender}">
                <div class="body">
                    ${message.body}
                    <div class="time">
                        ${message.time}
                        ${message.sender === 'self' ? '<img src="/assets/images/send-tick.svg" alt="DNDeveloper">' : ''}
                    </div>
                </div>
            </div>
        `;
        messageBodyContainer.insertAdjacentHTML('beforeend', messageHTML);
    });
    messageBodyContainer.scrollTo({
        left: 0,
        top: messageBodyContainer.scrollHeight
    });
}

function showTypingStatus(type, userId) {
    const attachedModal = document.querySelector(`.attached-modal[data-userid="${userId}"]`); 
    const messageBodyContainer = document.querySelector(`.attached-modal[data-userid="${userId}"] > .body`);
    if(messageBodyContainer) {
        const typing_loader = messageBodyContainer.querySelector('.typing-loader');
        if(type === 'typing') {
            if(attachedModal && !typing_loader) {
                const typingHTML = `
                    <div class="typing-loader">
                        <div class="span">
                            <div class="typing_loader"></div>
                        </div>
                    </div>
                `;
                messageBodyContainer.insertAdjacentHTML('beforeend', typingHTML);
            }
            messageBodyContainer.scrollTo({
                left: 0,
                top: messageBodyContainer.scrollHeight,
                behavior: "smooth"
            });
        } else if(type === 'stopped_typing') {
            if(typing_loader) {
                typing_loader.remove();
            }
        }
    }
}

function messageToRoomHandler(roomId, nsEndPoint) {
    const messageInput = document.querySelector('.send-message > .input').innerHTML;
    // Converting Time in a readable format
    const curTime = new Date();
    const timeObj = {
        hours: curTime.getHours(),
        minutes: curTime.getMinutes()
    }
    const time = `${timeObj.hours}:${timeObj.minutes}`;
    const convertedTime = tConvert (time);
    // Checking if the input is not empty
    if(messageInput.length > 0) {
        const messageInputContainer = document.querySelector('.send-message > .input');
        messageInputContainer.innerHTML = "";
        messageInputContainer.focus();

        const userDp = document.querySelector('#user-dp');
        const messageObj = {
            user: {
                id: userDp.dataset.userid,
                name: userDp.getAttribute('alt'),
                image: userDp.getAttribute('src')
            },
            body: messageInput,
            time: convertedTime
        }
        addMessageToRoom(messageObj, roomId, nsEndPoint, true);

        postMessageToRoom(roomId, nsEndPoint, messageInput, convertedTime);
    }
}

async function postMessageToRoom(roomId, nsEndPoint, messageInput, time) {
    const res = await fetch(`${window.location.origin}/message/send?toRoom=true&roomId=${roomId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: messageInput,
            time: time,
            nsEndPoint: nsEndPoint
        })
    });

    const data = await res.json();
    console.log(data);

    // if(data.acknowledgment.type === "success") {
    //     addMessageToRoom(data.acknowledgment.messageObj);
    // }
}

function tConvert (time) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)?$/) || [time];
  
    if (time.length > 1) { // If time format correct
      time = time.slice (1);  // Remove full string match value
      time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
}

  module.exports = {
      addReplyModal,
      addMessageModal,
      pushRecievedMessageToUI,
      fetchMesages,
      postMessages,
      showMessageToUI,
      showTypingStatus,
      messageToRoomHandler   
  }