const { loadSettingHTML } = require('./SettingsHandle/settings'); 

module.exports.navItemHandler = () => {
    // Current Modal Element
    const modalEl = document.querySelector('.modal[data-id="workspace_settings"]');
            
    // Loading Default Setting HTML
    loadSettingHTML('roles', modalEl);
    
    // Array of NavItems Element to be clicked on
    const navItemsEl = modalEl.querySelectorAll('.settings_nav_item');

    navItemsEl.forEach(navItemEl => {
        navItemEl.addEventListener('click', function(e) {
            // Checking if desired setting is alread opened
            const openedSetting = modalEl.querySelector('.settings').dataset.setting;
            if(openedSetting  === this.dataset.navsetting) {
                return;
            }

            // Grabbing Setting Name from the Button Element
            const setting = this.dataset.navsetting;
            
            // Loading HTML
            loadSettingHTML(setting, modalEl);
        })
    })
}