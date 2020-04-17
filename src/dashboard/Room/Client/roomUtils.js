module.exports.getRoomId = (reactContainer) => {
    let messageId = null;
    const headerEl = reactContainer.closest('.header');
    if(headerEl) {
        messageId = headerEl.querySelector('.message-data > p').dataset.messageid;
        messageText = headerEl.querySelector('.message-data > p').innerHTML;
    } else {
        messageId = reactContainer.closest('p').dataset.messageid;
        messageText = reactContainer.closest('p').innerHTML;
    }


    return {messageId : messageId, messageText: messageText};
}