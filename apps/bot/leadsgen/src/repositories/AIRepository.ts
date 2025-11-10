import { AIService } from '../integrations/ai-service';

export interface AIRepositoryConfig {
  env: {
    AI_API_URL: string;
    AI_API_TOKEN: string;
    BOT_TOKEN: string;
    TRANSCRIPTION_MODEL?: string;
  };
}

export interface RecentMessage {
  title: string;
  data_in: string;
}

export interface MessageToSummarize {
  title: string;
  data_in: string;
  full_maid: string;
  created_at: string;
}

/**
 * Repository for working with AI API
 */
export class AIRepository {
  private env: {
    AI_API_URL: string;
    AI_API_TOKEN: string;
    BOT_TOKEN: string;
    TRANSCRIPTION_MODEL?: string;
  };

  constructor(config: AIRepositoryConfig) {
    this.env = config.env;
  }

  /**
   * Get AI response for user message
   * @param recentMessages - Array of recent messages from conversation history
   * @param messageText - Current user message text
   * @param prompt - System prompt/instruction
   * @param model - AI model name
   * @param summary - Optional context summary (history summary)
   * @returns AI response string
   */
  async getAIResponse(
    recentMessages: RecentMessage[],
    messageText: string,
    prompt: string,
    model: string,
    summary?: string
  ): Promise<string> {
    // Build contents array for recent conversation history
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    try {
      if (recentMessages && recentMessages.length > 0) {
        // Reverse to get chronological order
        const reversedMessages = recentMessages.reverse();
        
        // Check if last message matches current messageText (to avoid duplication)
        const lastMessage = reversedMessages[reversedMessages.length - 1];
        const lastMessageTitle = lastMessage?.title || '';
        const shouldExcludeLast = lastMessageTitle.trim() === messageText.trim();
        
        // Filter out last message if it matches current messageText
        const messagesToProcess = shouldExcludeLast 
          ? reversedMessages.slice(0, -1)
          : reversedMessages;
        
        // Add recent messages to contents array
        for (const msg of messagesToProcess) {
          const text = (msg.title || '').trim();
          if (!text) continue;
          
          // Parse data_in to determine message direction
          let role = 'user'; // Default to user
          try {
            if (msg.data_in) {
              const dataInObj = JSON.parse(msg.data_in);
              const direction = dataInObj.direction || 'incoming';
              
              // Check if this is AI response
              if (dataInObj.data) {
                try {
                  const dataObj = JSON.parse(dataInObj.data);
                  if (dataObj.isAIResponse) {
                    role = 'model';
                  } else {
                    role = direction === 'outgoing' ? 'model' : 'user';
                  }
                } catch (e) {
                  // If parse fails, use direction
                  role = direction === 'outgoing' ? 'model' : 'user';
                }
              } else {
                role = direction === 'outgoing' ? 'model' : 'user';
              }
            }
          } catch (e) {
            console.warn(`Failed to parse data_in for message, using default role:`, e);
            // Default to 'user' if parsing fails
          }
          
          contents.push({
            role: role,
            parts: [{ text: text }]
          });
        }
      }
    } catch (error) {
      console.error('Error processing recent messages:', error);
      // Continue with empty contents if error
    }

    // Add current user message to contents
    contents.push({
      role: 'user',
      parts: [{ text: messageText }]
    });

    // Build system instruction with prompt and summary (if exists)
    let systemInstructionText = prompt;
    if (summary) {
      systemInstructionText = `${prompt}\n\nCONTEXT_SUMMARY: ${summary}`;
    }

    // Prepare AI input as object with system_instruction and contents
    const aiInput = {
      system_instruction: {
        role: 'system',
        parts: [
          { text: systemInstructionText }
        ]
      },
      contents: contents,
      generationConfig: {
        maxOutputTokens: 2048
      }
    };

    // Get AI API URL and token from env
    const aiApiUrl = this.env.AI_API_URL;
    const aiApiToken = this.env.AI_API_TOKEN;

    // Check if AI token is configured
    if (!aiApiToken) {
      throw new Error('AI_API_TOKEN is not configured');
    }

    // Get AI response with error handling
    console.log(`🤖 Calling AI service with model: ${model}`);
    
    const aiService = new AIService(
      aiApiUrl,
      aiApiToken
    );

    let rawAiResponse = await aiService.ask(model, aiInput);
    console.log(`✅ AI Response received (raw): ${rawAiResponse}`);
    
    // Validate and fix HTML tags in AI response
    const aiResponse = aiService.validateAndFixHTML(rawAiResponse);
    if (rawAiResponse !== aiResponse) {
      console.log(`🔧 AI Response fixed (HTML validation): ${aiResponse}`);
    }

    return aiResponse;
  }

  /**
   * Generate summary for conversation history
   * @param messagesToSummarize - Array of messages to summarize
   * @param model - AI model name
   * @param currentSummaryVersion - Current summary version number
   * @param historySummaryText - Optional previous summary text
   * @returns Generated summary string
   */
  async generateSummary(
    messagesToSummarize: MessageToSummarize[],
    model: string,
    currentSummaryVersion: number,
    historySummaryText?: string
  ): Promise<string> {
    // Build contents array for chat history (alternating user/model roles)
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    
    // Add conversation history
    for (const msg of messagesToSummarize) {
      const text = (msg.title || '').trim();
      if (!text) continue;
      
      // Parse data_in to determine message direction
      let role = 'user'; // Default to user
      try {
        if (msg.data_in) {
          const dataInObj = JSON.parse(msg.data_in);
          const direction = dataInObj.direction || 'incoming';
          
          // Check if this is AI response
          if (dataInObj.data) {
            try {
              const dataObj = JSON.parse(dataInObj.data);
              if (dataObj.isAIResponse) {
                role = 'model';
              } else {
                role = direction === 'outgoing' ? 'model' : 'user';
              }
            } catch (e) {
              // If parse fails, use direction
              role = direction === 'outgoing' ? 'model' : 'user';
            }
          } else {
            role = direction === 'outgoing' ? 'model' : 'user';
          }
        }
      } catch (e) {
        console.warn('Failed to parse data_in for message:', msg.full_maid);
        // Default to 'user' if parsing fails
      }
      
      contents.push({
        role: role,
        parts: [{ text: text }]
      });
    }
    
    // Add summary instruction as the last user message
    let summaryInstruction: string;
    
    if (currentSummaryVersion === 0 || !historySummaryText) {
      // First summary - just summarize the messages
      summaryInstruction = `Summarize the first ${messagesToSummarize.length} messages of the conversation briefly and informatively.\nPreserve facts, agreements, intentions, definitions and terms.\nDo not make up facts. Use neutral tone.\nIMPORTANT: Complete all sentences fully. Do not cut phrases in the middle.`;
    } else {
      // Update existing summary - include previous summary and new messages
      // Build text representation of new messages for instruction
      const newMessagesText = messagesToSummarize
        .map(msg => {
          const text = (msg.title || '').trim();
          if (!text) return '';
          
          // Use same logic as above to determine role
          let role = 'user';
          try {
            if (msg.data_in) {
              const dataInObj = JSON.parse(msg.data_in);
              const direction = dataInObj.direction || 'incoming';
              
              if (dataInObj.data) {
                try {
                  const dataObj = JSON.parse(dataInObj.data);
                  if (dataObj.isAIResponse) {
                    role = 'model';
                  } else {
                    role = direction === 'outgoing' ? 'model' : 'user';
                  }
                } catch (e) {
                  role = direction === 'outgoing' ? 'model' : 'user';
                }
              } else {
                role = direction === 'outgoing' ? 'model' : 'user';
              }
            }
          } catch (e) {
            // Default to user
          }
          
          const prefix = role === 'model' ? 'Assistant' : 'User';
          return `${prefix}: ${text}`;
        })
        .filter(Boolean)
        .join('\n\n');
      
      summaryInstruction = `Summarize the conversation briefly and informatively.\nPreserve facts, agreements, intentions, definitions and terms.\nDo not make up facts. Use neutral tone.\nIMPORTANT: Complete all sentences fully. Do not cut phrases in the middle.\n\nPrevious summary:\n${historySummaryText}\n\nNew ${messagesToSummarize.length} replies to add:\n${newMessagesText}\n\nMerge the previous summary with new replies into one complete summary. Each sentence must be completed.`;
    }
    
    contents.push({
      role: 'user',
      parts: [{ text: summaryInstruction }]
    });
    
    // Create prompt object with contents array
    const summaryPrompt = {
      contents: contents,
      generationConfig: {
        maxOutputTokens: 2048
      }
    };

    // Get AI API URL and token from env
    const aiApiUrl = this.env.AI_API_URL;
    const aiApiToken = this.env.AI_API_TOKEN;

    // Check if AI token is configured
    if (!aiApiToken) {
      throw new Error('AI_API_TOKEN is not configured');
    }

    const aiService = new AIService(aiApiUrl, aiApiToken);
    let newSummaryText = await aiService.ask(model, summaryPrompt);

    // Trim incomplete sentences
    newSummaryText = newSummaryText.trim();
    const lastChar = newSummaryText.slice(-1);
    if (!['.', '!', '?', '\n'].includes(lastChar)) {
      const lastSentenceEnd = Math.max(
        newSummaryText.lastIndexOf('.'),
        newSummaryText.lastIndexOf('!'),
        newSummaryText.lastIndexOf('?'),
        newSummaryText.lastIndexOf('\n')
      );
      if (lastSentenceEnd > 0 && (newSummaryText.length - lastSentenceEnd) < 200) {
        newSummaryText = newSummaryText.substring(0, lastSentenceEnd + 1).trim();
        console.log('⚠️ Trimmed incomplete summary to last complete sentence');
      }
    }

    return newSummaryText;
  }

  /**
   * Transcribe voice message to text
   * @param fileId - Telegram voice file_id
   * @param mimeType - MIME type of the voice file (default: 'audio/ogg')
   * @returns Transcribed text
   */
  async transcribeVoice(fileId: string, mimeType: string = 'audio/ogg'): Promise<string> {
    const botToken = this.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('BOT_TOKEN is not configured');
    }

    // 1) Get file path by file_id
    const getFileResp = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    if (!getFileResp.ok) {
      throw new Error(`getFile failed: ${getFileResp.status}`);
    }
    const getFileJson = await getFileResp.json();
    const filePath = getFileJson?.result?.file_path;
    if (!filePath) {
      throw new Error('file_path not found in getFile response');
    }

    // 2) Download the file
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
    const fileResp = await fetch(fileUrl);
    if (!fileResp.ok) {
      throw new Error(`file download failed: ${fileResp.status}`);
    }
    const arrayBuffer = await fileResp.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: mimeType });

    // 3) Transcribe via AIService.upload
    const aiApiToken = this.env.AI_API_TOKEN;
    if (!aiApiToken) {
      throw new Error('AI_API_TOKEN is not configured');
    }

    const transcriptionModel = this.env.TRANSCRIPTION_MODEL || 'whisper-large-v3';
    
    // Ensure filename has valid extension for API (allowed: flac mp3 mp4 mpeg mpga m4a ogg opus wav webm)
    let filename = filePath.split('/').pop() || 'voice';
    const allowedExtensions = ['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'opus', 'wav', 'webm'];
    const fileExtension = filename.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      // Default to .ogg for Telegram voice messages
      filename = filename.includes('.') 
        ? filename.split('.').slice(0, -1).join('.') + '.ogg'
        : filename + '.ogg';
    }
    
    console.log(`📁 Using filename: ${filename}`);
    console.log(`📝 Transcribing voice using model: ${transcriptionModel}`);

    const aiService = new AIService(
      this.env.AI_API_URL,
      aiApiToken
    );

    const transcript = await aiService.upload(transcriptionModel, blob, filename);
    console.log(`📝 Transcript: ${transcript}`);

    return transcript;
  }
}

