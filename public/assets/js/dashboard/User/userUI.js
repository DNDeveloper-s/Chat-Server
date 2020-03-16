const { addModal } = require('../Modal/addModal');

async function addUserModal(userId, fn) {
    const nsEndPoint = window.location.search.split('&')[1].split('=')[1];
    if (window.history.replaceState) {
        //prevents browser from storing history with each change:
        window.history.replaceState('Workspace', `${nsEndPoint}`, `/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}&showUserModalDefault=true&userId=${userId}`);
    }
    
    const res = await fetch(`${window.location.origin}/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}&showUserModal=true&userId=${userId}`, {
        method: "GET"
    });

    const data = await res.json();

    console.log(data);

    if(fn) {
        addModal('USER_PROFILE', {
            user: data.acknowledgment.user,
            isItAuthenticatedUser: data.acknowledgment.isItAuthenticatedUser,
            isFriend: data.acknowledgment.isFriend,
            openChat: true
        });
    } else {
        const { addModal } = require('../Modal/addModal');
        addModal('USER_PROFILE', {
            user: data.acknowledgment.user,
            isItAuthenticatedUser: data.acknowledgment.isItAuthenticatedUser,
            isFriend: data.acknowledgment.isFriend
        });
    }
    
}


module.exports = { addUserModal };