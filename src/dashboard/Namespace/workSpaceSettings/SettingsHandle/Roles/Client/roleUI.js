const roleSettings = require('./roleSettings');

/**
 * New UI
 * 
 * @param {Array} roles 
 * @param {Element} modalEl 
 */


function loadRoleList(roles = Array, modalEl = Element) {
    const listContainer = modalEl.querySelector('.roles_container > .role_list');

    // Clearing previous Elements to prevent clashing
    listContainer.innerHTML = '';

    // Looping through roles Array to load all the roles to list
    roles.forEach(role => {
        // Adding Role to UI
        addRoleToList(role, modalEl);
    })
}

/**
 * Adding Role to UI
 * 
 * @param {Object} role 
 * @param {Element} modalEl 
 */

function addRoleToList(role = Object, modalEl = Element) {
    const listContainer = modalEl.querySelector('.roles_container > .role_list');
    
    const htmlToAdd = `
        <div class="role_list_item" data-count="${role.priority}" data-roletag="${role.roleTag}">
            <div class="place_holder" style="color: ${role.color}" >${role.name}</div>
        </div>
    `;

    listContainer.insertAdjacentHTML('beforeend', htmlToAdd);
}

/**
 * 
 * @param {String} modalEl 
 * @param {Function} callback 
 */

function roleListClickHandler(modalEl = Element, callback = Function) {
    const items = modalEl.querySelectorAll('.roles_container > .role_list > .role_list_item');

    items.forEach(item => {
        item.addEventListener('click', function(e) {
            // Adding and Removing "active" class to the clicked item
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

            // Passing Callback with "roleTag"
            callback(this.dataset.roletag);
        }); 
    })
}

/**
 * 
 * @param {String} roleTag 
 * @param {String} nsEndPoint 
 */

function show_role_settings(roleTag = String, nsEndPoint = String) {
    // Fetching Role for the roleTag
    const { fetchRoleByRoleTagSS } = require('../Server/fetchRoles');
    const role = fetchRoleByRoleTagSS(roleTag, nsEndPoint);
    
    // Container to be filled
    const container = document.querySelector('.modal .roles_overview');

    // Getting Desired HTML for load to role details
    const htmlToAdd = require('../../settingsHTML').settingHTML('loadRoleDetails', role); 
    
    // Clearing previous HTML
    container.innerHTML = '';

    // Injecting HTML
    container.innerHTML = htmlToAdd;
    
    // Initializing Color Pikcer Setting
    roleSettings.initColorPickrForRole(role, nsEndPoint);

    // Initializing  Role_Name input setting
    roleSettings.initRoleName(role, nsEndPoint);

}


module.exports = {
    show_role_settings,
    loadRoleList,
    roleListClickHandler
}
