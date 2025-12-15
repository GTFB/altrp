import type { TelegramMessage, TelegramCallbackQuery } from './bot';
import { MessageLoggingService } from './message-logging-service';

export interface MessageServiceConfig {
  botToken: string;
  messageLoggingService: MessageLoggingService;
}

/**
 * Service for working with Telegram bot messages
 * Responsible only for sending messages
 */
export class MessageService {
  private botToken: string;
  private messageLoggingService: MessageLoggingService;

  constructor(config: MessageServiceConfig) {
    this.botToken = config.botToken;
    this.messageLoggingService = config.messageLoggingService;
  }

  /**
   * Sends text message
   */
  async sendMessage(chatId: number, text: string, dbHumanId: number): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error sending message:', errorData);
        return;
      }

      const result = await response.json();
      const sentMessage = (result as any).ok && (result as any).result 
        ? (result as any).result as TelegramMessage 
        : null;
      console.log('Message sent successfully:', sentMessage?.message_id);

      // Log sent message using unified logMessage
      if (sentMessage) {
        await this.messageLoggingService.logMessage(sentMessage, 'outgoing', dbHumanId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Sends message with keyboard
   */
  async sendMessageWithKeyboard(chatId: number, text: string, replyMarkup: any, dbHumanId: number): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error sending message with keyboard:', errorData);
        return;
      }

      const result = await response.json();
      const sentMessage = (result as any).ok && (result as any).result 
        ? (result as any).result as TelegramMessage 
        : null;
      console.log('Message with keyboard sent successfully:', sentMessage?.message_id);

      // Log sent message using unified logMessage
      if (sentMessage) {
        await this.messageLoggingService.logMessage(sentMessage, 'outgoing', dbHumanId);
      }
    } catch (error) {
      console.error('Error sending message with keyboard:', error);
    }
  }

  /**
   * Sends voice message
   */
  async sendVoiceToUser(userId: number, fileId: string, duration: number, dbHumanId: number): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendVoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userId,
          voice: fileId,
          duration: duration
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error sending voice to user:', errorData);
      } else {
        const result = await response.json();
        const sentMessage = (result as any).ok && (result as any).result 
          ? (result as any).result as TelegramMessage 
          : null;
        console.log('Voice sent to user successfully');
        
        // Log sent voice message using unified logMessage
        if (sentMessage) {
          await this.messageLoggingService.logMessage(sentMessage, 'outgoing', dbHumanId);
        }
      }
    } catch (error) {
      console.error('Error sending voice to user:', error);
    }
  }

  /**
   * Sends photo
   */
  async sendPhotoToUser(userId: number, fileId: string, caption: string | undefined, dbHumanId: number): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendPhoto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userId,
          photo: fileId,
          caption: caption || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error sending photo to user:', errorData);
      } else {
        const result = await response.json();
        const sentMessage = (result as any).ok && (result as any).result 
          ? (result as any).result as TelegramMessage 
          : null;
        console.log('Photo sent to user successfully');
        
        // Log sent photo using unified logMessage
        if (sentMessage) {
          await this.messageLoggingService.logMessage(sentMessage, 'outgoing', dbHumanId);
        }
      }
    } catch (error) {
      console.error('Error sending photo to user:', error);
    }
  }

  /**
   * Sends document
   */
  async sendDocumentToUser(userId: number, fileId: string, fileName: string | undefined, caption: string | undefined, dbHumanId: number): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendDocument`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userId,
          document: fileId,
          caption: caption || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error sending document to user:', errorData);
      } else {
        const result = await response.json();
        const sentMessage = (result as any).ok && (result as any).result 
          ? (result as any).result as TelegramMessage 
          : null;
        console.log('Document sent to user successfully');
        
        // Log sent document using unified logMessage
        if (sentMessage) {
          await this.messageLoggingService.logMessage(sentMessage, 'outgoing', dbHumanId);
        }
      }
    } catch (error) {
      console.error('Error sending document to user:', error);
    }
  }

  /**
   * Sends message to topic
   */
  async sendMessageToTopic(chatId: number, topicId: number, text: string): Promise<void> {
    try {

      const sendConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          text: text,
          parse_mode: 'HTML'
        })
      };

      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const response = await fetch(url, sendConfig);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error sending message to topic:', errorData, sendConfig);
      }
    } catch (error) {
      console.error('Error sending message to topic:', error);
    }
  }

  /**
   * Sends message with keyboard to topic
   */
  async sendMessageWithKeyboardToTopic(chatId: number, topicId: number, text: string, replyMarkup: any): Promise<void> {
    try {
      const sendConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        })
      };

      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

      const response = await fetch(url, sendConfig);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error sending message with keyboard to topic:', errorData, sendConfig);
      } else {
        const result = await response.json();
        console.log('Message with keyboard sent to topic successfully:', (result as any).message_id);
      }
    } catch (error) {
      console.error('Error sending message with keyboard to topic:', error);
    }
  }

  /**
   * Answers callback query
   */
  async answerCallbackQuery(callbackQueryId: string): Promise<void> {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error answering callback query:', errorData);
      } else {
        console.log('Callback query answered successfully');
      }
    } catch (error) {
      console.error('Error answering callback query:', error);
    }
  }

  /**
   * Handles callback query: logs and answers it
   */
  async handleCallbackQuery(callbackQuery: any, dbHumanId: number): Promise<void> {
    try {
      // Log callback query
      await this.messageLoggingService.logCallbackQuery(callbackQuery, dbHumanId);
      
      // Answer callback query to remove loading indicator
      await this.answerCallbackQuery(callbackQuery.id);
      
      console.log(`✅ Callback query handled successfully for human with DB ID: ${dbHumanId}`);
    } catch (error) {
      console.error('❌ Error handling callback query:', error);
      throw error;
    }
  }

}
