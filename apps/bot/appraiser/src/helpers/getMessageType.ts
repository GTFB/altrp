/**
 * Interface for Telegram message object
 */
export interface MessageType {
  text?: string;
  voice?: { file_id: string; [key: string]: any };
  photo?: Array<{ file_id: string; [key: string]: any }>;
  document?: { file_id: string; [key: string]: any };
}

/**
 * Determines the type of message
 * Accepts any object with optional text, voice, photo, or document fields
 * @param message - Message object
 * @param direction - Message direction ('incoming' or 'outgoing')
 */
export function getMessageType(
  message: MessageType, 
  direction: 'incoming' | 'outgoing' = 'incoming'
): 'user_text' | 'user_voice' | 'user_photo' | 'user_document' | 'bot_text' | 'bot_voice' | 'bot_photo' | 'bot_document' {
  const prefix = direction === 'outgoing' ? 'bot_' : 'user_';
  
  if (message.text) return `${prefix}text` as any;
  if (message.voice) return `${prefix}voice` as any;
  if (message.photo && message.photo.length > 0) return `${prefix}photo` as any;
  if (message.document) return `${prefix}document` as any;
  return `${prefix}text` as any;
}

