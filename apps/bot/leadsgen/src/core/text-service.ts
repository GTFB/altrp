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
   * Extracts content from data_in JSON field
   * @param taid - Text identifier (taid)
   * @returns Content string or null if not found
   */
  async getContentByTaid(taid: string): Promise<string | null> {
    try {
      const text = await this.d1Storage.getTextByTaid(taid);
      
      if (!text || !text.dataIn) {
        console.log(`Text with taid ${taid} not found or has no data_in`);
        return null;
      }

      // Parse data_in JSON and extract content
      try {
        const dataInObj = JSON.parse(text.dataIn);
        const content = dataInObj.content;
        
        if (typeof content === 'string') {
          console.log(`✅ Content retrieved for taid ${taid}`);
          return content;
        } else {
          console.warn(`Content for taid ${taid} is not a string`);
          return null;
        }
      } catch (e) {
        console.error(`Failed to parse data_in for text ${taid}:`, e);
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
}

