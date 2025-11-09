// AI Service for consultant bot
// Handles asynchronous AI requests
import type { Service } from '@cloudflare/workers-types';

interface AIAskRequest {
  model: string;
  input: string;
}

interface AIAskResponse {
  requestId: string;
  model?: string;
  content?: string;
}

interface AIResultResponse {
  requestId: string;
  status: string;
  provider?: string;
  model?: string;
  cost?: number;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
  createdAt?: string;
  content?: string;
  error?: string | null;
}

export class AIService {
  private apiUrl: string;
  private apiToken: string;
  //private apiGateway: Service | null;

  //constructor(apiUrl: string, apiToken: string, apiGateway: Service | null = null) {
  constructor(apiUrl: string, apiToken: string) {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
    //this.apiGateway = apiGateway;
  }

  /**
   * Send a request to AI API
   */
  async ask(model: string, prompt: string): Promise<string> {
    try {
      const requestBody = {
        model,
        input: prompt
      };
      
      console.log(`AI Request: model=${model}, token=${this.apiToken ? 'SET' : 'MISSING'}`);
      console.log(`AI Request body:`, JSON.stringify(requestBody));
      
      // Create headers exactly like in Postman example
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Authorization', `Bearer ${this.apiToken}`);
      
      const raw = JSON.stringify(requestBody);

      const url = `${this.apiUrl}/ask`;

      const response = await fetch(url, {
          method: 'POST',
          headers: headers,
          body: raw,
          redirect: 'follow'
        });

      console.log(`AI Response status: ${response.status}, statusText: ${response.statusText}`);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('Error response text:', errorText);
        } catch (e) {
          console.error('Error reading response text:', e);
          errorText = `Unable to read error: ${e}`;
        }
        
        console.error('Error in AI ask - full details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          headers: JSON.stringify(Array.from(response.headers.entries()))
        });
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data: AIAskResponse = await response.json();

      // If response is cached, return it immediately
      if (data.content) {
        console.log(`✅ AI response (cached): ${data.requestId}`);
        return data.content;
      }

      // Otherwise, poll for result
      console.log(`⏳ Waiting for AI response: ${data.requestId}`);
      try {
        return await this.getResult(data.requestId);
      } catch (error) {
        // If getResult failed with FAILED status or error, retry once
        //if (error instanceof Error && (error.message.includes('AI request failed') || error.message.includes('FAILED'))) {
          console.log(`🔄 Retrying AI request after failure...`);
          
          // Make a new request to get a new requestId
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: raw,
            redirect: 'follow'
          });

          if (!retryResponse.ok) {
            let errorText = '';
            try {
              errorText = await retryResponse.text();
              console.log('Retry error response text:', errorText);
            } catch (e) {
              console.error('Error reading retry response text:', e);
              errorText = `Unable to read error: ${e}`;
            }
            throw new Error(`AI API error on retry: ${retryResponse.status} - ${errorText}`);
          }

          const retryData: AIAskResponse = await retryResponse.json();

          // If response is cached, return it immediately
          if (retryData.content) {
            console.log(`✅ AI response (cached on retry): ${retryData.requestId}`);
            return retryData.content;
          }

          // Poll for result with new requestId
          console.log(`⏳ Waiting for AI response (retry): ${retryData.requestId}`);
          return await this.getResult(retryData.requestId);
        //}
        // If it's a different error, re-throw it
        //throw error;
      }
    } catch (error) {
      console.error('Error in AI service ask:', error);
      throw error;
    }
  }

  /**
   * Upload a file (voice) for transcription
   * Returns transcribed text (polls by requestId if needed)
   */
  async upload(model: string, file: Blob, filename: string): Promise<string> {
    try {
      console.log(`AI Upload: model=${model}, token=${this.apiToken ? 'SET' : 'MISSING'}, filename=${filename}`);

      // Build multipart form-data; do NOT set Content-Type manually (boundary is auto-set)
      const formData = new FormData();
      formData.append('file', file, filename);
      formData.append('model', model);

      const headers = new Headers();
      headers.append('Authorization', `Bearer ${this.apiToken}`);

      const url = `${this.apiUrl}/upload`;

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData
      });

      console.log(`AI Upload response status: ${response.status}, statusText: ${response.statusText}`);

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.log('Upload error response text:', errorText);
        } catch (e) {
          console.error('Error reading upload response text:', e);
          errorText = `Unable to read error: ${e}`;
        }
        throw new Error(`AI upload error: ${response.status} - ${errorText}`);
      }

      const data: AIAskResponse = await response.json();

      if (data.content) {
        console.log(`✅ AI upload response (cached): ${data.requestId}`);
        return data.content;
      }

      console.log(`⏳ Waiting for AI upload result: ${data.requestId}`);
      return await this.getResult(data.requestId);
    } catch (error) {
      console.error('Error in AI service upload:', error);
      throw error;
    }
  }

  /**
   * Poll for AI result by requestId
   * Retries with exponential backoff
   */
  private async getResult(requestId: string, maxAttempts: number = 10): Promise<string> {

    const url = this.apiUrl
    let failedError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        //await this.sleep(attempt * 1000); // Exponential backoff: 1s, 2s, 3s...
        await this.sleep(1000); // Exponential backoff: 1s, 2s, 3s...

        let response = await fetch(`${this.apiUrl}/result/${requestId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`
            }
          });

        if (!response.ok) {
          console.error(`Error getting result (attempt ${attempt}):`, response.status);
          // Read or cancel response body to avoid Cloudflare warning about stalled HTTP responses
          try {
            await response.text(); // Read body to avoid stalled response warning
          } catch (e) {
            // If reading fails, try to cancel
            try {
              response.body?.cancel();
            } catch (cancelError) {
              // Ignore cancel errors
            }
          }
          continue;
        }

        const data: AIResultResponse = await response.json();

        if (data.status === 'SUCCESS' && data.content) {
          console.log(`✅ AI response received: ${data.requestId}`);
          return data.content;
        }

        if (data.status === 'FAILED' || data.error) {
          console.error(`❌ AI request failed: ${data.error}`);
          // Stop the loop immediately
          failedError = new Error(data.error || 'AI request failed');
          break; // Explicitly stop the loop
        }

        // Still processing
        console.log(`⏳ Still processing (attempt ${attempt}/${maxAttempts})...`);
      } catch (error) {
        console.error(`Error in getResult attempt ${attempt}:`, error);
        // For other errors, continue retrying
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }

    // If we stopped the loop due to FAILED status, throw the error
    if (failedError) {
      throw failedError;
    }

    throw new Error('AI request timeout');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validates and fixes HTML tags in AI response
   * Removes unclosed opening tags and orphaned closing tags
   * Supports Telegram HTML tags: <b>, <i>, <u>, <code>, <a href="...">
   */
  validateAndFixHTML(html: string): string {
    // Allowed Telegram HTML tags
    const allowedTags = ['b', 'i', 'u', 'code', 'a'];
    
    // Find all tags with their positions and types
    interface TagInfo {
      type: 'open' | 'close';
      tag: string;
      fullTag: string;
      position: number;
    }
    
    const tags: TagInfo[] = [];
    const tagRegex = /<\/?(\w+)(?:\s+[^>]*)?>/g;
    let match;
    
    while ((match = tagRegex.exec(html)) !== null) {
      const tagName = match[1].toLowerCase();
      if (allowedTags.includes(tagName)) {
        tags.push({
          type: match[0].startsWith('</') ? 'close' : 'open',
          tag: tagName,
          fullTag: match[0],
          position: match.index
        });
      }
    }
    
    // Determine which tags to keep using stack
    const keepTags = new Set<number>();
    const openTagsStack: Array<{ tag: string; index: number }> = [];
    
    // First pass: match closing tags with opening tags
    for (let i = 0; i < tags.length; i++) {
      const tagInfo = tags[i];
      
      if (tagInfo.type === 'open') {
        openTagsStack.push({ tag: tagInfo.tag, index: i });
        keepTags.add(i); // Tentatively keep opening tags
      } else {
        // Closing tag - find matching opening tag
        let found = false;
        for (let j = openTagsStack.length - 1; j >= 0; j--) {
          if (openTagsStack[j].tag === tagInfo.tag) {
            // Found matching opening tag
            keepTags.add(i); // Keep this closing tag
            openTagsStack.splice(j, 1); // Remove from stack
            found = true;
            break;
          }
        }
        if (!found) {
          // Orphaned closing tag - don't keep it
          console.log(`⚠️ Removing orphaned closing tag: ${tagInfo.fullTag}`);
        }
      }
    }
    
    // Remove unclosed opening tags (those still in stack)
    for (const { index } of openTagsStack) {
      console.log(`⚠️ Removing unclosed opening tag: ${tags[index].fullTag}`);
      keepTags.delete(index);
    }
    
    // Build result string by reconstructing with only kept tags
    const result: string[] = [];
    let lastPos = 0;
    
    // Process tags in order of appearance
    for (let i = 0; i < tags.length; i++) {
      const tagInfo = tags[i];
      
      if (keepTags.has(i)) {
        // Add text before this tag (from lastPos to current tag position)
        result.push(html.substring(lastPos, tagInfo.position));
        // Add the tag
        result.push(tagInfo.fullTag);
        lastPos = tagInfo.position + tagInfo.fullTag.length;
      } else {
        // Tag is being removed - add text up to this tag, but skip the tag itself
        result.push(html.substring(lastPos, tagInfo.position));
        lastPos = tagInfo.position + tagInfo.fullTag.length;
      }
    }
    
    // Add remaining text after last tag
    result.push(html.substring(lastPos));
    
    return result.join('');
  }
}

