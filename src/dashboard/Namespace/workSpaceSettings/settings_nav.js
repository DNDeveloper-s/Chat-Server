const { loadSettingHTML } = require('./SettingsHandle/settings'); 

module.exports.navItemHandler = () => {
    // Current Modal Element
    const modalEl = document.querySelector('.modal[data-id="workspace_settings"]');
    
    // Array of NavItems Element to be clicked on
    const navItemsEl = modalEl.querySelectorAll('.settings_nav_item');

    navItemsEl.forEach(navItemEl => {
        navItemEl.addEventListener('click', function(e) {
            // Adding Active Class to role List items
            let toBeRemoveEl = null;
            this.parentElement.children.forEach(node => {
                if(node.classList.contains('active')) {
                    toBeRemoveEl = node;
                }
            })
            if(toBeRemoveEl) {
                toBeRemoveEl.classList.remove('active');
            }
            this.classList.add('active');

            // Grabbing Setting Name from the Button Element
            const setting = this.dataset.navsetting;
            
            // Loading HTML
            loadSettingHTML(setting, modalEl);
        })
    })
}