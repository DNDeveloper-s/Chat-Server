// import { submitRegForm } from './auth';
const { regHandle, loginHandle } = require('./auth');
const { Moveit } = require('./moveIt');
const Pickr = require('@simonwep/pickr/dist/pickr.es5.min');

// Background animation
const bgAnim = () => {
    const imageItemsEl = document.querySelectorAll('.image-item');
    imageItemsEl.forEach((imageItem, ind) => {
        setTimeout(() => {
            imageItem.lastElementChild.style.animation = `comeIn 2s ease-in-out forwards`;
            setTimeout(() => {
                imageItem.lastElementChild.style.animation = `comeOut 2s ease-in-out forwards`;
            }, 4000);
            if(ind === imageItemsEl.length - 1) {
                bgAnim();
            }
        }, ind * 4000);
    });
};
    

// Toggle Login | Register Form
const toggleAuthFormUI = () => {

    // Container
    const authModalContainer = document.querySelector('.auth-modal');
    
    // Btns
    const authToggleBtn = document.querySelectorAll('.authBtnShow');
    const regBtn = document.querySelector('.reg.authBtnShow');
    const loginBtn = document.querySelector('.login.authBtnShow');

    const regFormHtml = `<form id="regForm" class="anim" action="" data-removeanim="false"> <h3>Register</h3> <div class="input-control"> <label for="fullName">Full Name</label> <input type="text" name="fullName"> </div><div class="input-control"> <label for="email">Email</label> <input type="email" name="email"> </div><div class="input-control"> <label for="password">Password</label> <input type="password" name="password"> </div><div class="input-control"> <label for="conPassword">Confirm Password</label> <input type="password" name="conPassword"> </div><button class="pointer" type="submit">Register</button> </form>`;
    const loginFormHtml = `<form id="loginForm" class="anim" data-removeanim="false" action=""> <h3>Login</h3> <div class="input-control"> <label for="email">Email</label> <input type="email" name="email"> </div><div class="input-control"> <label for="password">Password</label> <input type="password" name="password"> </div><button class="pointer mainAuthBtn btn" type="submit">Login <div class="loader-container"> <svg width="40" height="40"> <circle class="loader" cx="20" cy="20" r="17"></circle> </svg> </div></button> <div class="reset-password"> <p>Don't remember your password? You can request to reset your password <a href="">here</a>!</p></div></form>`;

                
    const form = document.getElementById(`loginForm`);
                
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        loginHandle();
    });


    authToggleBtn.forEach(btn => {
        btn.addEventListener('click', function(e) {

            if(!this.classList.contains('active')) {
                authModalContainer.innerHTML = eval(`${this.dataset.btn}FormHtml`);
                
                const form = document.getElementById(`${this.dataset.btn}Form`);
                console.log(form);
                
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const cb = eval(`${this.dataset.btn}Handle`);
                    cb();
                    console.log(form);
                });

                this.parentElement.querySelectorAll('li').forEach(cur => {
                    cur.classList.remove('active');                    
                })
                this.classList.add('active');
            }
            
        });
    })
}

const submitRegHandler = () => {
    const regForm = document.getElementById('regForm');
    regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log(regForm);
    });
}

const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    console.log(str, 'Copied');
    
};

const loader = () => {
    const loaderEl = document.querySelectorAll('.loader');

    loaderEl.forEach(cur => {
        const loadingAnimation = new Moveit(cur, {
            start: '0%',
            end: '1%'
        });

        function animateLoader() {
            loadingAnimation.set({
                start: '1%',
                end: '70%',
                duration: 0.5,
                callback: function() {
                    loadingAnimation.set({
                        start: '100%',
                        end: '101%',
                        duration: 0.8,
                        follow: true,
                        callback: function () {
                            animateLoader();
                        }
                    })
                }
            })
        }
        animateLoader();
    })
};

function remove_sidebar() {
    const rootEl = document.getElementById('root');
    const backDropEl = rootEl.querySelector('.back-drop.sidebar');
    if(backDropEl) {
        const nav_bar = rootEl.querySelector('.nav_bar');
        nav_bar.classList.remove('open');
        backDropEl.remove();
    }
};

async function fetchRooms() {
    const allNamespaces = document.querySelectorAll('.nameSpaceContainer > .name_space');
    const allEndPoints = [];
    allNamespaces.forEach(cur => {
        allEndPoints.push(cur.dataset.ns);
    });
    for(const nsEndPoint of allEndPoints) {
    
        const res = await fetch(`${window.location.origin}/dashboard/fetch?rooms=true&nsEndPoint=${nsEndPoint}`, {
            method: "GET"
        });

        const data = await res.json();
        
        console.log(data);
    
        sessionStorage.setItem(`nsRooms-${nsEndPoint}`, JSON.stringify(data.acknowledgment.rooms));
    }
}

async function fetchRoomOfSingleNameSpace(nsEndPoint) {
    // const allNamespaces = document.querySelectorAll('.nameSpaceContainer > .name_space');
    // const allEndPoints = [];
    // allNamespaces.forEach(cur => {
    //     allEndPoints.push(cur.dataset.ns);
    // });
    // for(const nsEndPoint of allEndPoints) {
    
    const res = await fetch(`${window.location.origin}/dashboard/fetch?rooms=true&nsEndPoint=${nsEndPoint}`, {
        method: "GET"
    });
    const data = await res.json();
    console.log(data);
    sessionStorage.setItem(`nsRooms-${nsEndPoint}`, JSON.stringify(data.acknowledgment.rooms));
    // }
}

async function fetchMentions() {
    
    const res = await fetch(`${window.location.origin}/dashboard/fetch?mentions=true`, {
        method: "GET"
    });

    const data = await res.json();

    console.log(data);
    if(data.acknowledgment.type === 'success') {
        sessionStorage.setItem('mentions', JSON.stringify(data.acknowledgment.mentions));
    }
}

async function fetchWorkSpaces() {
    const allNamespaces = document.querySelectorAll('.nameSpaceContainer > .name_space');
    const allEndPoints = [];
    console.log(allNamespaces);
    allNamespaces.forEach(cur => {
        allEndPoints.push(cur.dataset.ns);
    });
    let workspaces = [];
    for(const nsEndPoint of allEndPoints) {
        console.log(nsEndPoint);
        const res = await fetch(`${window.location.origin}/dashboard/fetch?workspaces=true&nsEndPoint=${nsEndPoint}`, {
            method: "GET"
        })
        const data = await res.json();
        console.log(data);
        workspaces.push(data);
    }

    // Converting array to object
    function toObject(arr) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i)
            if (arr[i] !== undefined) {
                // const name = arr[i].name
                rv[arr[i].endPoint] = arr[i];
            }
        return rv;
    }

    const obj = toObject(workspaces);
    // Storing to Session Storage
    sessionStorage.setItem(`all_workspaces`, JSON.stringify(obj));
}


function focusMessageById(id) {
    const container = document.querySelector('.message-display__container > .messages');
    const messageId = container.querySelector(`[data-messageid="${id}"]`);
    console.log(messageId);
    messageId.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
    // messageId.classList.add('boom');
    messageId.style.animation = `boom .5s ease-in-out 5`;
    // messageId.closest('.message').classList.add('focus');
    messageId.classList.add('focus');
    setTimeout(() => {
        messageId.style.animation = `none`;
    }, 2800);
}

async function sendImageData(el, userId) {

    const formData = new FormData(el);

    const res = await fetch(`${window.location.origin}/auth/update_profile?userId=${userId}`, {
      method: 'POST',
      body: formData
    });
    return res.json();
}

async function updateWorkSpaceImage(options) {
    const formData = new FormData();

    formData.append('name', options.nsName);
    formData.append('image', options.nsImage);

    const res = await fetch(`${window.location.origin}/dashboard/update_workspace?nsEndPoint=${options.nsEndPoint}&userId=${options.userId}`, {
        method: 'POST',
        body: formData
    });
    return res.json();
}

function tagImplementation(inputBox_SELECTOR) {
    
    // Input Tag Handler
    const inputBox = document.querySelector(inputBox_SELECTOR);
    const nsContainer = document.querySelector('.nameSpaceDetails-Room_container');
    const roomDetailsContainer = document.querySelector('.room-details');
    

    // inputBox.innerHTML = "";

    // Fetching workspace from sessionStorage
    const jsonData = sessionStorage.getItem('all_workspaces');
    let workspaces = JSON.parse(jsonData);

    inputBox.addEventListener('focus', e => {
        if(inputBox.childElementCount === 0) {
            inputBox.innerHTML = '<span class="text"></span>';
        }
        const jsonData = sessionStorage.getItem('all_workspaces');
        workspaces = JSON.parse(jsonData);
    })
    inputBox.addEventListener('keypress', function(e){ return e.which != 13 });
    inputBox.addEventListener('keyup', function(e) {
        if(inputBox.childElementCount === 0) {
            inputBox.innerHTML = '<span class="text"></span>';
        }

        const nsEndPoint = nsContainer.dataset.nsendpoint;
        if((e.keyCode >= 64 && e.keyCode <= 91) || e.key === '@' || e.key === "Backspace") {
            const textEl = inputBox.querySelectorAll('.text');
            const arr = textEl[textEl.length - 1].textContent.split(' ');
            const string = arr[arr.length - 1].trim();
            if(string.startsWith('@')) {
                const str = string.slice('1');
                showTags(nsEndPoint, str.toLowerCase());
            } else {
                // Remove Tag List
                remove_tag_list();
            }
        } else if(e.key === "Enter") {
            e.preventDefault();
            const focusedTag = document.querySelector('.focus-tag');
            if(focusedTag) {
                insertTag(focusedTag);
            } else {
                const roomId = roomDetailsContainer.dataset.roomid;
                const { messageToRoomHandler } = require('./dashboard/User/message');
                messageToRoomHandler(roomId, nsEndPoint);
            }
        } else if(e.key === "Tab") {
            e.preventDefault();
            const focusedTag = document.querySelector('.focus-tag');
            if(focusedTag) {
                insertTag(focusedTag);
            }
        } else if(e.key === " ") {
            // Remove Tag List
            remove_tag_list();
        }
    })
    // inputBox.addEventListener('keydown', function(e) {
    // });

    function remove_tag_list() {
        // Remove Tag List
        const inputBox = document.querySelector(inputBox_SELECTOR);
        const tagList = inputBox.parentElement.querySelector('.tag-list');
        tagList.classList.remove('open');
        tagList.querySelector('.tag-members').innerHTML = '';
        tagList.querySelector('.tag-roles').innerHTML = '';
    }

    function showTags(nsEndPoint, inputValue) {
        const jsonWorkSpace = sessionStorage.getItem(`all_workspaces`);
        const workspace = JSON.parse(jsonWorkSpace);
        // console.log(workspace[nsEndPoint].roles.members);
        const matchedNames = workspace[nsEndPoint].roles.members.filter(cur => {
            const str = cur.name.toLowerCase();
            return str.search(inputValue) !== -1
        });
    
        const matchedRoles = getRoles(workspaces, nsEndPoint, inputValue);

        // Remove Tag List
        const inputBox = document.querySelector(inputBox_SELECTOR);
        const tagList = inputBox.parentElement.querySelector('.tag-list');
        remove_tag_list();
    
        if((matchedNames.length > 0 || matchedRoles.length > 0) && !tagList.classList.contains('open')) {
            tagList.classList.add('open');
        }
    
        const userId = document.querySelector('.user_dp').dataset.userid;
        const excludedNames = matchedNames.filter(cur => cur._id.toString() !== userId);
    
        if(excludedNames.length > 0) {
            tagList.querySelector('.tag-members').insertAdjacentHTML('afterbegin', `<h5 class="group-heading">Members</h5>`);
            
            tagList.scrollTo(0, 0);
        }

        // Adding Tag Member List
        excludedNames.forEach((cur, ind) => {
            const tagHTML = `
                <div class="tag" id="tag-${ind}" data-num="${ind+1}" tabindex="0">
                    <div class="tag-body userLink" data-userid="${cur._id}">
                        <div class="tag-img">
                            <img src="${cur.image}" class="message-user_dp" alt="">
                        </div>
                        <div class="tag-name">${cur.name}</div>
                    </div>
                    <div class="tag-hash">${cur.uniqueTag}</div>
                </div>
            `;
            tagList.querySelector('.tag-members').insertAdjacentHTML('beforeend', tagHTML);
        });
    
        if(matchedRoles.length > 0) {
            tagList.querySelector('.tag-roles').insertAdjacentHTML('afterbegin', `<h5 class="group-heading role">Roles</h5>`);
            
            tagList.scrollTo(0, 0);
        }

        // Adding Tag Roles List
        matchedRoles.forEach((cur, ind) => {
            if(cur.color === '#121218') {
                cur.color = '#f1f1f1';
            }
            const tagHTML = `
                <div class="tag role" id="tag-${excludedNames.length + ind}" data-num="${excludedNames.length + ind+1}" tabindex="0">
                    <div class="tag-body role">
                        <span style="color: ${cur.color}">@</span>
                        <div class="tag-name role" style="color: ${cur.color}">${cur.name}</div>
                    </div>
                    <div class="tag-hash">${cur.roleTag}</div>
                </div>
            `;
            tagList.querySelector('.tag-roles').insertAdjacentHTML('beforeend', tagHTML);
        });

        // tagList.querySelectorAll('.tag')[0].classList.add('focus-tag');
        // tagList.querySelectorAll('.tag')[0].focus();
        // tagList.querySelectorAll('.tag')[0].addEventListener('keydown', function(e) {
        //     if(e.key === 'Tab') {
        //         const focusedTag = document.querySelector('.focus-tag');
        //         if(focusedTag) {
        //             insertTag(focusedTag);
        //         }
        //     }
        // })

        // Click Event on Tags
        const tagEl = tagList.querySelectorAll('.tag');
    
        tagEl.forEach(cur => {
            cur.addEventListener('click', function(e) {
                e.preventDefault();
                insertTag(this);
            });
        })
    
        if(document.getElementById('tag-0')) {
            document.getElementById('tag-0').classList.add('focus-tag');
            add_keys(matchedNames.length);
        }
    
    }
    
    function add_keys(length) {
        const tagList = document.querySelector('.tag-list');
        if(tagList.childElementCount > 1) {
            window.removeEventListener('keydown', arrows_handler);
            window.addEventListener('keydown', arrows_handler);
        }
    }
    
    function arrows_handler(e, length) {
        let cur;
        switch (e.key) {
            case 'ArrowUp':
                cur = document.querySelector('.focus-tag').dataset.num;
                addUp(+cur);
                break;
            case 'ArrowDown':
                cur = document.querySelector('.focus-tag').dataset.num;
                addDown(+cur);
                break;
            default:
        }
    
        function addDown(num) {
            const tagElToRemove = document.querySelector(`.tag[data-num="${num}"]`);
            const tagEl = document.querySelector(`.tag[data-num="${num+1}"]`);
            if(tagEl && tagElToRemove) {
                tagElToRemove.classList.remove('focus-tag');
                tagEl.classList.add('focus-tag');
                tagEl.addEventListener('keydown', function(e) {
                    if(e.key === 'Tab') {
                        e.preventDefault();
                        const focusedTag = document.querySelector('.focus-tag');
                        if(focusedTag) {
                            insertTag(focusedTag);
                        }
                    } else if(e.key === 'Escape') {
                        remove_tag_list();
                        inputBox.focus();
                    }
                })
                tagEl.focus();
            }
        }
    
        function addUp(num, length) {
            const tagElToRemove = document.querySelector(`.tag[data-num="${num}"]`);
            const tagEl = document.querySelector(`.tag[data-num="${num-1}"]`);
            if(tagEl && tagElToRemove) {
                tagElToRemove.classList.remove('focus-tag');
                tagEl.classList.add('focus-tag');
                tagEl.addEventListener('keydown', function(e) {
                    if(e.key === 'Tab') {
                        e.preventDefault();
                        const focusedTag = document.querySelector('.focus-tag');
                        if(focusedTag) {
                            insertTag(focusedTag);
                        }
                    } else if(e.key === 'Escape') {
                        remove_tag_list();
                        inputBox.focus();
                    }
                })
                tagEl.focus();
            }
        }
          
    }

    // Tab Event for Tags
    inputBox.addEventListener('keydown', tabEvent);

    function tabEvent(e) {
        if(e.key === 'ArrowUp' || e.key == 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
        } else if(e.key === 'Escape') {
            remove_tag_list();
        } else if(e.key === 'Tab') {
            e.preventDefault();
            // const focusedTag = document.querySelector('.focus-tag');
            // if(focusedTag) {
            //     insertTag(focusedTag);
            // }
        }
    }

    function insertTag(focusedTag) {
        
        const tag_name = focusedTag.querySelector('.tag-name').innerText;
                    
        const textEl = inputBox.querySelectorAll('.text');
        const arr = textEl[textEl.length - 1];
        const l = arr.textContent.split('@')[0];
        arr.innerHTML = l;

        const imageContainer = focusedTag.querySelector('.tag-img > img');

        let tagHtml;

        if(imageContainer) {
            const user_id = focusedTag.querySelector('.tag-body').dataset.userid;
            const user_image = imageContainer.getAttribute('src');

            tagHtml = `
                <span class="tag-details userLink" aria-label="${tag_name}" data-userid="${user_id}" contenteditable="false" ><img src="${user_image}" alt="${tag_name}">@ ${tag_name}</span><span class="text"></span
            `;
        } else {
            const color = focusedTag.querySelector('.tag-name').style.color;
            const role_tag = focusedTag.querySelector('.tag-hash').innerText;
            tagHtml = `
                <span class="tag-details role" data-role="${role_tag}" style="background: #313131db; color: ${color};" aria-label="${tag_name}" contenteditable="false" >@ ${tag_name}</span><span class="text"></span
            `;
        }

        inputBox.insertAdjacentHTML('beforeend', tagHtml);
        remove_tag_list();
        inputBox.focus();
        const sel = window.getSelection();
        sel.collapse(inputBox.lastChild, 0);
    }
}

function getRoles(workspaces, nsEndPoint, inputValue) {
    return workspaces[nsEndPoint].roles.custom.filter(cur => {
        const str = cur.name.toLowerCase();
        return str.search(inputValue.toLowerCase()) !== -1;
    });
}

function addResponseModal(options) {
    let svgType = `
        <svg class="zoom_svg" xmlns="http://www.w3.org/2000/svg" width="36.9" height="36.975" viewBox="0 0 36.9 36.975" id="tick">
            <g transform="translate(-0.05 0.025)">
                <path id="Path_1" class="circ path" data-name="Path 1" d="M30.5,6.5h0a17.02,17.02,0,0,1,0,24h0a17.02,17.02,0,0,1-24,0h0a17.02,17.02,0,0,1,0-24h0A16.841,16.841,0,0,1,30.5,6.5Z" fill="none" stroke="#ff5e4c" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3"/>
                <g id="middle">
                    <path id="Path_2" class="tick path" data-name="Path 2" d="M11.6,20l7.423-3.07L26.4,13.8" transform="translate(-4.467 9.107) rotate(-19)" fill="none" stroke="#ff5e4c" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3"/>
                    <path id="Path_3" class="tick path" data-name="Path 3" d="M11.6,20l7.423-3.07L26.4,13.8" transform="matrix(0.391, 0.921, -0.921, 0.391, 27.133, -5.193)" fill="none" stroke="#ff5e4c" stroke-linejoin="round" stroke-miterlimit="10" stroke-width="3"/>
                </g>
            </g>
        </svg>
    `;
    if(options.type === 'success') {
        svgType = `
            <svg version="1.1" id="tick" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                viewBox="0 0 37 37" style="enable-background:new 0 0 37 37;" xml:space="preserve">
                <path class="circ path" style="fill:none;stroke:#2a94a9;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:10;" d="
                    M30.5,6.5L30.5,6.5c6.6,6.6,6.6,17.4,0,24l0,0c-6.6,6.6-17.4,6.6-24,0l0,0c-6.6-6.6-6.6-17.4,0-24l0,0C13.1-0.2,23.9-0.2,30.5,6.5z"
                    />
                <polyline class="tick path" style="fill:none;stroke:#2a94a9;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:10;" points="
                    11.6,20 15.9,24.2 26.4,13.8 "/>
            </svg>
        `;
    }
    const responseHTML = `
        <div class="response_modal">
            <div class="response_svg">
                ${svgType}
            </div>
            <div class="response_message">
                <p>${options.message}</p>
            </div>
            <button type="button" class="pointer ${options.type === 'error' ? 'redLinear' : ''}">Confirm</button>
        </div>
    `;
    
    const modalEl = document.querySelector(options.selector);
    modalEl.insertAdjacentHTML('beforeend', responseHTML);

    const responseModal = modalEl.querySelector('.response_modal');
    setTimeout(() => {
        responseModal.classList.add('success');
    }, 200);

}

function toggleSwitch() {
    
    const toggles = document.querySelectorAll('.c-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            let toggleState = toggle.classList.contains('c-toggle--active');
            if(toggle.classList.contains('everything')) {
                if(!toggleState) {
                    toggles.forEach(toggle =>{
                        let toggleState = toggle.classList.contains('c-toggle--active');
                        if(!toggleState) {
                            toggleBtn(toggle, false);
                        }
                    });
                }
            } else {

                toggleBtn(toggle, toggleState);
    
                console.log(checkIfAllOn());
                if(checkIfAllOn()) {
                    toggleBtn(document.querySelector('.c-toggle.everything'), false);
                }
            }

            if(toggleState) {
                if(document.querySelector('.c-toggle.everything').classList.contains('c-toggle--active')) {
                    toggleBtn(document.querySelector('.c-toggle.everything'), true);
                }
            }
        });
    });

    function checkIfAllOn() {
        let all = true;
        const toggles = document.querySelectorAll('.c-toggle:not(.everything)');
        toggles.forEach(toggle => {
            let toggleState = toggle.classList.contains('c-toggle--active');
            if(!toggleState) {
                all = false;
            }
        });
        return all;
    }

    async function toggleBtn(toggle, toggleState) {

        const toggleLabel = toggle.querySelector('.c-toggle__label');
        const toggleHandle = toggle.querySelector('.c-toggle__handle');

        const labelTransition = () => {
        toggleLabel.style.opacity = 0;
            setTimeout(() => {
                toggleLabel.style.opacity = 1;
            }, 250);
        };

        const activeToggle = () => {
            toggle.classList.add('c-toggle--active');
            toggleLabel.innerHTML = 'Yes';
            labelTransition();
            if (toggle.parentNode.querySelector('.c-toggle__text')) {
                toggle.parentNode.querySelector('.c-toggle__text').classList.remove('u-text--secondary');
            }
        };

        const inactiveToggle = () => {
            toggle.classList.remove('c-toggle--active');
            toggleLabel.innerHTML = 'No';
            labelTransition();
            if (toggle.parentNode.querySelector('.c-toggle__text')) {
                toggle.parentNode.querySelector('.c-toggle__text').classList.add('u-text--secondary');
            }
        };

        toggleState ? inactiveToggle() : activeToggle();
    
        const res = await fetch(`${window.location.origin}/workspace/roles/permissions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                permission: toggle.closest('li').dataset.permission,
                value: !toggleState,
                roleTag: toggle.closest('.attached-modal').dataset.activeroletag,
                nsEndPoint: toggle.closest('.attached-modal').dataset.ns,
            })
        });

        const data = await res.json();
        
        console.log(data);
    }
}

function permissionDescription(permission) {
    const arr = {
        fullAccess: 'Access to everything',
        privateRooms: 'Interaction with private rooms',
        editRoles: 'Can edit roles',
        deletedMessages: 'Can delete messages',
        pinMessages: 'Can pin messages',
        roomHandler: 'Can create / delete rooms',
        workSpaceSettings: 'Access to workspace settings',
        invitations: 'Can invite someone to join workspace'
    }
    return arr[permission];
}

function outOfTarget(target, callback) {
    window.addEventListener('click', outTarget);
    function outTarget(e) {
        console.log('clicked');
        if(e.path.includes(target)) {
            callback(false);
        } else {
            callback(true);
            window.removeEventListener('click', outTarget);
        }
    }
}

function initPickr(el, defaultColor, cb) {
    const pickr = Pickr.create({
        el: el,
        theme: 'classic', // or 'monolith', or 'nano'
        position: 'bottom-middle',
        default: defaultColor,

        swatches: [
            'rgba(244, 67, 54, 1)',
            'rgba(233, 30, 99, 0.95)',
            'rgba(156, 39, 176, 0.9)',
            'rgba(103, 58, 183, 0.85)',
            'rgba(63, 81, 181, 0.8)',
            'rgba(33, 150, 243, 0.75)',
            'rgba(3, 169, 244, 0.7)',
            'rgba(0, 188, 212, 0.7)',
            'rgba(0, 150, 136, 0.75)',
            'rgba(76, 175, 80, 0.8)',
            'rgba(139, 195, 74, 0.85)',
            'rgba(205, 220, 57, 0.9)',
            'rgba(255, 235, 59, 0.95)',
            'rgba(255, 193, 7, 1)'
        ],

        components: {

            // Main components
            preview: true,
            opacity: true,
            hue: true,

            // Input / output Options
            interaction: {
                hex: true,
                rgba: true,
                hsla: true,
                hsva: true,
                cmyk: true,
                input: true,
                clear: true,
                save: true
            }
        }
    });

    pickr.on('save', color => {
        pickr.setColorRepresentation('HEX');
        const hexColor = color.toHEXA().toString(0);
        pickr.hide();
        cb(hexColor);
    });

    pickr.on('change', color => {
        pickr.setColorRepresentation('HEX');
        const hexColor = color.toHEXA().toString(0);
        pickr.applyColor();
        pickr.show();
        cb(hexColor);
    });

    return pickr;
}

function dragNdrop(containerEl) {
    let x = null, y = null;

    const config = {
        ui: {
            containerEl: containerEl,
            containerPaddingY: 10,
            itemHeight: 40, 
            itemMarginTop: 0,
        },
        positions: [],
        interactions: {
            itsEnter: false,
            itsDown: false,
            curDownTarget: null,
            curDownItemNo: null,
            curUpTarget: null,
            curUpItemNo: null,
        }
    }

    const container = document.querySelector(config.ui.containerEl);
    // const cursor = container.querySelector('.cursor');

    // Setting up UI
    function arrangeItems() {
        let prevHeight = 0;
        const roleListContainer = container.querySelector('.role_list');
        const roleListItems = container.querySelectorAll('.role_list_item');
        for(let i = 1; i <= roleListItems.length; i++) {
            const item = roleListContainer.querySelector(`[data-count="${i}"]`);

            const calcTop = prevHeight;
            
            // Setting style "top"
            item.style.top = `${calcTop}px`;
            
            config.positions.push({
                top: calcTop,
                bottom: calcTop + config.ui.itemHeight,
                item: item,
                itemNo: item.dataset.count
            })

            prevHeight = calcTop + config.ui.itemHeight + config.ui.itemMarginTop;
        }
        roleListContainer.insertAdjacentHTML('afterend', '<div class="drop_places"></div>');

        for(let i = 0; i < roleListItems.length; i++) {
            container.querySelector('.drop_places').insertAdjacentHTML('beforeend', `<div class="drop_place" data-count="${i+1}"></div>`);
        }

        roleListContainer.style.height = `${(roleListItems.length * (config.ui.itemMarginTop + config.ui.itemHeight))}px`
        return roleListItems;
    }
    // function arrangeItems() {
    //     let prevHeight = 0;
    //     const roleListContainer = container.querySelector('.role_list');
    //     const roleListItems = container.querySelectorAll('.role_list_item');
    //     roleListItems.forEach((item, ind) => {
    //         const calcTop = prevHeight;
            
    //         // Setting style "top"
    //         item.style.top = `${calcTop}px`;
            
    //         config.positions.push({
    //             top: calcTop,
    //             bottom: calcTop + config.ui.itemHeight,
    //             item: item,
    //             itemNo: item.dataset.count
    //         })

    //         prevHeight = calcTop + config.ui.itemHeight + config.ui.itemMarginTop;
    //     })
    //     roleListContainer.insertAdjacentHTML('afterend', '<div class="drop_places"></div>');

    //     for(let i = 0; i < roleListItems.length; i++) {
    //         container.querySelector('.drop_places').insertAdjacentHTML('beforeend', `<div class="drop_place" data-count="${i+1}"></div>`);
    //     }

    //     roleListContainer.style.height = `${(roleListItems.length * (config.ui.itemMarginTop + config.ui.itemHeight))}px`
    //     return roleListItems;
    // }

    arrangeItems();

    const containerCoords = container.getBoundingClientRect();

    container.addEventListener('mousedown', function(e) {
        // let spread = cursor.querySelector('.spread');
        // if(spread) {
        //     spread.remove();
        // }
        // cursor.insertAdjacentHTML('beforeend', `<div class="spread"></div>`);

        if(e.srcElement.classList.contains('place_holder')) {
            const roleItem = e.srcElement.closest('.role_list_item');
            config.interactions.itsDown = true;
            config.interactions.curDownTarget = e.target.closest('.role_list_item');
            config.interactions.curDownItemNo = +e.target.closest('.role_list_item').dataset.count;
            config.interactions.curDownTarget.classList.add('itsDown');
        }
    })

    container.addEventListener('mouseup', function(e) {
        if(e.srcElement.classList.contains('place_holder')) {
            config.interactions.itsDown = false;
            config.interactions.curDownTarget.classList.remove('itsDown');
            removeClassToDropPlace(config.interactions.curDownItemNo);
            if(config.interactions.curUpItemNo) {
                config.interactions.curUpTarget = this.querySelector(`.role_list_item[data-count="${config.interactions.curUpItemNo}"]`);
        
                const pos = getPosition(config.interactions.curUpItemNo);
                config.interactions.curDownTarget.style.top = `${pos}px`;
                
            } else {
                const pos = getPosition(config.interactions.curDownItemNo);
                config.interactions.curDownTarget.style.top = `${pos}px`;
            }
        }
    })

    container.addEventListener('mousemove', function(e) {
        if(config.interactions.itsEnter) {
            x = e.pageX - containerCoords.left; // Updated +14 for this particularly
            y = e.pageY - containerCoords.top; // Updated +14 for this particularly
        }
        // if(e.srcElement.classList.contains('place_holder')) {
        //     cursor.classList.remove('hide');
        //     cursor.style.top = `${y - 10}px`;
        //     cursor.style.left = `${x - 10}px`;
        // }
    });

    container.addEventListener('mouseleave', function(e) {
        // cursor.classList.add('hide');
        config.interactions.itsEnter = false;
        if(config.interactions.itsDown) {
            const pos = getPosition(config.interactions.curUpItemNo);
            config.interactions.curDownTarget.style.top = `${pos}px`;
            config.interactions.curDownTarget.classList.remove('itsDown');
            removeClassToDropPlace(config.interactions.curDownItemNo);
            config.interactions = {
                itsEnter: false,
                itsDown: false,
                curDownTarget: null,
                curDownItemNo: null,
                curUpTarget: null,
                curUpItemNo: null,
            }
        }
    });

    container.addEventListener('mouseenter', function(e) {
        config.interactions.itsEnter = true;
    });

    window.requestAnimationFrame(function animate() {
        if(config.interactions.itsDown) {
            config.interactions.curDownTarget.style.top = `${y - config.ui.itemHeight / 1.8}px`;

            const arr = config.positions.filter((cur) => {
                if(y > cur.top && y < cur.bottom) {
                    return {cur: cur};
                }
            })[0];
            if(arr) {
                config.interactions.curUpItemNo = +arr.itemNo;
                removeClassToDropPlace(config.interactions.curDownItemNo);
                addClassToDropPlace(config.interactions.curUpItemNo);
                moveTo(+arr.itemNo, +config.interactions.curDownItemNo);
            }
            
        }
        window.requestAnimationFrame(animate);
    });

    function addClassToDropPlace(count) {
        const dropPlace = document.querySelector(`.drop_places > .drop_place[data-count="${count}"]`);
        dropPlace.classList.add('active');
    }

    function removeClassToDropPlace(count) {
        const dropPlace = document.querySelector(`.drop_places > .drop_place[data-count="${count}"]`);
        dropPlace.classList.remove('active');
    }

    function moveTo(start, end) {
        if(start < end) {
            let prevHeight = start * (config.ui.itemMarginTop + config.ui.itemHeight);

            const item = container.querySelector(`.role_list_item[data-count="${start}"]`);
            config.interactions.curDownTarget.dataset.count = start;
            config.interactions.curDownItemNo = start;
            const calcTop = prevHeight;
            if(item !== config.interactions.curDownTarget) {
                item.style.top = `${calcTop}px`;
                item.dataset.count = start+1;
            }
            prevHeight = calcTop + config.ui.itemMarginTop + config.ui.itemHeight;

        } else if(start > end) {
            let prevHeight = getPosition(start - 1);

            const item = container.querySelector(`.role_list_item[data-count="${start}"]`);

            config.interactions.curDownTarget.dataset.count = start;
            config.interactions.curDownItemNo = start;
            const calcTop = prevHeight;
            if(item !== config.interactions.curDownTarget) {
                item.style.top = `${calcTop}px`;
                item.dataset.count = start-1;
            }
            prevHeight = calcTop - (config.ui.itemMarginTop + config.ui.itemHeight);
        }
    }

    function getPosition(count) {
        const ind = count - 1;
        return ind * (config.ui.itemHeight + config.ui.itemMarginTop); 
    }
}

module.exports = { 
    bgAnim, 
    toggleAuthFormUI ,
    copyToClipboard,
    loader,
    remove_sidebar,
    fetchRooms,
    fetchMentions,
    focusMessageById,
    sendImageData,
    tagImplementation,
    addResponseModal,
    updateWorkSpaceImage,
    fetchWorkSpaces,
    fetchRoomOfSingleNameSpace,
    toggleSwitch,
    permissionDescription,
    outOfTarget,
    initPickr,
    dragNdrop
}