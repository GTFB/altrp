type PermissionState = 'granted' | 'denied' | 'default';

/**
 * Requests permission from the user to display notifications.
 * @returns {Promise<PermissionState>} The current permission state ('granted', 'denied', or 'default').
 */
export async function askForNotificationPermission(): Promise<PermissionState> {
    // Check whether the Notification API is available in this browser
    if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications.');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Creates a push subscription and sends it to the server.
 * This function must be called ONLY after permission has been granted ('granted').
 * @param {string} vapidPublicKey - Your public VAPID key.
 * @throws {Error} If push notifications are not supported or the subscription cannot be sent.
 */
export async function subscribeUserToPush(vapidPublicKey: string): Promise<void> {
    const serverUrl = `/api/subcribe-push`;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported in this browser.');
    }

    // Obtain the Service Worker registration
    const registration = await navigator.serviceWorker.ready;

    // Check whether the user already has a subscription
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
        console.log('The user is already subscribed.');
        // If needed, re-send the subscription to the server for synchronization
        // await sendSubscriptionToServer(existingSubscription, serverUrl);
        return;
    }

    // Create a new subscription
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true, // Required parameter
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    await sendSubscriptionToServer(subscription, serverUrl);
    console.log('Subscription created and sent to the server.');
}


/**
 * @private
 */
async function sendSubscriptionToServer(subscription: PushSubscription, serverUrl: string): Promise<void> {
    const response = await fetch(serverUrl, {
        method: 'POST',
        body: JSON.stringify({subscription}),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to send the subscription to the server.');
    }
}

/**
 * @private
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
}