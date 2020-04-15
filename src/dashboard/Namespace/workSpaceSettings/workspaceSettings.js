const { addResponseModal, updateWorkSpaceImage, loader, toggleSwitch, permissionDescription, initPickr } = require('../../../utilities');

const { fetchRoles } = require('./SettingsHandle/Roles/Server/fetchRoles');

const { postSaveSettings, resetSettingsChanges } = require('./settingsServer');

const { loadSettingHTML } = require('./SettingsHandle/settings')

// Local Settings Import
const { navItemHandler, reloadActiveSetting } = require('./settings_nav');

module.exports.workSpaceSettings = (data) => {

    navItemHandler();

    // Save Settings Handler
    const saveBtn = document.querySelector('.save_modal > button.green');
    saveBtn.addEventListener('click', async function() {
        const data = await postSaveSettings();
        console.log(data);

        if(data.acknowledgment.type === 'success') {
            sessionStorage.removeItem('settingsToBeSaved');

            saveModal.classList.remove('savePopup');
    
            reloadActiveSetting();
        }
    });

    // Reset Settings Handler
    const resetBtn = document.querySelector('.save_modal > button.red');
    resetBtn.addEventListener('click', function(e) {
        resetSettingsChanges();

        reloadActiveSetting();

        saveModal.classList.remove('savePopup');
    })

    // const htmlToAdd = `
    //     <div class="first-choice center-content alone">  
    //         <h5 class="bigger">Your Workspace</h5>
    //         <div class="modal_image">
    //             <input name="nsImage" type="file" class="input__file input__dp">
    //             <figure>
    //                 <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="30%" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"/></svg>
    //             </figure>
    //             <label for="image" class="dp__name"></label>
    //             <img src="${data.acknowledgment.workSpace.image}" alt="DNDeveloper">
    //         </div>
    //         <div class="input-control">
    //             <label for="">Edit workspace name</label>
    //             <input type="text" name="nsName" value="${data.acknowledgment.workSpace.title}" placeholder="Enter Workspace name...">
    //         </div>
    //         <div class="input-control">
    //             <label for="" class="small">Edit Your Workspace EndPoint</label>
    //             <input type="text" name="" value="${data.acknowledgment.workSpace.endPoint.slice(1)}" placeholder="Enter Workspace name...">
    //         </div>
    //         <div class="input-control">
    //             <label class="finalize" for="">Advance settings</label>
    //             <button class="pointer purpleLinear toggle_roles" data-closemodal="false">Toggle Roles</button>
    //         </div>
    //         <div class="input-control">
    //             <label class="finalize" for="">Finalize changes</label>
    //             <button class="pointer blueLinear yes btn" data-closemodal="false">Save Changes
    //                 <div class="loader-container">
    //                     <svg width="40" height="40">
    //                         <circle class="loader" cx="20" cy="20" r="17"></circle>
    //                     </svg>
    //                 </div>
    //             </button>
    //         </div>
    //     </div>
    //     <div class="option-choice center-content">
    //         <div class="input-control">
    //             <label class="strict-action" for="">Strict Action</label>
    //             <button class="pointer redLinear another btn" data-ns="${data.acknowledgment.workSpace.endPoint}" >Delete Workspace
    //                 <div class="loader-container">
    //                     <svg width="40" height="40">
    //                         <circle class="loader" cx="20" cy="20" r="17"></circle>
    //                     </svg>
    //                 </div>
    //             </button>
    //         </div>
    //     </div>
    // `;

    // const modalEl = document.querySelector('.modal[data-id="workspace_settings"]');
    // modalEl.innerHTML = htmlToAdd;

    // loader();
    
    // const modalElButton = modalEl.querySelector('.first-choice button.yes');
    // modalElButton.addEventListener('click', async function(e) {
    //     modalElButton.classList.add('loading');

    //     const userId = document.getElementById('user-dp').dataset.userid;
    //     const nsEndPoint = document.querySelector('.nameSpaceDetails-Room_container').dataset.nsendpoint;
    //     const nsName = modalEl.querySelector('[name="nsName"]').value;
    //     const nsImage = modalEl.querySelector('[name="nsImage"]').files[0];
    //     const data = await updateWorkSpaceImage({
    //         userId: userId,
    //         nsEndPoint: nsEndPoint,
    //         nsName: nsName,
    //         nsImage: nsImage
    //     });

    //     console.log(data);

    //     modalElButton.classList.remove('loading');
    //     addResponseModal({
    //         selector: '.modal[data-id="workspace_settings"]',
    //         type: data.acknowledgment.type,
    //         message: data.acknowledgment.message
    //     });
    // });

    // const deleteWorkspaceButton = modalEl.querySelector('.option-choice button');
    // deleteWorkspaceButton.addEventListener('click', async function(e) {
    //     const nsEndPoint = this.dataset.ns;
    //     const userId = document.querySelector('#user-dp').dataset.userid;
    //     console.log(nsEndPoint);

    //     addModal('CONFIRMATION_MODAL', {
    //         message: `Are you sure?... You want to delete the workspace <span class="focusTitle" style="color: red">${data.acknowledgment.workSpace.title}</span>, This action cannot be undone and You will lose all your members!`,
    //         callback: async function(response) {
    //             if(!response) {
    //                 return 'Nothing to do';
    //             }

    //             const res = await fetch(`${window.location.origin}/dashboard/workspace/delete?nsEndPoint=${nsEndPoint}&userId=${userId}`, {
    //                 method: 'POST'
    //             });
    //             const data = await res.json();
    //             console.log(data);

    //             addResponseModal({
    //                 selector: '.modal[data-id="workspace_settings"]',
    //                 type: data.acknowledgment.type,
    //                 message: data.acknowledgment.message
    //             });
                
    //         },
    //     });

    //     // deleteWorkspaceButton.classList.add('loading');

    //     // const res = await fetch(`${window.location.origin}/dashboard/workspace/delete?nsEndPoint=${nsEndPoint}&userId=${userId}`, {
    //     //     method: 'POST'
    //     // });
    //     // const data = await res.json();
    //     // console.log(data);

    //     // addResponseModal({
    //     //     selector: '.modal[data-id="workspace_settings"]',
    //     //     type: data.acknowledgment.type,
    //     //     message: data.acknowledgment.message
    //     // });

    //     // const data = response;
    // });

    // try {
    //     const toggleRoleBtn = modalEl.querySelector('.toggle_roles');
    //     toggleRoleBtn.addEventListener('click', async function(e) {
    //         const htmlToAdd = `
    //             <div class="attached-modal roles" data-ns="${data.acknowledgment.workSpace.endPoint}">
    //                 <div class="modal_wrapper">
    //                     <h4>Roles</h4>
    //                     <div class="simple-settings">
    //                         <div class="roles-head">
    //                             <div class="roles_mechanism">
    //                                 <div class="roles_container">
    //                                     <div class="loader-container">
    //                                         <svg width="40" height="40">
    //                                             <circle class="loader" cx="20" cy="20" r="17"></circle>
    //                                         </svg>
    //                                     </div>
    //                                 </div>
    //                                 <div class="back-drop"></div>
    //                                 <div class="add_roles">
    //                                     <input class="role_input" type="text" placeholder="Type and Hit Enter...">
    //                                     <div class="loader-container">
    //                                         <svg width="40" height="40">
    //                                             <circle class="loader" cx="20" cy="20" r="17"></circle>
    //                                         </svg>
    //                                     </div>
    //                                     <svg class="zoom_svg" xmlns="http://www.w3.org/2000/svg" width="36.9" height="36.975" viewBox="0 0 36.9 36.975" id="tick">
    //                                         <g transform="translate(-0.05 0.025)">
    //                                             <path id="Path_1" class="circ path" data-name="Path 1" d="M30.5,6.5h0a17.02,17.02,0,0,1,0,24h0a17.02,17.02,0,0,1-24,0h0a17.02,17.02,0,0,1,0-24h0A16.841,16.841,0,0,1,30.5,6.5Z" fill="none" stroke="#ff5e4c" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3"/>
    //                                             <g id="middle">
    //                                                 <path id="Path_2" class="tick path" data-name="Path 2" d="M11.6,20l7.423-3.07L26.4,13.8" transform="translate(-4.467 9.107) rotate(-19)" fill="none" stroke="#ff5e4c" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3"/>
    //                                                 <path id="Path_3" class="tick path" data-name="Path 3" d="M11.6,20l7.423-3.07L26.4,13.8" transform="matrix(0.391, 0.921, -0.921, 0.391, 27.133, -5.193)" fill="none" stroke="#ff5e4c" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3"/>
    //                                             </g>
    //                                         </g>
    //                                     </svg>
    //                                     <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>
    //                                     <i class="material-icons add_btn">add_box</i>
    //                                 </div>
    //                             </div>
    //                         </div>

    //                         <div class="role_name_heading">
    //                             <h3 class="show_role_name"></h3>
    //                         </div>

    //                         <div class="members-list">
    //                             <div class="clients">
    //                                 <div class="loader-container">
    //                                     <svg width="40" height="40">
    //                                         <circle class="loader" cx="20" cy="20" r="17"></circle>
    //                                     </svg>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                         <div class="search-members">
    //                             <div class="member-search-box">
    //                                 <input type="text" placeholder="Search members to add...">
    //                             </div>
    //                             <div class="search_member_container"></div>
    //                         </div>
    //                     </div>
    //                     <button class="btn blendedLinear pointer switchToAdvanced">Advanced Settings
    //                         <i class="material-icons drop-down-icon">arrow_drop_down</i>
    //                     </button>
    //                     <div class="advanced-settings">
    //                         <div class="l-wrapper">
    //                             <div class="c-list__item">
    //                                 <h2>Permissions</h2>
    //                             </div>
    //                             <ul class="c-list">
    //                             </ul>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         `;

    //         if(!modalEl.querySelector('.attached-modal')) {
    //             modalEl.insertAdjacentHTML('beforeend', htmlToAdd);
    //             // Init Loader
    //             loader();
    //             // Current nsEndPoint
    //             const nsEndPoint = data.acknowledgment.workSpace.endPoint;
    //             // Fetching roles
    //             const roleData = await fetchRoles(nsEndPoint);
    //             // Loading roles
    //             loadRoles(roleData.acknowledgment.rolesDetails, nsEndPoint);
    //             show_role(roleData.acknowledgment.rolesDetails[0], nsEndPoint);

    //             const add_role_btn = modalEl.querySelector('.add_roles > .add_btn');
    //             const role_input = modalEl.querySelector('.role_input');
    //             if(!add_role_btn.dataset.clickevent || !add_role_btn.dataset.clickevent === 'true') {
    //                 add_role_btn.addEventListener('click', function(e) {
    //                     this.dataset.clickevent = 'true';
    //                     this.closest('.roles_mechanism').classList.add('adding_role');
    //                     this.closest('.add_roles').classList.add('active');
                        
    //                     setTimeout(() => {
    //                         role_input.focus();
    //                     }, 100);

    //                     this.closest('.roles_mechanism').querySelector('.back-drop').addEventListener('click', function(e) {
    //                         remove_add_btn();
    //                     })

    //                     if(!role_input.dataset.keydownevent || !role_input.dataset.keydownevent == 'true') {
    //                         role_input.addEventListener('keydown', async function(e) {
    //                             this.dataset.keydownevent = 'true';
    //                             if(e.key === 'Enter') {
    //                                 const value = this.value;
                                    
    //                                 if(value.length > 1) {
    //                                     add_role_btn.closest('.add_roles').classList.add('loading');
    //                                     const data = await postRole({
    //                                         endPoint: nsEndPoint,
    //                                         name: value
    //                                     });
    //                                     add_role_btn.closest('.add_roles').classList.remove('loading');
    //                                     if(data.acknowledgment.type === 'success') {
    //                                         add_role_btn.closest('.add_roles').classList.add('success');
    //                                         setTimeout(() => {
    //                                             remove_add_btn();
    //                                         }, 1500);
    //                                         addRole(data.acknowledgment.roleDetails, nsEndPoint);
    //                                     } else {
    //                                         add_role_btn.closest('.add_roles').classList.add('failed');
    //                                         setTimeout(() => {
    //                                             remove_add_btn();
    //                                         }, 1500);
    //                                         console.log(data);
    //                                     }
    //                                     console.log(data);
    //                                 }
    //                             }
    //                         })
    //                     }
    //                 });
    //             }

    //             // const del_role_btns = modalEl.querySelectorAll('.role_tag > .del_btn');
    //             // del_role_btns.forEach(del_role_btn => {
    //             //     if(!del_role_btn.dataset.clickevent || !del_role_btn.dataset.clickevent === 'true') {
    //             //         del_role_btn.addEventListener('click', function(e) {
    //             //             this.dataset.clickevent = 'true';
    //             //             const roleName = del_role_btn.parentElement.querySelector('.role_name').innerText;
    //             //             addModal('CONFIRMATION_MODAL', {
    //             //                 message: `Are you sure?... You want to delete the tag <span class="focusTitle" style="color: red">${roleName}</span>!`,
    //             //                 callback: async function(res) {
    //             //                     if(!res) {
    //             //                         return 'Nothing to do';
    //             //                     }
    //             //                     const data = await deleteRoleTagAPI(del_role_btn.parentElement.dataset.roletag, nsEndPoint);

    //             //                     if(data.acknowledgment.type === 'success') {
    //             //                         deleteRoleTag(data.acknowledgment.roleDetails);
    //             //                     } else {
    //             //                         console.log(data);
    //             //                     }
    //             //                 },
    //             //             });
    //             //         });
    //             //     }
    //             // })

    //             memberInput(nsEndPoint);

    //             // Switching to Advanced
    //             const attachedModal = modalEl.querySelector('.attached-modal');
    //             const switchToAdvanced = modalEl.querySelector('button.switchToAdvanced');
    //             switchToAdvanced.addEventListener('click', function(e) {
    //                 switchToAdvanced.innerHTML = `General Settings<i class="material-icons drop-down-icon">arrow_drop_up</i>`;
    //                 if(attachedModal.classList.contains('switchToAdvanced')) {
    //                     switchToAdvanced.innerHTML = `Advanced Settings<i class="material-icons drop-down-icon">arrow_drop_down</i>`;
    //                 }
    //                 attachedModal.classList.toggle('switchToAdvanced');
    //             })
    //         } else {
    //             modalEl.querySelector('.attached-modal').remove();
    //         }

    //     });

    //     async function deleteRoleTagAPI(roleTag, nsEndPoint) {
    //         const res = await fetch(`${window.location.origin}/workspace/deleteroles?nsEndPoint=${nsEndPoint}`,{
    //             method: 'POST',
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 roleTag: roleTag
    //             })
    //         })

    //         return res.json();
    //     }

    //     function deleteRoleTag(roleTag) {
    //         const role_tag = document.querySelector(`.roles_container > .role_tag[data-roletag="${roleTag}"]`);

    //         role_tag.remove();
    //     }

    //     function addRoleMember(member, nsEndPoint, roleTag) {
    //         const roles_members_container = modalEl.querySelector('.members-list > .clients');
    //         const htmlToAdd = `
    //             <div class="client" data-userid="${member._id}">
    //                 <div class="image">
    //                     <img src="${member.image}" class="message-user_dp" alt="${member.name}">
    //                     <span class="status" data-status="${member.status}"></span>
    //                 </div>
    //                 <div class="name">
    //                     <p>${member.name}</p>
    //                 </div>
    //                 <div class="action_btn delete">
    //                     <div class="loader-container">
    //                         <svg width="40" height="40">
    //                             <circle class="loader" cx="20" cy="20" r="17"></circle>
    //                         </svg>
    //                     </div>
    //                     <i class="material-icons">add_circle</i>
    //                     <i class="material-icons removed">assignment_turned_in</i>
    //                 </div>
    //             </div>
    //         `;
    //         if(!roles_members_container.querySelector('.client')) {
    //             roles_members_container.innerHTML = '';
    //         }
    //         roles_members_container.insertAdjacentHTML('beforeend', htmlToAdd);
    //         loader();
    //         const deleteBtn = roles_members_container.lastElementChild.querySelector('.action_btn.delete');
    //         if(!deleteBtn.dataset.clickevent || !deleteBtn.dataset.clickevent == 'true') {
    //             deleteBtn.addEventListener('click', async function(e) {
    //                 this.classList.add('loading');
    //                 const userId = this.closest('.client').dataset.userid;
    //                 const data = await removeUserToRole(userId, roleTag, nsEndPoint);
    //                 this.classList.remove('loading');
    //                 this.classList.add('loaded');
    //                 if(data.acknowledgment.type === 'success') {
    //                     setTimeout(() => {
    //                         deleteBtn.closest('.client').classList.add('remove');
    //                     }, 500);
    //                     setTimeout(() => {
    //                         deleteBtn.closest('.client').remove();

    //                         if(roles_members_container.childElementCount === 0) {
    //                             const htmlToAdd = `
    //                                 <p style="color: darkgrey; margin: 20px; text-align: center; font-size: 17px;">No member for this role!</p>
    //                                 <p style="color: darkgrey; margin: 5px 0 10px; text-align: center; font-size: 13px;">Please add using box below!</p>
    //                             `;
    //                             roles_members_container.insertAdjacentHTML('beforeend', htmlToAdd);
    //                         }
    //                     }, 1000)
    //                     console.log(data);
    //                 } else {
    //                     console.log(data);
    //                 }
    //             })
    //         }
    //     }

    //     async function postRole({endPoint, name}) {
    //         const res = await fetch(`${window.location.origin}/workspace/postroles?nsEndPoint=${nsEndPoint}`,{
    //             method: 'POST',
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 endPoint: endPoint,
    //                 name: name
    //             })
    //         })

    //         return res.json();
    //     }

    //     function loadRoles(roles, nsEndPoint) {
    //         const rolesContainer = modalEl.querySelector('.roles_container');
    //         if(!roles.length > 0) {
    //             rolesContainer.innerHTML = `<p style="margin: 20px; color: darkgrey; pointer-events: none; user-select: none; font-size: 16px;">No roles added! Add using button below.</p>`
    //         } else
    //         if(rolesContainer) {
    //             rolesContainer.innerHTML = '';
    //             roles.forEach(role => {
    //                 addRole(role, nsEndPoint);
    //             });
    //         }
    //     }

    //     function remove_add_btn() {
    //         const add_role_btn = modalEl.querySelector('.add_roles > .add_btn');

    //         add_role_btn.closest('.roles_mechanism').classList.remove('adding_role');
    //         add_role_btn.closest('.add_roles').classList.remove('active');
    //         add_role_btn.closest('.add_roles').classList.remove('success');
    //         add_role_btn.closest('.add_roles').classList.remove('failed');
    //     }

    //     function memberInput(nsEndPoint) {
    //         const searchMembersContainer = modalEl.querySelector('.search_member_container');
    //         const searchMembersBox = modalEl.querySelector('.search-members');
    //         const searchMembersInput = modalEl.querySelector('.search-members > .member-search-box > input');
    //         console.log(searchMembersInput);

    //         if(!searchMembersContainer.dataset.outsideclickevent || !searchMembersContainer.dataset.outsideclickevent === 'true') {
    //             window.addEventListener('click', removeMemberList);
    //         }

    //         function removeMemberList(e) {
    //             searchMembersContainer.dataset.outsideclickevent = 'true';
    //             if(!e.path.includes(searchMembersBox)) {
    //                 searchMembersContainer.classList.remove('active');
    //             }
    //         }

    //         searchMembersInput.addEventListener('focusin', function(e) {
    //             const jsonData = sessionStorage.getItem('all_workspaces');
    //             const workspaces = JSON.parse(jsonData);

    //             const inputValue = this.value;
    //             console.log(inputValue);
    //             const arr = getMatchedString(inputValue, workspaces);
    //             showMembers(arr, workspaces, nsEndPoint);
    //         })

    //         searchMembersInput.addEventListener('keyup', function(e) {
    //             const jsonData = sessionStorage.getItem('all_workspaces');
    //             const workspaces = JSON.parse(jsonData);

    //             const inputValue = this.value;
    //             console.log(inputValue);
    //             const arr = getMatchedString(inputValue, workspaces);
    //             showMembers(arr, workspaces, nsEndPoint);
    //         })
    //     }

    //     function showMembers(members, workspaces, nsEndPoint) {
    //         const searchMembersContainer = modalEl.querySelector('.search_member_container');
    //         searchMembersContainer.innerHTML = '';  
    //         if(members.length > 0) {
    //             searchMembersContainer.classList.add('active');
    //         } else {
    //             searchMembersContainer.classList.remove('active');
    //         }
    //         const roleTag = searchMembersContainer.dataset.roletag;
    //         members.forEach(member => {
    //             const added = isItAddedtoTheRole(member._id, searchMembersContainer.dataset.roletag, workspaces, nsEndPoint);
    //             if(!added) {
    //                 const htmlToAdd = `
    //                     <div class="client" data-userid="${member._id}">
    //                         <div class="image">
    //                             <img src="${member.image}" class="message-user_dp" alt="${member.name}">
    //                             <span class="status" data-status="${member.status}"></span>
    //                         </div>
    //                         <div class="name">
    //                             <p>${member.name}</p>
    //                         </div>
    //                         <div class="action_btn">
    //                             <div class="loader-container">
    //                                 <svg width="40" height="40">
    //                                     <circle class="loader" cx="20" cy="20" r="17"></circle>
    //                                 </svg>
    //                             </div>
    //                             <i class="material-icons add_member_to_role">add_box</i>
    //                             <i class="material-icons added">assignment_turned_in</i>
    //                         </div>
    //                     </div>
    //                 `;
    //                 searchMembersContainer.insertAdjacentHTML('beforeend', htmlToAdd);
    //                 loader();

    //                 const add_btn = searchMembersContainer.lastElementChild.querySelector('.add_member_to_role');
    //                 add_btn.addEventListener('click', async function(e) {
    //                     this.closest('.action_btn').classList.add('loading');
    //                     const data = await postUserToRole(member._id, roleTag, nsEndPoint);
    //                     if(data.acknowledgment.type === 'success') {
    //                         this.closest('.action_btn').classList.remove('loading');
    //                         this.closest('.action_btn').classList.add('loaded');
    //                         setTimeout(() => {
    //                             this.closest('.client').classList.add('remove');
    //                         }, 500);
    //                         setTimeout(() => {
    //                             this.closest('.client').remove();
    //                             addRoleMember(member, nsEndPoint, roleTag);
    //                         }, 900);
    //                     } else {
    //                         console.log(data);
    //                     }
    //                 })
    //             }
    //         })
    //     }

    //     function getMatchedString(string, workspaces) {
    //         return workspaces[nsEndPoint].roles.members.filter(cur => {
    //             const str = cur.name.toLowerCase();
    //             return str.search(string.toLowerCase()) !== -1
    //         });
    //     }

    //     // Checking if the user is already added to the role
    //     function isItAddedtoTheRole(userId, roleTag, workspaces, nsEndPoint) {
    //         const roleObj = workspaces[nsEndPoint].roles.custom.filter(cur => cur.roleTag == roleTag);
    //         const user = roleObj[0].members.filter(cur => cur._id.toString() === userId.toString());
    //         return user.length > 0;
    //     }

    //     async function postUserToRole(userId, roleTag, nsEndPoint) {
    //         const res = await fetch(`${window.location.origin}/workspace/roles/user?action=add&nsEndPoint=${nsEndPoint}`,{
    //             method: 'POST',
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 userId: userId,
    //                 roleTag: roleTag
    //             })
    //         })

    //         return res.json();
    //     }   

    //     async function removeUserToRole(userId, roleTag, nsEndPoint) {
    //         const res = await fetch(`${window.location.origin}/workspace/roles/user?action=remove&nsEndPoint=${nsEndPoint}`,{
    //             method: 'POST',
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({
    //                 userId: userId,
    //                 roleTag: roleTag
    //             })
    //         })

    //         return res.json();
    //     }   

    // } catch(e) {
    //     console.log(e.message);
    // }
}