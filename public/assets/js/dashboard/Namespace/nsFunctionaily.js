const io = require('socket.io-client');
let nsSocket;

async function connectToNs(nsEndPoint) {
    console.log(nsEndPoint);
    
    await fetch(`${window.location.origin}/dashboard/workspace?isLoad=true&nsEndPoint=${nsEndPoint}`, {
        method: "GET"
    });

    // if(nsSocket) {
        
    //     if(nsEndPoint === nsSocket.nsp) {
    //         console.log('it same nsSocket');
    //     } else {
    //         nsSocket.close();
    //         nsSocket = io(`${window.location.origin}${nsEndPoint}`);
    //     }

    // } else {
    //     nsSocket = io(`${window.location.origin}${nsEndPoint}`);
    // }

    nsSocket = io(`${window.location.origin}${nsEndPoint}`);

    console.log(`${window.location.origin}${nsEndPoint}`);


    // nsSocket.on('hi', function(data) {
        // console.log(data.data);
        // nsSocket.off('hi');
    // });

    nsSocket.on('toMe', function(data) {
        console.log(data);
    })  

    nsSocket.on('clients', function(data) {
        console.log(data);
    })  

    nsSocket.on('connectedByLink', function(data) {
        console.log(data);
    });

    nsSocket.on('disconnected', function(data) {
        console.log(data);
    });
    
}

function isItSameNs(nsSocket, nsEndPoint) {
    if(nsSocket) {
        
        if(nsEndPoint === nsSocket.nsp) {
            console.log('it same nsSocket');
            return true;
        } else {
            nsSocket.close();
            return false;
        }

    } else {
        return false;
    }
}

function nsListeners() {
    const nameSpaces = document.querySelectorAll('.nameSpaceContainer > .name_space');

    nameSpaces.forEach(ns => {
        ns.addEventListener('click', async (e) => {
            if (window.history.replaceState) {
                //prevents browser from storing history with each change:
                window.history.replaceState('Workspace', `${ns.dataset.ns.slice(1)}`, `/dashboard/workspace?isLoad=true&nsEndPoint=${ns.dataset.ns.slice(1)}`);
             }
            const isIt = isItSameNs(nsSocket, ns.dataset.ns);
            if(!isIt) {                
                connectToNs(ns.dataset.ns);
            }
        });
    })
}

module.exports = { connectToNs, nsListeners };