const socket = require('socket.io-client');

const submitRegForm = async () => {
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


module.exports = { submitRegForm };