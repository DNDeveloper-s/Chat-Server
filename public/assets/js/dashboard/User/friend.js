
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

module.exports = { 
    addFriend, 
    removeFriend, 
    // updateNotificationCount, 
    // loadNotifications, 
    updateStatus, 
    acceptFriendRequest,
    declineFriendRequest,
    updateUserDetails
    // addMessageModal,
    // pushRecievedMessageToUI,
    // showTypingStatus
};