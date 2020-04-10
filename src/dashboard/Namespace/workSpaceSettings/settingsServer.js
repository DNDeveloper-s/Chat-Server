const { fetchSingleWorkSpaceSS } = require('../../../utilities');

function updateSettingsChangeSS(options) {
    // Fetched Temproray Changes Setting Array 
    try {

        let settingObj = fetchChangedSettings();

        const nsDetails = fetchSingleWorkSpaceSS(options.nsEndPoint);

        
        // Initializing the custom roles array to the settingObj [allRoles]
        const allRoles = nsDetails.roles.custom.map(role => {
            return role.roleTag
        })

        // Array to Object Function [Special]
        function arrToObj(arr) {
            let obj = {};

            for(let i = 0; i < arr.length; i++) {
                // Converting to array, which having empty array {members: []}
                obj[arr[i]] = {members: []};
            }

            return obj;
        }

        if(!settingObj) {
            // Setting Count
            window.settingCount = 0;

            settingObj = {
                nsEndPoint: options.nsEndPoint,
                title: options.title || undefined,
                image: options.image || undefined,
                roles: {
                    custom: arrToObj(allRoles)
                }
            }
        }

        // Counting Changes
        if(options.method === 'adding') {
            settingCount++;
        } else if(options.method === 'removing') {
            settingCount--;
        }

        // This is utility function for ....
        // if the property is manually passed 'undefined' for deleting the property
        function roleDetails(prop) {
            let res = undefined;
            if(options[prop]) {
                res = options[prop]

                if(options[prop] === 'undefined') {
                    res = undefined;
                }
            } else if(settingObj.roles.custom[options.roleTag][prop]) {
                res = settingObj.roles.custom[options.roleTag][prop];
            }

            return res;
        }

        settingObj.roles.custom[options.roleTag] = {
            name: roleDetails('name'),
            priority: roleDetails('priority'),
            color: roleDetails('color'),
            members: settingObj.roles.custom[options.roleTag].members
            // permissions: allPermissions
        }

        if(options.category && options.category === 'role_member') {
            settingObj.roles.custom[options.roleTag].members.push({
                action: options.action || undefined,
                userId: options.userId || undefined
            })
        }

        // Saving changed data to SessionStorage
        sessionStorage.setItem('settingsToBeSaved', JSON.stringify(settingObj));

        window.saveModal = document.querySelector('.save_modal');
        if(settingCount > 0) {
            saveModal.classList.add('savePopup');
        } else {
            saveModal.classList.remove('savePopup');
        }

    } catch (e) {
        console.log(e.message);
    }
}

/**
 * 
 * @returns {Array}
 */

function fetchChangedSettings() {
    // Checking If SessionStorage is already initialized
    let jsonData = sessionStorage.getItem('settingsToBeSaved');
    if(!jsonData) {
        return false;
    }

    // JSON Data is actually an Array
    // Parsing JSON Data
    return JSON.parse(jsonData);
}

async function postSaveSettings() {
    const settingObj = fetchChangedSettings();

    const res = await fetch(`${window.location.origin}/workspace/settings?save=true`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            settingObj: settingObj
        })
    })

    return await res.json();
}


module.exports = {
    fetchChangedSettings,
    updateSettingsChangeSS,
    postSaveSettings
}