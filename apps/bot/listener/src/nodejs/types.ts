// Общие типы для Node.js версии бота
// Адаптеры для совместимости с существующими core модулями

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  text?: string;
  voice?: TelegramVoice;
  photo?: TelegramPhoto[];
  document?: TelegramDocument;
  caption?: string;
  date: number;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
}

export interface TelegramVoice {
  file_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramPhoto {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export interface Message {
  id?: number;
  userId: number;
  messageType: 'user_text' | 'user_voice' | 'user_photo' | 'user_document' | 'user_callback' | 'bot_text' | 'bot_photo' | 'bot_voice' | 'bot_document' | 'command';
  direction: 'incoming' | 'outgoing';
  content?: string;
  telegramMessageId?: number;
  callbackData?: string;
  commandName?: string;
  fileId?: string;
  fileName?: string;
  caption?: string;
  topicId?: number;
  data?: string;
  createdAt?: string;
}

// Интерфейс для совместимости с D1StorageService
export interface D1StorageService {
  addUser(user: any): Promise<void>;
  getUser(telegramId: number): Promise<any>;
  updateUserTopic(telegramId: number, topicId: number): Promise<void>;
  updateUserData(telegramId: number, data: string): Promise<void>;
  setSession(key: string, value: any): Promise<void>;
  getSession(key: string): Promise<any>;
  deleteSession(key: string): Promise<void>;
  getUserIdByTopic(topicId: number): Promise<number | null>;
  getAllUsers(): Promise<any[]>;
  addMessage(message: Message): Promise<number>;
}
