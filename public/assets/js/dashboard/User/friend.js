const { loader } = require('../../utilities');

async function addFriend(friendId) {
    
    const res = await fetch(`${window.location.origin}/dashboard/add-friend?friendId=${friendId}&sendRequest=true`, {
        method: "POST"
    });

    const data = await res.json();

    console.log(data);
}

async function removeFriend(friendId) {

}

async function updateStatus(friendDetails) {
    const friendsListContainer = document.querySelector('.friends-list');
    const friendToUpdate = document.querySelector(`.friend.userLink[data-userid="${friendDetails._id}"]`);
    console.log(friendDetails._id, friendToUpdate);
    friendToUpdate.dataset.status = friendDetails.status;
}

function updateNotificationCount(notificationCount) {
    const notificationCounter = document.querySelector('.notification-count');
    
    notificationCounter.innerHTML = notificationCount;
    console.log(notificationCount);
}

async function loadNotifications(userId) {
    console.log(userId);
    
    const res = await fetch(`${window.location.origin}/dashboard/workspace?getNotifications=true&userId=${userId}`, {
        method: "GET"
    });

    const data = await res.json();

    console.log(data);

    if(data.acknowledgment.type === 'success') {
        const modalEl = document.querySelector('.modal.blueBg');
        const firstChoiceContainer = modalEl.querySelector('.first-choice');
        const loaderContainer = modalEl.querySelector('.loader-container');
        loaderContainer.remove();
        if(!data.acknowledgment.notifications.list.length > 0) {
            const htmlToInject = `
                <div class="nothing_to_show">
                    <hr>
                    No New Notifications
                </div>
            `;
            firstChoiceContainer.insertAdjacentHTML('beforeend', htmlToInject);
        }
        data.acknowledgment.notifications.list.forEach((cur, ind) => {
            const htmlToInject = `
                <div class="notification" data-id="${cur._id}" data-type="${cur.notificationType}">
                    <div class="delete-notification pointer">
                        <img src="/assets/images/remove.svg" alt="close">
                    </div>
                    <div class="image pointer" data-userId="${cur.userDetails.userId}">
                        <img src="${cur.userDetails.image}" alt="DNDeveloper">
                    </div>
                    <div class="body">
                        <p>${cur.message}</p>
                    </div>
                    <div class="confirm">
                        ${cur.notificationType === 'frnd_req' ? '<div class="action_btn pointer yes"> <img src="/assets/images/check.svg" alt=""> </div><div class="action_btn pointer no"> <img src="/assets/images/close.svg" alt=""> </div>' : ''}
                        ${cur.notificationType === 'rcvd_msg' ? '<div class="action_btn pointer yes reply">Reply</div>' : ''}
                    </div>
                    <div class="loader-container hidden noMargin">
                        <svg width="40" height="40">
                            <circle class="loader" cx="20" cy="20" r="17"></circle>
                        </svg>
                    </div>
                </div>
            `;
            firstChoiceContainer.insertAdjacentHTML('beforeend', htmlToInject);
        });

        const acceptReqLinks = firstChoiceContainer.querySelectorAll('.notification[data-type="frnd_req"] > .confirm > .action_btn.yes');
        const declineReqLinks = firstChoiceContainer.querySelectorAll('.notification[data-type="frnd_req"] > .confirm > .action_btn.no');
        acceptReqLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const friendId = this.closest('.notification').querySelector('.image').dataset.userid;
                acceptFriendRequest(friendId);
            });
        });
        declineReqLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const friendId = this.closest('.notification').querySelector('.image').dataset.userid;
                declineFriendRequest(friendId);
            });
        });
        const replyBtns = firstChoiceContainer.querySelectorAll('.notification[data-type="rcvd_msg"] > .confirm > .action_btn.reply');
        replyBtns.forEach(replyBtn => {
            replyBtn.addEventListener('click', function(e) {
                const notificationId = replyBtn.closest('.notification').dataset.id;
                deleteNotification(notificationId, false);
                const friendId = this.closest('.notification').querySelector('.image').dataset.userid;
                addReplyModal(friendId);
            });
        });

        const closeNotificationBtns = firstChoiceContainer.querySelectorAll('.delete-notification');
        if(closeNotificationBtns) {
            closeNotificationBtns.forEach(closeBtn => {
                closeBtn.addEventListener('click', function(e) {
                    const notificationId = closeBtn.closest('.notification').dataset.id;
                    deleteNotification(notificationId, true);
                });
            })  
        }
    }

}

async function deleteNotification(notificationId, instantRemove) {
    const res = await fetch(`${window.location.origin}/dashboard/workspace?deleteNotifications=true&notificationId=${notificationId}`, {
        method: "POST"
    });

    const data = await res.json();

    console.log(data);

    if(instantRemove) {
        const notificationToDelete = document.querySelector(`.notification[data-id="${notificationId}"]`);
        notificationToDelete.remove();
    }

    // Update notification count on user dp
    const notificationCount = document.querySelector('.notification-count');
    notificationCount.innerHTML = data.acknowledgment.notificationCount;

    if(data.acknowledgment.notificationCount == 0) {
        const firstChoiceContainer = document.querySelector('.first-choice');
        const htmlToInject = `
            <div class="nothing_to_show">
                <hr>
                No New Notifications
            </div>
        `;
        firstChoiceContainer.insertAdjacentHTML('beforeend', htmlToInject);
    }
}

async function addReplyModal(friendId) {
    const modalEl = document.querySelector('.modal[data-id="notifications"]');
    const backDrop = document.querySelector('.back-drop');

    modalEl.remove();
    backDrop.remove();


    const { addUserModal } = require('./userUI');

    addUserModal(friendId, 'openChat');
}

async function acceptFriendRequest(friendId) {
    console.log(friendId);
    const res = await fetch(`${window.location.origin}/dashboard/add-friend?friendId=${friendId}&respondToRequest=true&accept=true`, {
        method: "POST"
    });

    const data = await res.json();

    console.log(data);
}

async function declineFriendRequest(friendId) {
    console.log(friendId);
    const res = await fetch(`${window.location.origin}/dashboard/add-friend?friendId=${friendId}&respondToRequest=true&accept=false`, {
        method: "POST"
    });

    const data = await res.json();

    console.log(data);
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
            postMessages(userId, messageInput, convertedTime);
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
        postNotificationToSelf(notificationObj, curUserId);
    }
}

async function postNotificationToSelf(notificationObj, userId) {
    // Posting Notification to Database
    const res = await fetch(`${window.location.origin}/dashboard/workspace?postNotification=true`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            notificationObj: notificationObj,
            userId: userId
        })
    });
    const data = await res.json();
    console.log(data);

    // Update notification count on user dp
    const notificationCount = document.querySelector('.notification-count');
    notificationCount.innerHTML = data.acknowledgment.notificationCount;
}

async function updateUserDetails(userId) {
    // Fetching User Details via userId
    const res = await fetch(`${window.location.origin}/auth/fetch?userId=${userId}`, {
        method: "GET"
    });
    const data = await res.json();
    const userDetails = data.acknowledgment.user;

    // Posting User Details to UI
    const attachedModal = document.querySelector('.attached-modal'); 
    const userImg = attachedModal.querySelector('.user_details > img');
    const userName = attachedModal.querySelector('.user_details > h5');
    userImg.src = userDetails.image;
    userName.innerHTML = userDetails.name;
}

async function fetchMesages(userId) {
    
    const res = await fetch(`${window.location.origin}/message/fetch?direct=true&userId=${userId}`, {
        method: "GET"
    });

    const data = await res.json();

    console.log(data);
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
        const messageInput = attachedModal.querySelector('.input_message');
        messageInput.value = "";
        messageInput.focus();
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

module.exports = { 
    addFriend, 
    removeFriend, 
    updateNotificationCount, 
    loadNotifications, 
    updateStatus, 
    addMessageModal,
    pushRecievedMessageToUI,
    showTypingStatus
};

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