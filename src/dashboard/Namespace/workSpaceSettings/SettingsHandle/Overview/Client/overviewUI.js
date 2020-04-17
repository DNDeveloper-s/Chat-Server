const { fetchSingleWorkSpaceSS } = require('../../../../../../utilities');

/**
 * 
 * @param {String} nsEndPoint 
 * @param {Element} modalEl 
 */

function injectOverviewDetails(nsEndPoint = String) {

    // Fecthing Workspace details
    const workSpace = fetchSingleWorkSpaceSS(nsEndPoint);

    console.log(nsEndPoint);

    // Injecting Image to Input
    const imageHolder = modalEl.querySelector('.workspace_image_holder');
    imageHolder.querySelector('img').src = workSpace.image;

    // Injecting Name to Input
    const nameInput = modalEl.querySelector('.workspace_name_input');
    nameInput.value = workSpace.title;

    // Injecting EndPoint to Inpt
    const endPointInput = modalEl.querySelector('.workspace_endpoint_input');
    endPointInput.value = workSpace.endPoint;
}

module.exports = {
    injectOverviewDetails
}