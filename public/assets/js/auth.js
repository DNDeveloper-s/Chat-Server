const socket = require('socket.io-client');

const { Moveit } = require('./moveIt');
 
const regHandle = async () => {
    const name = document.getElementsByName('fullName')[0].value;
    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;
    const conPassword = document.getElementsByName('conPassword')[0].value;

    

    const location = window.location.origin;
    console.log(location);
    

    const res = await fetch(`${location}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })

    const data = await res.json();

    if(data.acknowledgment.type === 'success') {
        
        

    } else if(data.acknowledgment.type === 'error') {



    }
}

const loginHandle = async () => {
    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;

    const loader = document.querySelector('.mainAuthBtn.btn[type="submit"]');

    loader.classList.add('loading');

    const location = window.location.origin;


    const res = await fetch(`${location}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })

    const data = await res.json();

    loader.classList.remove('loading');
        
    const successHTML = `<div class="popup ${data.acknowledgment.type}">${data.acknowledgment.message}</div>`;

    const authModal = document.querySelector('.auth-modal');

    if(authModal.querySelector('.popup')) {
        authModal.querySelector('.popup').remove();
    }
    authModal.insertAdjacentHTML('afterbegin', successHTML);

    if(data.acknowledgment.type === "success") {
        console.log('Done!');
        
        setTimeout(() => {
            window.location = `${location}/dashboard/home`;
        }, 1400);
    }
}

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



module.exports = { regHandle, loginHandle, loader };