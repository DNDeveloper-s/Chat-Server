const { initHandlers } = require('./Client/roomSettings');

module.exports.roomFunctionality = () => {
    const roomId = document.querySelector('.room-details').dataset.roomid;
    const nsEndPoint = document.querySelector('.nameSpaceDetails-Room_container').dataset.nsendpoint;
       
    // Add Event Listeners to all message handlers
    initHandlers(roomId, nsEndPoint);
    
}