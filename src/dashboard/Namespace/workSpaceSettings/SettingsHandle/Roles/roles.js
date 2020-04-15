const { fetchSingleWorkSpaceSS } = require('../../../../../utilities');
const { loadRoleList, roleListClickHandler, show_role_settings, initCreateRoleBtn, roleInputHandler } = require('./Client/roleUI');
const { postNewRole } = require('./Server/postNewRole');

module.exports.roles = (modalEl = Element, options = Object) => {
    // Current nsEndPoint
    const nsEndPoint = modalEl.dataset.ns;
    
    // Fetching Roles for the Session Storage
    const curNsData = fetchSingleWorkSpaceSS(nsEndPoint);
    const roles = curNsData.roles.custom;

    // // If No roles are present
    // if(!roles.filter(cur => cur.priority != 0).length > 0) {
    //     return 'No roles are present'
    // }

    // Loading Role List
    loadRoleList(roles, modalEl);

    // Loading Default Role #First
    const firstRole = roles.filter(cur => cur.priority === 1)[0];
    let defRoleTag = '/everyone';
    if(firstRole) {
        defRoleTag = firstRole.roleTag;
    }
    if(options.default) {
        defRoleTag = options.default
    }
    show_role_settings(defRoleTag, nsEndPoint);

    // Adding EventHandlers to all role list items 
    roleListClickHandler(modalEl, function(roleTag) {
        // Checking if roleTag is alread opened
        const openedRole = modalEl.querySelector('.roles_overview').dataset.roletag;
        if(openedRole === roleTag) {
            return false;
        }

        // Callback is recieving which one role to be loaded on big screen
        show_role_settings(roleTag, nsEndPoint);
    });


    /**
     * 
     * Creating Role
     */

    // Initializing Create Role Button with EventListeners
    initCreateRoleBtn();

    // Getting Input Text to post role name
    roleInputHandler(async function(value) {
        // Posting Role Name to Database
        const data = await postNewRole(value, nsEndPoint);
        console.log(data);
    });

}