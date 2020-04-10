window.settingsChangeLabel = 'Setting Changed! Save it';

module.exports.settingHTML = (settingName = String, options = Object) => {
    try {
        const roles = `
            <div class="settings" data-setting="roles">
                <div class="roles_nav">
                    <div class="header">
                        Roles
                    </div>
                    <div class="notice">
                        <p><span class="note">Note</span> :- Drag and Drop items to set the priority among roles!</p>
                    </div>
                    <div class="roles_container">
                        <div class="cursor hide">
                            <svg height="512pt" viewBox="-149 0 512 512.10667" width="512pt" xmlns="http://www.w3.org/2000/svg"><path d="m170.71875 256.105469c0 35.347656-28.652344 64-64 64-35.34375 0-64-28.652344-64-64 0-35.34375 28.65625-64 64-64 35.347656 0 64 28.65625 64 64zm0 0"/><path d="m192.054688 362.773438h-170.667969c-11.753907 0-21.3320315 9.578124-21.3320315 21.332031 0 4.03125 1.0664065 7.832031 3.2851565 11.5625.382812.640625.808594 1.261719 1.277344 1.835937l86.570312 108.03125c4.269531 4.246094 9.773438 6.570313 15.53125 6.570313 5.761719 0 11.265625-2.324219 16.769531-7.914063l85.332031-106.667968c.46875-.574219.898438-1.214844 1.28125-1.832032 2.21875-3.753906 3.285157-7.554687 3.285157-11.585937 0-11.753907-9.578125-21.332031-21.332031-21.332031zm0 0"/><path d="m21.386719 149.441406h170.667969c11.753906 0 21.332031-9.578125 21.332031-21.335937 0-4.03125-1.066407-7.828125-3.285157-11.5625-.382812-.640625-.8125-1.257813-1.28125-1.832031l-86.570312-108.035157c-8.53125-8.445312-21.289062-9.8125-32.296875 1.367188l-85.335937 106.667969c-.46875.574218-.894532 1.214843-1.277344 1.832031-2.21875 3.734375-3.2851565 7.53125-3.2851565 11.5625 0 11.757812 9.5781245 21.335937 21.3320315 21.335937zm0 0"/></svg>
                        </div>
                        <div class="role_list">
                            <div class="role_list_item" data-count="1">
                                <div class="place_holder">Administrator</div>
                            </div>
                        </div>
                    </div>
                    <div class="actions">
                        <input type="text" placeholder="Type and Hit Enter....">
                        <button class="btn">Add Role</button>
                    </div>
                </div>
                <div class="roles_overview">
                    
                </div>
            </div>
        `;

        const loadRoleDetails = `
            <div class="role_details">
                <div class="role_name" data-roleTag="${options.roleTag}">
                    <div class="head">Edit Role Name</div>
                    <div class="settingContainer" aria-label="${settingsChangeLabel}" ><input type="text" name="role_name_${options.roleTag}" placeholder="Enter role name!" value="${options.name}"></div>
                </div>
                <div class="role_color">
                    <div class="head">Edit Role Color</div>
                    <div class="settingContainer" aria-label="${settingsChangeLabel}"><div class="color_picker"></div></div>
                    <div class="notice">
                        <p><span class="note">Note</span> :- Click to choose the color for your role!
                        </p>
                    </div>
                </div>
            </div>
        `;

        // Returning the HTML regarding to the SettingName
        return eval(settingName);
    } catch (e) {
        return 'Nothing Found';
    }
}