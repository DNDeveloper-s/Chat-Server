const {connectToNs} = require('./nsFunctionaily');

async function postNewNs(ns) {
    const response = await fetch(`${window.location.origin}/dashboard/new/workspace`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: ns.title,
            defRoomTitle: ns.defRoomTitle
        })
    })

    const data = await response.json();

    console.log(data);
    if(data.acknowledgment.type === "success") {
        addNewNS({
            endPoint: data.acknowledgment.workSpace.endPoint,
            title: data.acknowledgment.workSpace.title,
        });
    }
}

function addNewNS(namespace) {
    const nameSpaceContainer = document.querySelector('.nameSpaceContainer');
    const namespaceHtml = `
        <div class="name_space image_holder anim" data-ns="${namespace.endPoint}" data-animtochilds="false"  data-animdirection="topToBottom" data-startoffset="3px">
            
             <img src="/assets/images/Saurabh_DP_square.jpg" alt="${namespace.title}" title="${namespace.title}">
        </div>
    `;
    // <img src="${namespace.image}" alt="${namespace.title}" title="${namespace.title}"></img>

    nameSpaceContainer.insertAdjacentHTML('beforeend', namespaceHtml);

    // addAnimClass();
    nameSpaceContainer.lastElementChild.addEventListener('click', async (e) => {
        console.log('clicked');
        
        const response = await fetch(`${window.location.origin}/dashboard/connect/namespace?nsEndPoint=${namespace.endPoint}`, {
            method: "GET"
        });
        const data = await response.json();
        
        console.log(data);
        
        connectToNs(namespace.endPoint);
    });
    // joinNs({
    //     endPoint: namespace.endPoint,
    //     fetchAll: true,
    //     dontAddAnimClass: false
    // });
}

async function joinUsingLink(link) {

    const res = await fetch(`${window.location.origin}/dashboard/workspace?nsName=${link.split('-')[0]}&connectByLink=true&connectTo=${link}`, {
        method: "POST"
    })

    const data = await res.json();

    console.log(data);
}

module.exports = { postNewNs, addNewNS, joinUsingLink };