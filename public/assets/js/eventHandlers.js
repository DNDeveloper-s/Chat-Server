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
}