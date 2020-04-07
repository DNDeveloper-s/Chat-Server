const { settingHTML } = require('./settingsHTML');

module.exports.loadSettingHTML = (settingName = String, modalEl = Element) => {
    const htmlToAdd = settingHTML(settingName);
    const settingContainer = modalEl.querySelector('.main_nav');

    // Removing previous Setting before showing next Setting
    settingContainer.innerHTML = '';

    // Inserting New Setting to HTML
    settingContainer.insertAdjacentHTML('beforeend', htmlToAdd);

}