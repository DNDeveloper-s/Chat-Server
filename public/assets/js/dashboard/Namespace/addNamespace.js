function addNewNS(namespace) {
    const namespaceHtml = `
        <div class="name_space image_holder anim" ns="${namespace.endPoint}" data-animtochilds="false"  data-animdirection="topToBottom" data-startoffset="3px">
             <img src="${namespace.image}" alt="${namespace.nsTitle}" title="${namespace.nsTitle}">
        </div>
    `;
    nameSpaceContainer.insertAdjacentHTML('beforeend', namespaceHtml);

    addAnimClass();
    // nameSpaceContainer.lastElementChild.addEventListener('click', e => {
    //     isAlreadyConnectedToSameNs(namespace.endPoint, true);
    // });
    // joinNs({
    //     endPoint: namespace.endPoint,
    //     fetchAll: true,
    //     dontAddAnimClass: false
    // });
}

module.exports = { addNewNS };