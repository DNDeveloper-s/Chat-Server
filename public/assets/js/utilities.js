// import { submitRegForm } from './auth';
const { regHandle, loginHandle } = require('./auth');

const { Moveit } = require('./moveIt');

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

module.exports = { 
    bgAnim, 
    toggleAuthFormUI ,
    copyToClipboard,
    loader,
    remove_sidebar,
    fetchRooms
}