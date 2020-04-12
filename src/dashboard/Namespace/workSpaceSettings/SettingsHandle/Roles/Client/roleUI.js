const roleSettings = require('./roleSettings');
const html = require('../../settingsHTML');

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
    
    // Initializing Color Pikcer Setting
    roleSettings.initPriorityForRoles(modalEl);
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
    // Adding Active Class to role List items
    const item = document.querySelector(`.roles_container > .role_list > .role_list_item[data-roletag="${roleTag}"]`);
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

    // Fetching Role for the roleTag
    const { fetchRoleByRoleTagSS } = require('../Server/fetchRoles');
    const role = fetchRoleByRoleTagSS(roleTag, nsEndPoint);
    
    // Container to be filled
    const container = document.querySelector('.modal .roles_overview');

    /**
     * Loading and Injecting Roles Details
     */

    // Getting Desired HTML for load to role details
    const htmlToAdd = html.settingHTML('loadRoleDetails', role); 
    
    // Clearing previous HTML
    container.innerHTML = '';

    // Injecting HTML
    container.insertAdjacentHTML('beforeend', htmlToAdd);
    
    // Initializing Color Pikcer Setting
    roleSettings.initColorPickrForRole(role, nsEndPoint);

    // Initializing  Role_Name input setting
    roleSettings.initRoleName(role, nsEndPoint);

    /**
     * Loading and Injecting Permissions
     */

    // Getting Desired HTML for load permissions
    const permissionHTML = html.settingHTML('loadPermissionsHTML', role);

    // Injecting HTML
    container.insertAdjacentHTML('beforeend', permissionHTML);

    //Initializing Permissions Handler
    roleSettings.initPermissions(role, nsEndPoint);

}

/**
 * 
 * @returns {String} roleTag
 */
// Returning 'RoleTag' which role is loaded right now on settings DOM
function getCurrentLoadedRole() {
    const listItem = document.querySelector('.role_list > .role_list_item.active');
    return listItem.dataset.roletag;
}


module.exports = {
    show_role_settings,
    loadRoleList,
    roleListClickHandler,
    getCurrentLoadedRole
}
