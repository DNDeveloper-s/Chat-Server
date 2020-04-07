const {connectToNs, loadNamespace} = require('./nsFunctionaily');
const {addResponseModal, fetchRoomOfSingleNameSpace} = require('../../utilities');

async function postNewNs(ns) {
    const response = await fetch(`${window.location.origin}/dashboard/workspace/new`, {
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

    const modalEl = document.querySelector('.modal[data-id="addNs"]');
    addResponseModal({
        selector: '.modal[data-id="addNs"]',
        type: data.acknowledgment.type,
        message: data.acknowledgment.message
    });

    if(data.acknowledgment.type === "success") {
        addNewNS(data.acknowledgment.workSpace);
    }
}

async function addNewNS(namespace) {
    const nameSpaceContainer = document.querySelector('.nameSpaceContainer');
    const namespaceHtml = `
        <div class="name_space image_holder anim" data-ns="${namespace.endPoint}" data-animtochilds="false"  data-animdirection="topToBottom" data-startoffset="3px">
             <img src="${namespace.image}" alt="${namespace.title}" title="${namespace.title}">
             <div class="ns-notification" data-nothing="true"></div>
        </div>
    `;
    // <img src="${namespace.image}" alt="${namespace.title}" title="${namespace.title}"></img>

    nameSpaceContainer.insertAdjacentHTML('beforeend', namespaceHtml);

    // fetchWorkSpaces();

    // Working with sessionStorage
    const nsEndPoint = namespace.endPoint;
    const res = await fetch(`${window.location.origin}/dashboard/fetch?workspaces=true&nsEndPoint=${nsEndPoint}`, {
        method: "GET"
    })
    const data = await res.json();
    const jsonData = sessionStorage.getItem(`all_workspaces`);
    const workSpaces = JSON.parse(jsonData);
    workSpaces[nsEndPoint] = data;
    sessionStorage.setItem(`all_workspaces`, JSON.stringify(workSpaces));
    
    fetchRoomOfSingleNameSpace(nsEndPoint);

    loadNamespace(namespace.endPoint);
    connectToNs(namespace.endPoint);

    // addAnimClass();
    nameSpaceContainer.lastElementChild.addEventListener('click', async (e) => {
        console.log('clicked');
        
        // const response = await fetch(`${window.location.origin}/dashboard/connect/namespace?nsEndPoint=${namespace.endPoint}`, {
        //     method: "GET"
        // });
        // const data = await response.json();

        loadNamespace(namespace.endPoint);

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

    const modalEl = document.querySelector('.modal[data-id="addNs"]');
    addResponseModal({
        selector: '.modal[data-id="addNs"]',
        type: data.acknowledgment.type,
        message: data.acknowledgment.message
    });
}

module.exports = { postNewNs, addNewNS, joinUsingLink };