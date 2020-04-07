const { loadSettingHTML } = require('./SettingsHandle/loadSetting'); 
const { dragNdrop } = require('../../../utilities');

module.exports.navItemHandler = () => {
    // Current Modal Element
    const modalEl = document.querySelector('.modal[data-id="workspace_settings"]');
    
    // Array of NavItems Element to be clicked on
    const navItemsEl = modalEl.querySelectorAll('.settings_nav_item');

    navItemsEl.forEach(navItemEl => {
        navItemEl.addEventListener('click', function(e) {
            // Grabbing Setting Name from the Button Element
            const setting = this.dataset.navsetting;
            
            // Loading HTML
            loadSettingHTML(setting, modalEl);

            if(setting === 'roles') {
                // Special Utility Function for roles Drag And Drop
                dragNdrop('.roles_container');
            }
        })
    })
}