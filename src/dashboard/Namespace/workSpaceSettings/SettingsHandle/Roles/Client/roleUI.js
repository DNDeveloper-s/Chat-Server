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
    if(role.priority != 0) {
        const listContainer = modalEl.querySelector('.roles_container > .role_list');

        let rolePriority = role.priority;

        // Checking Temp Settings for role Priority 
        const settings = fetchChangedSettings();

        if(settings && settings.roles.custom[role.roleTag] && settings.roles.custom[role.roleTag].priority) {
            rolePriority = settings.roles.custom[role.roleTag].priority;
        
            const htmlToAdd = html.settingHTML('roleListItem', {
                priority: rolePriority,
                name: role.name,
                color: role.color,
                roleTag: role.roleTag
            });
        
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
    } else {
        const priorityLessContainer = modalEl.querySelector('.roles_container_priorityLess > .role_list_priorityLess');
        const htmlToAdd = html.settingHTML('roleListItem', {
            priority: 0,
            name: role.name,
            color: role.color,
            roleTag: role.roleTag
        });
        priorityLessContainer.insertAdjacentHTML('beforeend', htmlToAdd);
    }
}

/**
 * 
 * @param {String} modalEl 
 * @param {Function} callback 
 */

function roleListClickHandler(modalEl = Element, callback = Function) {
    const items = modalEl.querySelectorAll('.roles_nav .role_list_item');

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
    console.log(roleTag);
    // Adding Active Class to role List items
    const item = document.querySelector(`.roles_nav .role_list_item[data-roletag="${roleTag}"]`);
    const allItems = document.querySelectorAll(`.roles_nav .role_list_item`);
    let toBeRemoveEl = null;
    allItems.forEach(item => {
        if(item.classList.contains('active')) {
            toBeRemoveEl = item;
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

    /**
     * Actions for Role
     */

     // Gettings Desired HTML for Role Actions
    const actionsHTML = html.settingHTML('loadRoleActionsHTML', role);

    // Injecting HTML
    container.insertAdjacentHTML('beforeend', actionsHTML);

    //Initializing Actions Handler
    roleSettings.initActions(role, nsEndPoint);

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


function initCreateRoleBtn() {
    // Grabbing Button from DOM
    const btnContainer = modalEl.querySelector('.actions');
    const addRoleBtn = btnContainer.querySelector('.add_role_btn');
    const addRoleInput = btnContainer.querySelector('.add_role_txt');

    // Initializing Event Listener to Button
    addRoleBtn.addEventListener('click', function(e) {
        // addRoleInput.style.pointerEvents = 'auto';
        addRoleInput.classList.add('active');
        addRoleInput.focus();

        // Adding Event for Non-Target remove
        window.addEventListener('click', clickedOnTarget);
    });

    // Checking for if clicked outside or inside the element
    function clickedOnTarget(e) {
        if(!e.path.includes(btnContainer)) {
            removeInputEl();
        }
    }

    // Remove InputElement
    function removeInputEl() {
        addRoleInput.classList.remove('active');
        window.removeEventListener('click', clickedOnTarget);
    }
}

function roleInputHandler(callback) {
    // Grabbing Button from DOM
    const btnContainer = modalEl.querySelector('.actions');
    const addRoleBtn = btnContainer.querySelector('.add_role_btn');
    const addRoleInput = btnContainer.querySelector('.add_role_txt');

    // Adding Event Listener to input element
    addRoleInput.addEventListener('keypress', function(e) {
        if(e.key === 'Enter') {
            callback(this.value);
        }
    })
}


module.exports = {
    show_role_settings,
    loadRoleList,
    roleListClickHandler,
    getCurrentLoadedRole,
    updateRoleListUI,
    initCreateRoleBtn,
    roleInputHandler,
    addRoleToList
}
