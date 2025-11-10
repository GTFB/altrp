declare module 'web-push' {
  export interface PushSubscriptionKeys {
    auth: string;
    p256dh: string;
  }

  export interface PushSubscription {
    endpoint: string;
    expirationTime?: number | null;
    keys: PushSubscriptionKeys;
  }

  export class WebPushError extends Error {
    readonly statusCode: number;
    readonly headers: Record<string, string>;
    readonly body: string;
    readonly retries?: number;
    constructor(message: string, statusCode: number, headers: Record<string, string>, body: string);
  }

  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | null,
    options?: unknown
  ): Promise<void>;
  export function generateVAPIDKeys(): { publicKey: string; privateKey: string };
}

