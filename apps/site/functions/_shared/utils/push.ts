/// <reference types="@cloudflare/workers-types" />

import { Env } from '../../_shared/types'
import webpush, { PushSubscription, WebPushError } from 'web-push';
import { HumanRepository } from '../repositories/human.repository';

/**
 * Sends a push notification to a specific subscription.
 *
 * Important: Before calling this function for the first time you need to configure
 * the `web-push` library with your VAPID keys:
 *
 * webpush.setVapidDetails(
 *   'mailto:your-email@example.com',
 *   process.env.VAPID_PUBLIC_KEY,
 *   process.env.VAPID_PRIVATE_KEY
 * );
 *
 */
export const sendPushNotification = async (subscription: PushSubscription, title: string, body: string) => {
  // 1. Build the payload for the notification.
  // This is the standard format that the Service Worker on the client can parse.
  const payload = JSON.stringify({
    title, // You can add a default title here if needed
    body,
  });

  try {
    // 2. Send the notification using web-push.
    await webpush.sendNotification(subscription, payload);

  } catch (error) {
    // 3. Handle possible errors.
    const webPushError = error as WebPushError;

    // The most common error: the subscription is no longer valid.
    // The user cleared their settings, changed the browser, etc.
    // In this case the subscription should be removed from your database.
    if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
      console.error(`Subscription expired or not found: ${subscription.endpoint}`);
      // Add code here to delete this subscription from your database.
    } else {
      console.error('Error while sending a push notification:', error);
    }

    // Re-throw the error so the caller knows the send failed.
    throw error;
  }
};

export const sendPushNotificationToHuman = async (haid: string, title: string, body: string, context: { env: Env }) => {
  const { env } = context
  const humanRepository = HumanRepository.getInstance(env.DB as D1Database)
  const human = await humanRepository.findByHaid(haid) as any
  if (!human) {
    throw new Error('Human not found')
  }
  const subscription = human.data_in?.push_subscription as PushSubscription
  if (!subscription) {
    throw new Error('Push subscription not found')
  }
  await sendPushNotification(subscription, title, body)
}

