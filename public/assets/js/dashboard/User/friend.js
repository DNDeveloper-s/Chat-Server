

async function addFriend(friendId) {
    console.log(friendId);
    
    const res = await fetch(`${window.location.origin}/dashboard/add-friend?friendId=${friendId}`, {
        method: "POST"
    });

    const data = await res.json();

    console.log(data);
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
                <div class="notification pointer">
                    <div class="delete-notification">
                        <img src="/assets/images/remove.svg" alt="close">
                    </div>
                    <div class="image">
                        <img src="${cur.userDetails.image}" alt="DNDeveloper">
                    </div>
                    <div class="body">
                        <p>${cur.message}</p>
                    </div>
                </div>
            `;
            firstChoiceContainer.insertAdjacentHTML('beforeend', htmlToInject);
        });
    }

}

module.exports = { addFriend, updateNotificationCount, loadNotifications };