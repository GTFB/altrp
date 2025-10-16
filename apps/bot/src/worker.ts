import { TelegramBotWorker } from './worker/bot';
import { KVStorageService } from './worker/kv-storage-service';
import type { KVNamespace, D1Database, R2Bucket, ExecutionContext } from '@cloudflare/workers-types';

export interface Env {
  BZN_BOT_KV: KVNamespace;
  DB: D1Database;
  BOT_STORAGE: R2Bucket;
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  TRANSCRIPTION_API_TOKEN: string;
  NODE_ENV: string;
  LOCALE: string;
}

export interface ScheduledEvent {
  type: 'scheduled';
  cron: string;
  scheduledTime: number;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Initialize services
      const storageService = new KVStorageService(env.BZN_BOT_KV);
      const botWorker = new TelegramBotWorker(env, storageService);

      // Process request
      const response = await botWorker.handleRequest(request);
      
      return response;
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      console.log('Cron triggered:', event.cron);
      
      // Initialize services
      const storageService = new KVStorageService(env.BZN_BOT_KV);
      const botWorker = new TelegramBotWorker(env, storageService);

      // Check delayed messages
      await botWorker.checkDelayedMessages();
    } catch (error) {
      console.error('Scheduled task error:', error);
    }
  },
};
