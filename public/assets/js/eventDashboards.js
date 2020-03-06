const { addModal } = require('./dashboard/Modal/addModal')

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
    
}