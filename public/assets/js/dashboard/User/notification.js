const {acceptFriendRequest, declineFriendRequest } = require('./friend');
const { addReplyModal } = require('./message');
const { joinRoom } = require('../Room/addRoom');

function updateNotificationCount(notificationCount) {
    const notificationCounter = document.querySelector('.notification-count');
    notificationCounter.dataset.nothing = "false";
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
        const modalEl = document.querySelector('.modal');
        const firstChoiceContainer = modalEl.querySelector('.first-choice');
        const loaderContainer = modalEl.querySelector('.loader-container');
        loaderContainer.remove();
        if(!data.acknowledgment.notifications.length > 0) {
            const htmlToInject = `
                <div class="nothing_to_show">
                    <hr>
                    No New Notifications
                </div>
            `;
            firstChoiceContainer.insertAdjacentHTML('beforeend', htmlToInject);
        }
        data.acknowledgment.notifications.forEach((cur, ind) => {
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
                        ${cur.notificationType === 'mentioned_msg' ? `<div class="action_btn pointer yes show_msg" data-endPoint="${cur.nsEndPoint}" data-roomId="${cur.roomId}">See</div>` : ''}
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
        const seeMessageBtns = firstChoiceContainer.querySelectorAll('.notification[data-type="mentioned_msg"] > .confirm > .action_btn.show_msg');
        seeMessageBtns.forEach(seeMsgBtn => {
            seeMsgBtn.addEventListener('click', function(e) {
                const { connectToNs, loadNamespace } = require('../Namespace/nsFunctionaily');
                joinRoom({
                    roomId: this.dataset.roomid,
                    nsEndPoint: this.dataset.endpoint
                });
                loadNamespace(this.dataset.endpoint, true);
                connectToNs(this.dataset.endpoint, true);

                /// Removing Modal
                const rootEl = document.getElementById('root');
                const backDropEl = rootEl.querySelector('.back-drop');
                const modalEl = rootEl.querySelector('.modal');
                backDropEl.classList.add('remove');
                modalEl.classList.add('remove');
                setTimeout(() => {
                    rootEl.querySelector('.back-drop').remove();
                    rootEl.querySelector('.modal').remove();
                }, 200)
            })
        })
        const closeNotificationBtns = firstChoiceContainer.querySelectorAll('.delete-notification');
        if(closeNotificationBtns) {
            closeNotificationBtns.forEach(closeBtn => {
                closeBtn.addEventListener('click', function(e) {
                    const notificationId = closeBtn.closest('.notification').dataset.id;
                    deleteNotificationById(notificationId, true);
                });
            })  
        }
    }

}

async function deleteNotificationById(notificationId, instantRemove) {
    const res = await fetch(`${window.location.origin}/dashboard/workspace?deleteNotificationById=true&notificationId=${notificationId}`, {
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
        notificationCount.dataset.nothing = "true";
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

    // // Update notification count on user dp
    // const notificationCount = document.querySelector('.notification-count');
    // notificationCount.innerHTML = data.acknowledgment.notificationCount;

    // Update notification count on friend dp
    const notificationCount = document.querySelector(`.friend[data-userid="${notificationObj.userDetails.userId}"]`);
    notificationCount.querySelector('.new-notification').dataset.nothing = "false";
    notificationCount.querySelector('.new-notification').innerHTML = data.acknowledgment.notificationCount;
}

async function deleteNotificationByType(userId, type) {
    const res = await fetch(`${window.location.origin}/dashboard/workspace?deleteNotificationByType=true`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: userId,
            type: type
        })
    });
    const data = await res.json();
    console.log(data);
    return data.acknowledgment.type;
}

module.exports = {
    updateNotificationCount,
    loadNotifications,
    deleteNotificationById,
    postNotificationToSelf,
    deleteNotificationByType
}