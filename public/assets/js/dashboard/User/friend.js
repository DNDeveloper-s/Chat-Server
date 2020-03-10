

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

module.exports = { addFriend, updateNotificationCount };