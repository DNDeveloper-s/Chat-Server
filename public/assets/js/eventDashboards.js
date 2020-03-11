const { addModal } = require('./dashboard/Modal/addModal');
const { addUserModal } = require('./dashboard/User/userUI');

module.exports = () => {
    const addNameSpaceBtn = document.querySelector('.add-name_space');
    addNameSpaceBtn.addEventListener('click', () => {
        console.log('Its clicked!');
        
        console.log(addModal);
        

        addModal('NS');
    });
    const addRoomBtn = document.querySelector('.add-room');
    addRoomBtn.addEventListener('click', () => {
        console.log('Its clicked!');
        
        console.log(addModal);
        addModal('ROOM');
    });
    const logOutBtn = document.querySelector('.logout-btn');
    logOutBtn.addEventListener('click', async () => {

        const res = await fetch(`${window.location.origin}/auth/logout`, {
            method: "POST"
        })

        const data = await res.json();

        if(data.acknowledgment.type === "success") {
            console.log('Done!');
            
            window.location = `${window.location.origin}/auth/ui`;
        }
    });
    const nameSpaceNameHolder = document.querySelector('.namespace-name > .namespace-event');
    const nsDropdown = document.querySelector('.namespace-name > .ns-options.dropdown');
    nameSpaceNameHolder.addEventListener('click', function(e) {
        nsDropdown.classList.add('opened');
        document.querySelector('#root').insertAdjacentHTML('afterbegin', `<div class="back-drop noOpaque"></div>`);
        const backDrop = document.querySelector('.back-drop.noOpaque');
        backDrop.addEventListener('click', removeModal);
        const nsOptions = document.querySelectorAll('.ns-option.removeBackDropOnClick');
        nsOptions.forEach(cur => {
            cur.addEventListener('click', removeModal);
        })

        function removeModal() {
            nsDropdown.classList.remove('opened');
            backDrop.remove();
        }
    });
    const getInvCode = nsDropdown.querySelector('.invite-friend');
    getInvCode.addEventListener('click', async(e) => {
        e.preventDefault();
        const nsEndPoint = getInvCode.closest('.ns-options').dataset.id.slice(1);
        
        // const dataString = sessionStorage.getItem('invcode');
        // let data = JSON.parse(dataString);



        // if(!dataString) {
            // console.log('Fetching!');
            const res = await fetch(`${window.location.origin}/dashboard/workspace?nsName=${nsEndPoint}&genInvLink=true`, {
                method: "POST"
            });
    
            data = await res.json();
        // }

        // sessionStorage.setItem('invcode', JSON.stringify(data));  

        setTimeout(() => {
            addModal(`GETINVCODE=${data.acknowledgment.link}`, );
        }, 200);
    })
    const workspaceSettings = nsDropdown.querySelector('.workspace-settings');
    workspaceSettings.addEventListener('click', async(e) => {
        e.preventDefault();
        const nsEndPoint = workspaceSettings.closest('.ns-options').dataset.id;
        const res = await fetch(`${window.location.origin}/dashboard/workspace?nsEndPoint=${nsEndPoint}&getWorkspaceDetails=true`, {
            method: "GET"
        });

        const data = await res.json();

        console.log(data);
        setTimeout(() => {
            addModal(`WORKSPACESETTINGS`, {
                workSpace: data.acknowledgment.workSpace
            });
        }, 200);
    });
    const userLinks = document.querySelectorAll('.userLink > img');
    userLinks.forEach(userLink => {
        userLink.addEventListener('click', function(e) {
            const userId = userLink.closest('.userLink').dataset.userid;
            addUserModal(userId); 
        })
    });
    const notificationCount = document.querySelector('.notification-count');
    notificationCount.addEventListener('click', function () {
        const userId = notificationCount.closest('.userLink').dataset.userid;
        addModal('NOTIFICATIONS', {
            userId: userId
        });
    });
}