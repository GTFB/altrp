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
 * Determines the type of incoming message from user
 * Accepts any object with optional text, voice, photo, or document fields
 */
export function getMessageType(message: MessageType): 'user_text' | 'user_voice' | 'user_photo' | 'user_document' {
  if (message.text) return 'user_text';
  if (message.voice) return 'user_voice';
  if (message.photo && message.photo.length > 0) return 'user_photo';
  if (message.document) return 'user_document';
  return 'user_text';
}

