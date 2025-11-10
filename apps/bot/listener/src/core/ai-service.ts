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
      return await this.getResult(data.requestId);
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

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.sleep(attempt * 1000); // Exponential backoff: 1s, 2s, 3s...

        let response = await fetch(`${this.apiUrl}/result/${requestId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.apiToken}`
            }
          });

        if (!response.ok) {
          console.error(`Error getting result (attempt ${attempt}):`, response.status);
          continue;
        }

        const data: AIResultResponse = await response.json();

        if (data.status === 'SUCCESS' && data.content) {
          console.log(`✅ AI response received: ${data.requestId}`);
          return data.content;
        }

        if (data.status === 'FAILED' || data.error) {
          console.error(`❌ AI request failed: ${data.error}`);
          throw new Error(data.error || 'AI request failed');
        }

        // Still processing
        console.log(`⏳ Still processing (attempt ${attempt}/${maxAttempts})...`);
      } catch (error) {
        console.error(`Error in getResult attempt ${attempt}:`, error);
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }

    throw new Error('AI request timeout');
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

