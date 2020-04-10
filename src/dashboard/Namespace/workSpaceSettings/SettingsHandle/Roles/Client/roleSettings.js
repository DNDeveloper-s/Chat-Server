const { initPickr } = require('../../../../../../utilities');
const { updateSettingsChangeSS, deleteSettingsChangeSS } = require('../../../settingsServer');

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

function initRoleName(role, nsEndPoint) {
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

module.exports = {
    initColorPickrForRole,
    initRoleName,
}