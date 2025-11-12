'use strict'

self.addEventListener('push', function (event) {
    let data = null;
    try {
        data = event.data.json()
    } catch (error) {
        console.error('Error parsing data:', event.data.text())
        data = {
            title: 'New notification',
            body: event.data.text(),
        }
        const options = {
            body: data.body,
            icon: '/images/favicon.png', 
            badge: '/images/favicon.png'   
        }
        event.waitUntil(
            self.registration.showNotification(data.title, {
                ...options,
            })
        );
        return
    }

    const options = {
        body: data.body,
        icon: data.icon || '/images/favicon.png' , 
        badge: data.badge || '/images/favicon.png'   
    }
    
    event.waitUntil(
        self.registration.showNotification(data.title, {
            ...options,
            data: data.url || '' // Store URL in notification data
        })
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || event.notification.data || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList) {
            // Check if there's already a window/tab open with the target URL
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no matching window is found, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});