import { D1StorageService } from '../worker/d1-storage-service';
import type { Message } from '../worker/d1-storage-service';
import type { TelegramMessage, TelegramCallbackQuery } from '../worker/bot';

export interface MessageServiceConfig {
  botToken: string;
  d1Storage: D1StorageService;
}

/**
 * Service for working with Telegram bot messages
 * Responsible for sending messages and their logging
 */
export class MessageService {
  private botToken: string;
  private d1Storage: D1StorageService;

  constructor(config: MessageServiceConfig) {
    this.botToken = config.botToken;
    this.d1Storage = config.d1Storage;
  }

  // ===========================================
  // MESSAGE SENDING METHODS
  // ===========================================

  /**
   * Sends text message
   */
  async sendMessage(chatId: number, text: string, dbUserId: number): Promise<void> {
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
      console.log('Message sent successfully:', (result as any).message_id);

      // Log sent message
      await this.logSentMessage(chatId, text, (result as any).message_id, dbUserId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Sends message with keyboard
   */
  async sendMessageWithKeyboard(chatId: number, text: string, replyMarkup: any, dbUserId: number): Promise<void> {
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
      console.log('Message with keyboard sent successfully:', (result as any).message_id);

      // Log sent message
      await this.logSentMessage(chatId, text, (result as any).message_id, dbUserId);
    } catch (error) {
      console.error('Error sending message with keyboard:', error);
    }
  }

  /**
   * Sends voice message
   */
  async sendVoiceToUser(userId: number, fileId: string, duration: number, dbUserId: number): Promise<void> {
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
        console.log('Voice sent to user successfully');
        
        // Log sent voice message
        await this.logSentVoiceMessage(userId, fileId, (result as any).message_id, duration, dbUserId);
      }
    } catch (error) {
      console.error('Error sending voice to user:', error);
    }
  }

  /**
   * Sends photo
   */
  async sendPhotoToUser(userId: number, fileId: string, caption: string | undefined, dbUserId: number): Promise<void> {
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
        console.log('Photo sent to user successfully');
        
        // Log sent photo
        await this.logSentPhotoMessage(userId, fileId, (result as any).message_id, caption, dbUserId);
      }
    } catch (error) {
      console.error('Error sending photo to user:', error);
    }
  }

  /**
   * Sends document
   */
  async sendDocumentToUser(userId: number, fileId: string, fileName: string | undefined, caption: string | undefined, dbUserId: number): Promise<void> {
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
        console.log('Document sent to user successfully');
        
        // Log sent document
        await this.logSentDocumentMessage(userId, fileId, (result as any).message_id, fileName, caption, dbUserId);
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
  async handleCallbackQuery(callbackQuery: any, dbUserId: number): Promise<void> {
    try {
      // Log callback query
      await this.logCallbackQuery(callbackQuery, dbUserId);
      
      // Answer callback query to remove loading indicator
      await this.answerCallbackQuery(callbackQuery.id);
      
      console.log(`✅ Callback query handled successfully for user with DB ID: ${dbUserId}`);
    } catch (error) {
      console.error('❌ Error handling callback query:', error);
      throw error;
    }
  }

  // ===========================================
  // MESSAGE LOGGING METHODS
  // ===========================================

  /**
   * Logs incoming message from user
   */
  async logMessage(message: TelegramMessage, direction: 'incoming' | 'outgoing', dbUserId: number): Promise<void> {
    try {
      console.log(`📝 Logging ${direction} message from user ${message.from.id} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: this.getMessageType(message),
        direction,
        content: message.text || '',
        telegramMessageId: message.message_id,
        fileId: message.voice?.file_id || message.photo?.[0]?.file_id || message.document?.file_id || '',
        fileName: message.document?.file_name || '',
        caption: message.caption || '',
        createdAt: new Date().toISOString()
      };

      console.log(`📝 Message log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.d1Storage.addMessage(messageLog);
      console.log(`✅ Message logged successfully with ID: ${result}`);
    } catch (error) {
      console.error('❌ Error logging message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs callback query
   */
  async logCallbackQuery(callbackQuery: TelegramCallbackQuery, dbUserId: number): Promise<void> {
    try {
      console.log(`🔘 Logging callback query from user ${callbackQuery.from.id} (DB ID: ${dbUserId}): ${callbackQuery.data}`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'user_callback' as const,
        direction: 'incoming' as const,
        content: callbackQuery.data || '',
        telegramMessageId: callbackQuery.message?.message_id || 0,
        callbackData: callbackQuery.data || '',
        createdAt: new Date().toISOString()
      };

      console.log(`🔘 Callback log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.d1Storage.addMessage(messageLog);
      console.log(`✅ Callback logged successfully with ID: ${result}`);
    } catch (error) {
      console.error('❌ Error logging callback query:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent text message
   */
  async logSentMessage(chatId: number, text: string, messageId: number, dbUserId: number): Promise<void> {
    try {
      console.log(`🤖 Logging bot message to user ${chatId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_text' as const,
        direction: 'outgoing' as const,
        content: text,
        telegramMessageId: messageId,
        createdAt: new Date().toISOString()
      };

      console.log(`🤖 Bot message log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.d1Storage.addMessage(messageLog);
      console.log(`✅ Bot message logged successfully with ID: ${result} for user ${chatId}: ${text.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ Error logging sent message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent voice message
   */
  async logSentVoiceMessage(userId: number, fileId: string, messageId: number, duration: number, dbUserId: number): Promise<void> {
    try {
      console.log(`🎤 Logging bot voice message to user ${userId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_voice' as const,
        direction: 'outgoing' as const,
        content: `Voice message (${duration}s)`,
        telegramMessageId: messageId,
        fileId: fileId,
        createdAt: new Date().toISOString()
      };

      console.log(`🎤 Bot voice log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.d1Storage.addMessage(messageLog);
      console.log(`✅ Bot voice message logged successfully with ID: ${result} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error logging sent voice message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent photo
   */
  async logSentPhotoMessage(userId: number, fileId: string, messageId: number, caption: string | undefined, dbUserId: number): Promise<void> {
    try {
      console.log(`📷 Logging bot photo message to user ${userId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_photo' as const,
        direction: 'outgoing' as const,
        content: caption || 'Photo',
        telegramMessageId: messageId,
        fileId: fileId,
        caption: caption || '',
        createdAt: new Date().toISOString()
      };

      console.log(`📷 Bot photo log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.d1Storage.addMessage(messageLog);
      console.log(`✅ Bot photo message logged successfully with ID: ${result} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error logging sent photo message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent document
   */
  async logSentDocumentMessage(userId: number, fileId: string, messageId: number, fileName: string | undefined, caption: string | undefined, dbUserId: number): Promise<void> {
    try {
      console.log(`📄 Logging bot document message to user ${userId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_document' as const,
        direction: 'outgoing' as const,
        content: caption || `Document: ${fileName || 'Unknown'}`,
        telegramMessageId: messageId,
        fileId: fileId,
        fileName: fileName || '',
        caption: caption || '',
        createdAt: new Date().toISOString()
      };

      console.log(`📄 Bot document log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.d1Storage.addMessage(messageLog);
      console.log(`✅ Bot document message logged successfully with ID: ${result} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error logging sent document message:', error);
      console.error('Error details:', error);
    }
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================

  /**
   * Determines the type of incoming message
   */
  private getMessageType(message: TelegramMessage): 'user_text' | 'user_voice' | 'user_photo' | 'user_document' {
    if (message.text) return 'user_text';
    if (message.voice) return 'user_voice';
    if (message.photo) return 'user_photo';
    if (message.document) return 'user_document';
    return 'user_text';
  }

  /**
   * Determines the type of outgoing message from bot
   */
  private getBotMessageType(message: TelegramMessage): 'bot_text' | 'bot_voice' | 'bot_photo' | 'bot_document' {
    if (message.text) return 'bot_text';
    if (message.voice) return 'bot_voice';
    if (message.photo) return 'bot_photo';
    if (message.document) return 'bot_document';
    return 'bot_text';
  }
}
