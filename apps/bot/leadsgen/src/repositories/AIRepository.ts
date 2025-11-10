import { AIService } from '../integrations/ai-service';

export interface AIRepositoryConfig {
  env: {
    AI_API_URL: string;
    AI_API_TOKEN: string;
  };
}

export interface RecentMessage {
  title: string;
  data_in: string;
}

/**
 * Repository for working with AI API
 */
export class AIRepository {
  private env: {
    AI_API_URL: string;
    AI_API_TOKEN: string;
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
}

