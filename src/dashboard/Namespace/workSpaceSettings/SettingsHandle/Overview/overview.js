const { injectOverviewDetails } = require('../Overview/Client/overviewUI');
const { initUploadImage, initRemoveImage, initWorkSpaceName, disableEndPointInput } = require('./Client/overviewSettings');

module.exports.overview = () => {
    // Current nsEndPoint
    const nsEndPoint = modalEl.dataset.ns;
    
    // Loading Overview Details
    injectOverviewDetails(nsEndPoint);
    
    // Initializing Upload Image Button
    initUploadImage(nsEndPoint);
    
    // Initializing Remove Image Button
    initRemoveImage(nsEndPoint);
    
    // Initializing Workspace Name Input
    initWorkSpaceName(nsEndPoint);

    disableEndPointInput(nsEndPoint);
}