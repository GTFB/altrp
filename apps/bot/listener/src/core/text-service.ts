import { D1StorageService, type Text } from '../worker/d1-storage-service';

export interface TextServiceConfig {
  d1Storage: D1StorageService;
}

/**
 * Service for working with texts from texts table
 * Responsible for retrieving text content by taid
 */
export class TextService {
  private d1Storage: D1StorageService;

  constructor(config: TextServiceConfig) {
    this.d1Storage = config.d1Storage;
  }

  /**
   * Gets text content by taid
   * Retrieves content from content field
   * @param taid - Text identifier (taid)
   * @returns Content string or null if not found
   */
  async getContentByTaid(taid: string): Promise<string | null> {
    try {
      const text = await this.d1Storage.getTextByTaid(taid);
      
      if (!text) {
        console.log(`Text with taid ${taid} not found`);
        return null;
      }

      if (text.content) {
        console.log(`✅ Content retrieved for taid ${taid}`);
        return text.content;
      } else {
        console.log(`Text with taid ${taid} has no content`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting content for taid ${taid}:`, error);
      return null;
    }
  }

  /**
   * Gets full text object by taid
   * @param taid - Text identifier (taid)
   * @returns Text object or null if not found
   */
  async getTextByTaid(taid: string): Promise<Text | null> {
    try {
      return await this.d1Storage.getTextByTaid(taid);
    } catch (error) {
      console.error(`Error getting text for taid ${taid}:`, error);
      return null;
    }
  }

  /**
   * Finds taid by content
   * Searches for text with exact content match
   * @param content - Text content to search for
   * @returns taid string or null if not found
   */
  async getTaidByContent(content: string): Promise<string | null> {
    try {
      return await this.d1Storage.getTaidByContent(content);
    } catch (error) {
      console.error(`Error getting taid for content:`, error);
      return null;
    }
  }
}

