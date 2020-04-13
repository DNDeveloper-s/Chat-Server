const { initPickr, toggleSwitch, fetchSingleWorkSpaceSS, dragNdrop } = require('../../../../../../utilities');
const { updateSettingsChangeSS, fetchChangedSettings } = require('../../../settingsServer');

function initPriorityForRoles(modalEl) {
    
    // Special Utility Function for DragNDrop in Roles
    dragNdrop('.roles_container', function() {
        // # Callback fired once something dragged and dropped somewhere

        // Fetching SettingsObj
        const settings = fetchChangedSettings();

        // nsEndPoint
        const nsEndPoint = modalEl.dataset.ns;

        // Creating Changed Priority Object
        const priorities = document.querySelectorAll('.role_list > .role_list_item');
        priorityObj = {};
        priorities.forEach(cur => {
            priorityObj[cur.dataset.roletag] = +cur.dataset.count;
        });


        // Creating according what is different with old value in DB (Session Storage)
        const workSpace = fetchSingleWorkSpaceSS(nsEndPoint);
        workSpace.roles.custom.forEach(role => {
            // Role List Item Element in Drag and Drop Menu
            const roleListItemEl = document.querySelector(`.role_list > .role_list_item[data-roletag="${role.roleTag}"]`);
            
            if(role.priority !== priorityObj[role.roleTag]) {

                // Taking Count to UI
                if(priorityObj[role.roleTag] > role.priority) {
                    // Removing ArrowEl if its already present to prevent clashing
                    const arrowEl = roleListItemEl.querySelector('.arrow');
                    if(arrowEl) {
                        arrowEl.remove();
                    }
                    // Injecting Arrow El 
                    roleListItemEl.insertAdjacentHTML('beforeend', `<div class="arrow"><img src="/assets/images/down-chevron.svg"></div>`);
                } else if(priorityObj[role.roleTag] < role.priority) {
                    // Removing ArrowEl if its already present to prevent clashing
                    const arrowEl = roleListItemEl.querySelector('.arrow');
                    if(arrowEl) {
                        arrowEl.remove();
                    }
                    // Injecting Arrow El 
                    roleListItemEl.insertAdjacentHTML('beforeend', `<div class="arrow"><img src="/assets/images/up-chevron.svg"></div>`);
                }

                updateSettingsChangeSS({
                    nsEndPoint: nsEndPoint,
                    roleTag: role.roleTag,
                    priority: priorityObj[role.roleTag],
                    method: 'adding'
                });
            } else {
                if(settings && settings.roles.custom[role.roleTag] && settings.roles.custom[role.roleTag].priority) {
                    updateSettingsChangeSS({
                        nsEndPoint: nsEndPoint,
                        roleTag: role.roleTag,
                        priority: 'undefined',
                        method: 'removing'
                    });
                }

                // Taking Count to UI
                // Removing ArrowEl once priority is same as old
                const arrowEl = roleListItemEl.querySelector('.arrow');
                if(arrowEl) {
                    arrowEl.remove();
                }
            }
        });
        
    });
}

/**
 * 
 * @param {String} role 
 * @param {String} nsEndPoint 
 */

function initColorPickrForRole(role = String, nsEndPoint = String) {
    // Grabbing Element using DOM
    const roleColorInput = document.querySelector(`.role_color > .settingContainer > .color_picker`);

    // SettingChangeContainer for UI
    const roleSettingEl = roleColorInput.closest('.settingContainer');

    // Old Value
    let roleColor = role.color;

    // Fetching Temp Settings
    const settings = require('../../../settingsServer').fetchChangedSettings();
    
    // Checking even if temp changed settings exist
    // Means even if user has changed value yet or any changes yet to being saved
    if(settings) {
        // tempColor is that // User has changed but not saved yet
        let tempColor = settings.roles.custom[role.roleTag].color;
        if(tempColor) {
            roleColor = tempColor;

            // Reflecting Change to UI
            roleSettingEl.classList.add('toBeSaved');
        }
    }

    // Initializing Color Picker
    initPickr(roleColorInput, roleColor, (hexColor) => {
        // Executing the save
        if(role.color === hexColor) {
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                roleTag: role.roleTag,
                color: 'undefined',
                method: 'removing'
            });

            // Reflecting Change to UI
            roleSettingEl.classList.remove('toBeSaved');
        } else {
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                roleTag: role.roleTag,
                color: hexColor,
                method: 'adding'
            });

            // Reflecting Change to UI
            roleSettingEl.classList.add('toBeSaved');
        }
    });
}

/**
 * 
 * @param {String} role 
 * @param {String} nsEndPoint 
 */

function initRoleName(role = String, nsEndPoint = String) {
    // Grabbing Element using DOM
    const roleNameInput = document.querySelector(`[name="role_name_${role.roleTag}"]`);

    // SettingChangeContainer for UI
    const roleSettingEl = roleNameInput.closest('.settingContainer');

    // Old Value
    const oldRoleName = role.name;

    // Fetching Temp Settings
    const settings = require('../../../settingsServer').fetchChangedSettings();
    
    // Checking even if temp changed settings exist
    // Means even if user has changed value yet or any changes yet to being saved
    if(settings) {
        // tempName is that // User has changed but not saved yet
        let tempName = settings.roles.custom[role.roleTag].name;
        if(tempName) {
            // Setting Changed Value even if its Temp
            roleNameInput.value = tempName;

            // Reflecting Change to UI
            roleSettingEl.classList.add('toBeSaved');
        }
    }

    // Event Listener
    roleNameInput.addEventListener('focusout', function(e) {
        if(oldRoleName === this.value) {
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                roleTag: role.roleTag,
                name: 'undefined',
                method: 'removing'
            });

            // Reflecting Change to UI
            roleSettingEl.classList.remove('toBeSaved');
        } else {
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                roleTag: role.roleTag,
                name: this.value,
                method: 'adding'
            });

            // Reflecting Change to UI
            roleSettingEl.classList.add('toBeSaved');
        }
    });

    roleNameInput.addEventListener('focusin', function(e) {
        roleSettingEl.classList.remove('toBeSaved');
    });
}

/**
 * 
 * @param {String} role 
 * @param {String} nsEndPoint 
 */

function initPermissions(role = String, nsEndPoint = String) {
    // Fetching Temp Settings
    const settings = fetchChangedSettings();

    if(settings) {
        const roles = Object.keys(settings.roles.custom);

        // Loading temp permission settings to UI with message 'Yet to be saved' 
        for(let i = 0; i < roles.length; i++) {
            const permissions = Object.keys(settings.roles.custom[roles[i]].permissions);
            
            const container = document.querySelector(`.modal .roles_overview[data-roletag="${roles[i]}"]`);

            if(container) {
                for(let j = 0; j < permissions.length; j++) {
                    const permissionEl = container.querySelector(`.permission.${permissions[j]}`);
                    permissionEl.classList.add('toBeSaved');
                    const inputEl = permissionEl.querySelector('.input_control.checkBox-myOwn');
                    inputEl.dataset.checked = settings.roles.custom[roles[i]].permissions[permissions[j]];
                }
            }
        }
    }

    // Toggling Switch
    toggleSwitch(function(permission, value) {

        // Checking if the value is resetted to its old value to database
        const curWorkspace = fetchSingleWorkSpaceSS(nsEndPoint);
        const dbRole = curWorkspace.roles.custom.filter(cur => cur.roleTag === role.roleTag)[0];
        const dbValue = dbRole.permissions[permission];

        // Permission Element in UI 
        const permissionEl = document.querySelector(`.permission.${permission}`);

        console.log(permission, dbValue, value);
        if(dbValue == value) {
            permissionEl.classList.remove('toBeSaved');
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                roleTag: role.roleTag,
                category: 'permission_toggle',
                permission: permission,
                value: 'undefined',
                method: 'removing'
            });
        } else {
            permissionEl.classList.add('toBeSaved');
            updateSettingsChangeSS({
                nsEndPoint: nsEndPoint,
                roleTag: role.roleTag,
                category: 'permission_toggle',
                permission: permission,
                value: value,
                method: 'adding'
            });
        }
    });

}

module.exports = {
    initColorPickrForRole,
    initRoleName,
    initPermissions,
    initPriorityForRoles
}