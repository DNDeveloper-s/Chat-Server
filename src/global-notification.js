const Timeout = require('smart-timeout');

const notificationConfig = {
    notificaitonMT: 10,
    isRemoving: false
}

let notificationContainer = document.querySelector('.notification_container');

function createNotification(data) {

    if(!notificationContainer) {
        const rootEl = document.getElementById('root');
        rootEl.insertAdjacentHTML('beforeend', '<div class="notification_container"></div>');
        notificationContainer = document.querySelector('.notification_container');
    }

    // Getting Count of the notification
    const count = notificationContainer.childElementCount;

    // Removing Pointer Events Property to auto
    notificationContainer.style.pointerEvents = 'auto';

    // ID
    const id = Math.ceil(Math.random() * 20) * 213898213;

    // Checking if image is present or not
    let imageEl = '';
    if(data.image) {
        imageEl = `
            <div class="notification_img">
                <img src="${data.image}" alt="">
            </div>
        `;
    }

    // Getting HTML // with Hidden Class to stay hide for initial moment
    const html = `
        <div class="notification hidden ${data.color}" id="${id}" data-notificationcount="${count+1}"> 
            <div class="notification_close-btn">
                <svg height="365pt" viewBox="0 0 365.71733 365" width="365pt" xmlns="http://www.w3.org/2000/svg"><g fill="#8a0c0c"><path d="m356.339844 296.347656-286.613282-286.613281c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503906-12.5 32.769532 0 45.25l286.613281 286.613282c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082032c12.523438-12.480468 12.523438-32.75.019532-45.25zm0 0"/><path d="m295.988281 9.734375-286.613281 286.613281c-12.5 12.5-12.5 32.769532 0 45.25l15.082031 15.082032c12.503907 12.5 32.769531 12.5 45.25 0l286.632813-286.59375c12.503906-12.5 12.503906-32.765626 0-45.246094l-15.082032-15.082032c-12.5-12.523437-32.765624-12.523437-45.269531-.023437zm0 0"/></g></svg>
            </div>
            ${imageEl}
            <div class="notification_txt">${data.message}</div>
        </div>
    `;

    // Storing Notifications before adding new one {Old State}
    const notifications = notificationContainer.querySelectorAll('.notification');

    // Injecting to Container
    // But not showing yet
    notificationContainer.insertAdjacentHTML('beforeend', html);

    // Now collecting data of the notification to update the container
    // height
    const notification = notificationContainer.lastElementChild;
    const height = notification.clientHeight;
    notification.style.bottom = `20px`;
    notification.style.height = `${height}px`;

    // Updating the height of notification container
    notificationContainer.style.height = `${notificationContainer.clientHeight + height + notificationConfig.notificaitonMT}px`;

    // Updating the notifications position in the container those are already in the container
    updateNotificationsPosition({
        height: height,
        notifications: notifications,
        adding: true,
        range: [1, count]
    })

    // Pushing Notification to Container {Visible}
    notification.classList.remove('hidden');

    // Adding EventListener to the closenotification button
    const removeBtn = notification.querySelector('.notification_close-btn');
    removeBtn.addEventListener('click', function() {
        const count = this.closest('.notification').dataset.notificationcount;
        deleteNotification(count);
    })

    // Removing Notification on timeout
    if(data.timeout) {

        Timeout.set(`removingAllNotifications`, deleteAll, 6000);

        async function deleteAll() {
            window.notificationRemoving = true;
            const counts = notificationContainer.childElementCount;
            for(let i = 0; i < counts; i++) {
                await new Promise(function(res, rej) {
                    setTimeout(() => {
                        deleteNotification(counts-i);
                        res();
                    }, 500);
                })
            }
            window.notificationRemoving = false;
        }
    }
}

function deleteNotification(count) {
    if(notificationConfig.isRemoving) {
        return false;
    }
    notificationConfig.isRemoving = true;

    // Grabbing Notificaiton Element which is on target to delete
    const notificaitonEl = notificationContainer.querySelector(`.notification[data-notificationcount="${count}"]`);
    
    // Remove Item from UI but not from DOM with transition
    notificaitonEl.classList.add('hidden');

    // Storing the details of notification El to update others
    let height = notificaitonEl.clientHeight - 4;

    // Now its time to remove item from DOM
    // using SetTimeout cause toggling class with transition takes time
    setTimeout(() => {
        notificationConfig.isRemoving = false;
        
        notificaitonEl.remove();

        // Pointer events changing to none on no child on container
        if(notificationContainer.childElementCount === 0) {
            notificationContainer.style.pointerEvents = 'none';
        }

        // Updating the height of notification container
        notificationContainer.style.height = `${notificationContainer.clientHeight - (height + notificationConfig.notificaitonMT + 8)}px`;

        // Update the height of the other notification, 
        // In this case it will be easy as 
        // Just update all the notificaiton's height through a loop

        // Storing Notifications after deleting new one {New State}
        const notifications = notificationContainer.querySelectorAll('.notification');

        // There are two cases
        // 1. When last item is deleted
        if(count == notificationContainer.childElementCount) {

            // Updating the notifications position in the container those are already in the container
            updateNotificationsPosition({
                height: height,
                notifications: notifications,
                adding: false,
                range: [1, count]
            })
        } else {
            // 2. When middle or top item is deleted

            // Update the height of the other notification, 
            // In this case it will be tricky as
            // We have to check which item is going to be deleted 
            // and according to that we are going to adjust the position of the notifications
            // those are come to top of that deleted notification

            // Updating the notifications position in the container those are already in the container
            updateNotificationsPosition({
                height: height,
                notifications: notifications,
                adding: false,
                range: [1, count-1]
            })

            // Updating change of count sequence to other element those are present
            // for(let i = count; i < notificationContainer.childElementCount; i++) {
            //     // our target el will be i+1 as we are looking to update next element related to deleted one
            //     const el = notificationContainer.querySelector(`.notification[data-notificationcount="${i+1}"]`);

            //     // time to update 
            //     // decrement
            //     el.dataset.notificationcount = +el.dataset.notificationcount - 1;

            // }
        }
    }, 400)
}


function updateNotificationsPosition(newNotification) {
    const height = newNotification.height;

    newNotification.notifications.forEach(notification => {
        if(notification.dataset.notificationcount >= newNotification.range[0] && notification.dataset.notificationcount <= newNotification.range[1]) {
            const prevTop = +notification.style.bottom.slice(0, -2);
            if(newNotification.adding) {
                notification.style.bottom = `${prevTop + (height + notificationConfig.notificaitonMT)}px`;
            } else {
                notification.style.bottom = `${prevTop - (height + notificationConfig.notificaitonMT) - 8}px`;
            }
        }
    })
}

module.exports = {
    createNotification,
    deleteNotification
}