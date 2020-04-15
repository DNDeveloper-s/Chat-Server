const { loadSettingHTML } = require('./SettingsHandle/settings'); 
const { playSound } = require('../../../utilities');

module.exports.navItemHandler = () => {
    // Current Modal Element
    window.modalEl = document.querySelector('.modal[data-id="workspace_settings"]');
            
    // Loading Default Setting HTML
    loadSettingHTML('roles', modalEl);
    
    // Array of NavItems Element to be clicked on
    const navItemsEl = modalEl.querySelectorAll('.settings_nav_item');

    navItemsEl.forEach(navItemEl => {
        navItemEl.addEventListener('click', function(e) {

            // Playing Sound
            playSound({
                name: 'dryerOnMetal',
                volume: 0.05
            })

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

module.exports.reloadActiveSetting = (options) => {
    // First Finding which setting is active
    const activeSetting = modalEl.querySelector('.list > .list_item.settings_nav_item.active').dataset.navsetting;

    if(activeSetting === 'roles') {

        // Storing Scroll Position to make it back
        const roles_overview = document.querySelector('.roles_overview');
        const scrollTop = roles_overview.scrollTop;
        console.log(scrollTop);


        // Now Finding which role is active
        let activeRoleEl = modalEl.querySelector('.role_list > .role_list_item.active');
        let activeRole;

        if(activeRoleEl) {
            activeRole = activeRoleEl.dataset.roletag;
        }

        if(options && options.defaultRole) {
            activeRole = options.defaultRole;
        }

        loadSettingHTML(activeSetting, modalEl, {
            default: activeRole,
        });
    
        // Resetting Scroll Position to old state
        const roles_overview2 = document.querySelector('.roles_overview');
        roles_overview2.scrollTo(0, scrollTop);
        const scrollTop2 = roles_overview.scrollTop;
        console.log(scrollTop2);
    }

}