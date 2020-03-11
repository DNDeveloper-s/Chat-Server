

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
        closeNotificationBtns.forEach(closeBtn => {
            closeBtn.addEventListener('click', function(e) {
                deleteNotification()
            });
        })
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

module.exports = { addFriend, removeFriend, updateNotificationCount, loadNotifications, updateStatus };