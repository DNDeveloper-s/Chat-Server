

async function addFriend(friendId) {
    console.log(friendId);
    
    const res = await fetch(`${window.location.origin}/dashboard/add-friend?friendId=${friendId}`, {
        method: "POST"
    });

    const data = await res.json();

    console.log(data);
}

module.exports = { addFriend };