const roleSettings = require('./roleSettings');
const html = require('../../settingsHTML');
const { fetchChangedSettings } = require('../../../settingsServer');

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

    let rolePriority = role.priority;

    // Checking Temp Settings for role Priority 
    const settings = fetchChangedSettings();

    if(settings && settings.roles.custom[role.roleTag].priority) {
        rolePriority = settings.roles.custom[role.roleTag].priority;
    
        const htmlToAdd = `
            <div class="role_list_item" data-count="${rolePriority}" data-roletag="${role.roleTag}">
                <div class="place_holder" style="color: ${role.color}" >${role.name}</div>
            </div>
        `;
    
        listContainer.insertAdjacentHTML('beforeend', htmlToAdd);

        // Adding Arrow to UI
        const roleListItemEl = document.querySelector(`.role_list > .role_list_item[data-roletag="${role.roleTag}"]`);
        console.log(role.roleTag);
        if(roleListItemEl) {
            // Removing ArrowEl if its already present to prevent clashing
            const arrowEl = roleListItemEl.querySelector('.arrow');
            if(arrowEl) {
                arrowEl.remove();
            }

            if(role.priority > rolePriority) {
                // Injecting Arrow El 
                roleListItemEl.insertAdjacentHTML('beforeend', `<div class="arrow"><img src="/assets/images/up-chevron.svg"></div>`);
            } else if(role.priority < rolePriority) {
                // Injecting Arrow El 
                roleListItemEl.insertAdjacentHTML('beforeend', `<div class="arrow"><img src="/assets/images/down-chevron.svg"></div>`);
            }
        }
    } else {
    
        const htmlToAdd = `
            <div class="role_list_item" data-count="${rolePriority}" data-roletag="${role.roleTag}">
                <div class="place_holder" style="color: ${role.color}" >${role.name}</div>
            </div>
        `;
    
        listContainer.insertAdjacentHTML('beforeend', htmlToAdd);
    }
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
    container.dataset.roletag = roleTag;

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

/**
 * 
 * @param {Object} settingObj 
 */

function updateRoleListUI(settingObj = Object) {
    const roleTags = Object.keys(settingObj.roles.custom);

    roleTags.forEach(roleTag => {
        const role = settingObj.roles.custom[roleTag];

        // List Item Dom
        const roleItem = document.querySelector(`.role_list > .role_list_item[data-roletag="${roleTag}"] > .place_holder`);

        // Updating with condition if they exists
        if(role.color) {
            roleItem.style.color = role.color;
        }
        if(role.name) {
            roleItem.innerHTML = role.name;
        }
        
    })
}


module.exports = {
    show_role_settings,
    loadRoleList,
    roleListClickHandler,
    getCurrentLoadedRole,
    updateRoleListUI
}
