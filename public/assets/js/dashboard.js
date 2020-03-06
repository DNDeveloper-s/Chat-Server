require('./eventDashboards')();

const { nsListeners } = require('./dashboard/Namespace/nsFunctionaily');

nsListeners();

const generateInviteLink = () => {
    const genBtn = document.querySelector('.send-message > button[type="submit"]');
    console.log(genBtn);
    
    genBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const nsName = window.location.search.split('name=')[1];
        const res = await fetch(`${window.location.origin}/dashboard/workspace?nsName=${nsName}&genInvLink=true`, {
            method: "POST"
        });

        const data = await res.json();

        console.log(data);
        
    })
}

const connectToNamespace = () => {
    const input = document.querySelector('.keepItRight.mob-drop-down > input[placeholder="Search here!"]');
    const connectBtn = input.nextElementSibling;

    connectBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const res = await fetch(`${window.location.origin}/dashboard/workspace?nsName=${input.value.split('-')[0]}&connectByLink=true&connectTo=${input.value}`, {
            method: "POST"
        })

        const data = await res.json();

        console.log(data);
        
    })
}

generateInviteLink();
connectToNamespace();