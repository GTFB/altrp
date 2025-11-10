'use strict'

self.addEventListener('push', function (event) {
    const data = event.data.json()
    console.log('New notification!', data)
    const options = {
        body: data.body,
        icon: '/images/favicon.jpg', 
        badge: '/images/favicon.jpg'   
    }
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});