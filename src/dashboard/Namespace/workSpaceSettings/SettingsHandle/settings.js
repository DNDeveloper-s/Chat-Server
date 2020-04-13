const { settingHTML } = require('./settingsHTML');
const { fetchChangedSettings } = require('../settingsServer');

module.exports.loadSettingHTML = (settingName = String, modalEl = Element) => {
    const htmlToAdd = settingHTML(settingName);
    const settingContainer = modalEl.querySelector('.main_nav');

    // Adding Active Class to role List items
    const item = modalEl.querySelector(`.list_item.settings_nav_item[data-navsetting="${settingName}"]`);
    let toBeRemoveEl = null;
    item.parentElement.children.forEach(node => {
        if(node.classList.contains('active')) {
            toBeRemoveEl = node;
        }
    })
    if(toBeRemoveEl) {
        toBeRemoveEl.classList.remove('active');
    }
    item.classList.add('active');

    // Removing previous Setting before showing next Setting
    settingContainer.innerHTML = '';
    
    // Inserting New Setting to HTML
    settingContainer.insertAdjacentHTML('beforeend', htmlToAdd);

    // Importing and executing functionallity from the required Module
    // Making String to first letter UpperCase
    const ModuleFolder = `${settingName.slice(0, 1).toUpperCase()}${settingName.slice(1)}`;
    const fn = require(`./${ModuleFolder}/${settingName}`);
    fn[settingName](modalEl);

}

module.exports.settingChanged = (setting, value) => {
    // Fethced Temproray Changes Setting Array 
    const settingArr = fetchChangedSettings();
    
    const savePopupEl = document.querySelector('.save_modal');
    if(settingArr.length > 0) {
        savePopupEl.classList.add('savePopup');
    } else {
        savePopupEl.classList.remove('savePopup');
    }
}