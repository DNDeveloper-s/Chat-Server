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
                <div class="notification" data-type="${cur.notificationType}">
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
                        <div class="action_btn pointer yes">
                            <img src="/assets/images/check.svg" alt="">
                        </div>
                        <div class="action_btn pointer no">
                            <img src="/assets/images/close.svg" alt="">
                        </div>
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
        })
        declineReqLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const friendId = this.closest('.notification').querySelector('.image').dataset.userid;
                declineFriendRequest(friendId);
            });
        })

        const closeNotificationBtns = firstChoiceContainer.querySelector('.delete-notification');
        if(closeNotificationBtns) {
            closeNotificationBtns.forEach(closeBtn => {
                closeBtn.addEventListener('click', function(e) {
                    deleteNotification()
                });
            })  
        }
    }

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
        loader();

        // Fetching and posting user details to UI
        updateUserDetails(userId);

        const arrOfMessages = await fetchMesages(userId);

        // Attaching message to UI
        showMessageToUI(arrOfMessages);

        const attachedModal = modalEl.querySelector('.attached-modal');
        const sendMessageBtn = attachedModal.querySelector('.send_direct_message');

        sendMessageBtn.addEventListener('click', function(e) {
            const messageInput = attachedModal.querySelector('.input_message').value;
            const curTime = new Date();
            const timeObj = {
                hours: curTime.getHours(),
                minutes: curTime.getMinutes()
            }
            const time = `${timeObj.hours}:${timeObj.minutes}`;
            const convertedTime = tConvert (time);
            postMessages(userId, messageInput, convertedTime);
        })
    }

}

async function pushRecievedMessageToUI(messageObj) {
    const attachedModal = document.querySelector(`.attached-modal[data-userid="${messageObj.userId}"]`); 
    if(attachedModal) {
        const messageBodyContainer = document.querySelector('.attached-modal > .body');
        const messageHTML = `
            <div class="message" data-id="${messageObj.sender}">
                <div class="body">
                    ${messageObj.body}
                    <div class="time">
                        ${messageObj.time}
                        ${messageObj.sender === 'self' ? '<img src="/assets/images/send-tick.svg" alt="DNDeveloper">' : ''}
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

module.exports = { 
    addFriend, 
    removeFriend, 
    updateNotificationCount, 
    loadNotifications, 
    updateStatus, 
    addMessageModal,
    pushRecievedMessageToUI
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