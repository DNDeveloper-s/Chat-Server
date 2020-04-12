const { fetchSingleWorkSpaceSS } = require('../../../../../utilities');
const { loadRoleList, roleListClickHandler, show_role_settings } = require('./Client/roleUI');

module.exports.roles = (modalEl = Element) => {
    // Current nsEndPoint
    const nsEndPoint = modalEl.dataset.ns;
    
    // Fetching Roles for the Session Storage
    const curNsData = fetchSingleWorkSpaceSS(nsEndPoint);
    const roles = curNsData.roles.custom;

    // Loading Role List
    loadRoleList(roles, modalEl);

    // Loading Default Role #First
    const defRoleTag = roles.filter(cur => cur.priority === 1)[0].roleTag;
    show_role_settings(defRoleTag, nsEndPoint);

    // Adding EventHandlers to all role list items 
    roleListClickHandler(modalEl, function(roleTag) {
        // Callback is recieving which one role to be loaded on big screen
        show_role_settings(roleTag, nsEndPoint);
    });

}