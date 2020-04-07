function updateSettingsChangeSS(options) {
    // Fethced Temproray Changes Setting Array 
    const settingArr = fetchChangedSettings();

    // Filtering Array if the setting already persists in array
    let curSetting = settingArr.filter(cur => cur.setting === options.setting && cur.uniqueId === options.uniqueId && cur.nsEndPoint === options.nsEndPoint)[0];

    // Pushing if settings doesn't exists in the array
    if(!curSetting) {
        // Pushing to array new setting
        settingArr.push({
            setting: options.setting,
            value: options.value,
            uniqueId: options.uniqueId,
            nsEndPoint: options.nsEndPoint
        });
    } else if(curSetting.value !== options.value) {
        curSetting.value = options.value;
    }

    // Filtering Array if the setting already persists in array
    settingArr.map(cur => {
        if(cur.setting === options.setting && cur.uniqueId === options.uniqueId && cur.nsEndPoint === options.nsEndPoint) {
            if(cur.value !== options.value) {
                cur.value = options.value;
            }
        }
    });

    // Saving changed data to SessionStorage
    sessionStorage.setItem('settingsToBeSaved', JSON.stringify(settingArr));

    const { settingChanged } = require('./SettingsHandle/settings');
    settingChanged();
}

function deleteSettingsChangeSS (options) {
    // Fethced Temproray Changes Setting Array 
    const settingArr = fetchChangedSettings();

    // Filtering Array if the setting already persists in array
    const newSettingArr = settingArr.filter(cur => cur.setting !== options.setting || cur.uniqueId !== options.uniqueId);

    // Saving changed data to SessionStorage
    sessionStorage.setItem('settingsToBeSaved', JSON.stringify(newSettingArr));

    const { settingChanged } = require('./SettingsHandle/settings');
    settingChanged();
}

/**
 * 
 * @returns {Array}
 */

function fetchChangedSettings() {
    // Checking If SessionStorage is already initialized
    let jsonData = sessionStorage.getItem('settingsToBeSaved');
    if(!jsonData) {
        // If not, Initializing SessionStorage
        sessionStorage.setItem('settingsToBeSaved', JSON.stringify([]));
        jsonData = sessionStorage.getItem('settingsToBeSaved');
    }

    // JSON Data is actually an Array
    // Parsing JSON Data
    return JSON.parse(jsonData);
}

module.exports = {
    fetchChangedSettings,
    deleteSettingsChangeSS,
    updateSettingsChangeSS
}