const { fetchSingleWorkSpaceSS } = require('../../../../../../utilities');
const { updateSettingsChangeSS } = require('../../../settingsServer');

/**
 * 
 * @param {String} nsEndPoint 
 */

function initUploadImage(nsEndPoint = String) {
    // Grabbing Upload Image Btn through DOM
    const uploadImageBtn = modalEl.querySelector('.workspace_add_image_btn_holder');
    const imageInput = uploadImageBtn.parentElement.querySelector('input[type="file"]');
    const imageHolder = modalEl.querySelector('.workspace_image_holder');

    // Fetching cur Workspace Settings 'all_workspaces'
    // Its not the temporary settings
    const workSpace = fetchSingleWorkSpaceSS(nsEndPoint);

    // Event Handler
    uploadImageBtn.addEventListener('change', function(e) {
        const image = imageInput.files[0];
        const URL = window.webkitURL || window.URL;
        const url = URL.createObjectURL(image);
        
        // Changing source of imageHolder 'Temporaraily'
        imageHolder.querySelector('img').src = url;
        imageHolder.classList.add('changed');
        
        window.nsImageToUpdate = image;

        // Working with Temporary Settings
        updateSettingsChangeSS({
            nsEndPoint: nsEndPoint,
            image: image,
        });
    })
}

/**
 * 
 * @param {String} nsEndPoint 
 */

function initRemoveImage(nsEndPoint = String) {
    // Grabbing Upload Image Btn through DOM
    const removeImageBtn = modalEl.querySelector('.workspace_remove_image_btn_holder');
    const imageHolder = modalEl.querySelector('.workspace_image_holder');

    // Fetching cur Workspace Settings 'all_workspaces'
    // Its not the temporary settings
    const workSpace = fetchSingleWorkSpaceSS(nsEndPoint);

    // Event Handler
    removeImageBtn.addEventListener('click', function(e) {
        
        // Changing source of imageHolder 'Temporaraily'
        imageHolder.querySelector('img').src = '/assets/images/default.jpg';
        imageHolder.classList.add('changed');
        
        window.nsImageToUpdate = '/assets/images/default.jpg';

        // Working with Temporary Settings
        updateSettingsChangeSS({
            nsEndPoint: nsEndPoint,
            image: '/assets/images/default.jpg',
        });
        
    })
}

function initWorkSpaceName(nsEndPoint = String) {
    // Grabbing Input El through DOM
    const nameInput = modalEl.querySelector('.workspace_name_input');

    // Old Value
    const oldName = nameInput.value;

    // Fetching Temp Settings
    const settings = require('../../../settingsServer').fetchChangedSettings();
    
    // Checking even if temp changed settings exist
    // Means even if user has changed value yet or any changes yet to being saved
    if(settings && settings.title) {
        // Setting Changed Value even if its Temp
        nameInput.value = settings.title;

        nameInput.classList.add('changed');
    }

    // Adding Event Listener
    nameInput.addEventListener('focusout', function(e) {
        console.log(oldName, nameInput.value);
        if(oldName === nameInput.value) {
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                title: 'undefined',
            });

            nameInput.classList.remove('changed');
        } else {
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                title: nameInput.value,
            });

            nameInput.classList.add('changed');
        }
    });
}

function disableEndPointInput(nsEndPoint) {
    const endPointInput = modalEl.querySelector('.workspace_endpoint > input');

    endPointInput.addEventListener('keypress', function(e) {
        e.preventDefault();
        console.log(this.value);
    })
}

module.exports = {
    initUploadImage,
    initRemoveImage,
    initWorkSpaceName,
    disableEndPointInput
}