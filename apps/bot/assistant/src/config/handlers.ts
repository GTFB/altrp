import { BotInterface } from '../core/bot-interface';
import { AIService } from '../integrations/ai-service';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { UserContextManager } from '../core/user-context';
import { AIRepository, type RecentMessage } from '../repositories/AIRepository';

interface Consultant {
  id: number;
  entity: string;
  name: string;
  title: string;
}

interface ConsultantSettings {
  prompt?: string;
  model?: string;
  contextLength?: string;
}

interface MessageThread {
  id: number;
  title: string;
  type: string;
  maid: string;
  topicId: number;
}

export const createCustomHandlers = (worker: BotInterface) => {
  const handlerWorker = {
    d1Storage: worker['d1Storage'],
    humanRepository: worker['humanRepository'],
    messageRepository: worker['messageRepository'],
    messageThreadRepository: worker['messageThreadRepository'],
    flowEngine: worker['flowEngine'],
    env: worker['env'],
    messageService: worker['messageService'],
    topicService: worker['topicService']
  };
  
  // Create AI repository (can be created here since we have access to env)
  const aiRepository = new AIRepository({
    env: {
      AI_API_URL: handlerWorker.env.AI_API_URL,
      AI_API_TOKEN: handlerWorker.env.AI_API_TOKEN,
      BOT_TOKEN: handlerWorker.env.BOT_TOKEN,
      TRANSCRIPTION_MODEL: handlerWorker.env.TRANSCRIPTION_MODEL
    }
  });
  
  return {
    /**
     * Handle /start command
     */
    handleStartCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /start command via flow for human ${userId}`);

      // Get or create human in database to get dbHumanId
      let existingHuman = await handlerWorker.humanRepository.getHumanByTelegramId(userId);
      
      if (!existingHuman) {
        // Compose full name from first and last name
        const fullName = [message.from.first_name, message.from.last_name]
          .filter(Boolean)
          .join(' ') || message.from.first_name || 'Unknown';
        
        // Prepare data_in JSON with telegram_id
        const dataIn = JSON.stringify({
          telegram_id: userId,
          first_name: message.from.first_name,
          last_name: message.from.last_name || '',
          username: message.from.username || ''
        });
        
        // Register human minimally to get dbHumanId
        const newHuman = {
          fullName: fullName,
          dataIn: dataIn
        };

        await handlerWorker.humanRepository.addHuman(newHuman);
        console.log(`✅ New human ${userId} registered for start flow`);
        
        // Update human reference
        existingHuman = await handlerWorker.humanRepository.getHumanByTelegramId(userId);
      }

      if (!existingHuman || !existingHuman.id || !existingHuman.haid) {
        console.error(`Cannot start flow: human ${userId} registration failed or missing haid`);
        return;
      }

      // Define three assistants
      const assistants = [
        {
          title: 'Financial Consultant',
          type: 'assistent',
          dataIn: {
            prompt: "You are a financial consultant with 15 years of experience. Provide clear, professional advice on personal finance, investments, budgeting, and financial planning. Always be helpful, ethical, and encourage users to consult certified financial advisors for major decisions. Keep your answers brief and concise. Format your responses using HTML tags for Telegram only from this list: use <b> for bold, <i> for italics, <u> for underscores, <code> for code, and <a href=\"url\"> for links DO NOT use <br> tag. Respond clearly only to the user's message, taking into account the context, without unnecessary auxiliary information.",
            model: "gemini-2.5-flash",
            context_length: 6
          }
        },
        {
          title: 'Nutritionist',
          type: 'assistent',
          dataIn: {
            prompt: "You are a nutritionist and dietitian with extensive knowledge of healthy eating, meal planning, nutritional science, and weight management. Provide evidence-based dietary advice, suggest balanced meal plans, and help users develop healthy eating habits. Always emphasize consultation with healthcare providers for medical conditions. Keep your answers brief and concise. Format your responses using HTML tags for Telegram only from this list: use <b> for bold, <i> for italics, <u> for underscores, <code> for code, and <a href=\"url\"> for links DO NOT use <br> tag. Respond clearly only to the user's message, taking into account the context, without unnecessary auxiliary information.",
            model: "gemini-2.5-flash",
            context_length: 6
          }
        },
        {
          title: 'Legal Advisor',
          type: 'assistent',
          dataIn: {
            prompt: "You are a legal advisor providing general legal information and guidance. Help users understand legal concepts, rights, and obligations. Always clarify that your advice is informational only and encourage users to consult licensed attorneys for specific legal representation. Keep your answers brief and concise. Format your responses using HTML tags for Telegram only from this list: use <b> for bold, <i> for italics, <u> for underscores, <code> for code, and <a href=\"url\"> for links DO NOT use <br> tag. Respond clearly only to the user's message, taking into account the context, without unnecessary auxiliary information.",
            model: "gemini-2.5-flash",
            context_length: 6
          }
        }
      ];

      // Check if assistants already exist for this user
      const existingThreads = await handlerWorker.messageThreadRepository.getMessageThreadsByXaidAndType(
        existingHuman.haid,
        'assistent'
      );

      // Create assistants if they don't exist
      if (existingThreads.length < assistants.length) {
        console.log(`Creating ${assistants.length - existingThreads.length} assistant(s) for user ${userId}`);
        
        for (const assistant of assistants) {
          // Check if this assistant already exists
          const existingAssistant = existingThreads.find(
            thread => thread.title === assistant.title
          );
          
          if (existingAssistant) {
            console.log(`Assistant "${assistant.title}" already exists for user ${userId}`);
            continue;
          }

          // Create topic in Telegram
          const topicId = await handlerWorker.topicService.createTopic(assistant.title);
          
          if (!topicId) {
            console.error(`Failed to create topic for assistant "${assistant.title}"`);
            continue;
          }

          // Create message_thread entry
          try {
            await handlerWorker.messageThreadRepository.addMessageThread({
              value: topicId.toString(),
              dataIn: JSON.stringify(assistant.dataIn),
              xaid: existingHuman.haid,
              statusName: 'active',
              type: assistant.type,
              title: assistant.title,
              order: assistants.indexOf(assistant)
            });
            
            console.log(`✅ Assistant "${assistant.title}" created with topic ${topicId}`);
          } catch (error) {
            console.error(`Error creating message thread for assistant "${assistant.title}":`, error);
          }
        }
      } else {
        console.log(`All assistants already exist for user ${userId}`);
      }

      // Get or create human context
      // await bot.userContextManager.getOrCreateContext(userId, existingHuman.id);
      
      // // Save info about the current message for handlers
      // await bot.userContextManager.setVariable(userId, '_system.currentMessage', message);

    },


    /**
     * Handle messages for AI assistant in topic
     */
    handleAssistantTopicMessage: async (message: any) => {
      try {
        // Get ADMIN_CHAT_ID from env
        const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID || '');
        if (!adminChatId) {
          console.error('ADMIN_CHAT_ID is not configured!');
          return;
        }

        // Extract topicId from message (message came from topic)
        const topicId = (message as any).message_thread_id;
        if (!topicId) {
          console.log('No topic ID in message');
          return;
        }

        const userId = message.from.id;
        console.log(`💬 Processing assistant message from user ${userId} in topic ${topicId}`);

        // Get message_thread (assistant) by topicId and type 'assistent'
        const assistant = await handlerWorker.messageThreadRepository.getMessageThreadByValue(
          topicId.toString(),
          'assistent'
        );

        if (!assistant) {
          console.log(`No assistant found for topic ${topicId}`);
          return;
        }

        // Get human by xaid from assistant
        if (!assistant.xaid) {
          console.error(`Assistant ${assistant.maid} has no xaid`);
          return;
        }

        const human = await handlerWorker.humanRepository.getHumanByHaid(assistant.xaid);
        if (!human || !human.id) {
          console.error(`❌ Human not found for assistant ${assistant.maid}`);
          return;
        }

        // Save user message to database directly using d1Storage
        if (message.text && human.id) {
          try {
            const uuid = generateUuidV4();
            const fullMaid = generateAid('m');
            const dataIn = JSON.stringify({
              messageType: 'user_text',
              direction: 'incoming',
              telegramMessageId: message.message_id,
              topicId: topicId,
              createdAt: new Date().toISOString()
            });

            await handlerWorker.d1Storage.execute(`
              INSERT INTO messages (
                uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in, xaid
              ) VALUES (?, ?, ?, ?, ?, 0, ?, '', ?, ?)
            `, [
              uuid,
              assistant.maid, // Use assistant maid directly
              fullMaid,
              message.text,
              'text',
              null, // gin
              dataIn,
              human.haid
            ]);
            console.log(`✅ User message saved to database`);
          } catch (saveError) {
            console.error('❌ Error saving user message:', saveError);
            // Continue execution even if save fails
          }
        }

        // Check if message is voice -> transcribe and continue as text
        if (message.voice) {
          console.log(`🎤 Voice message detected in topic ${topicId}`);
          try {
            const mimeType = (message.voice.mime_type as string) || 'audio/ogg';
            const transcript = await aiRepository.transcribeVoice(message.voice.file_id, mimeType);
            
            // Save transcribed voice message to database directly using d1Storage
            if (human.id && transcript) {
              try {
                const uuid = generateUuidV4();
                const fullMaid = generateAid('m');
                const dataIn = JSON.stringify({
                  messageType: 'user_text',
                  direction: 'incoming',
                  telegramMessageId: message.message_id,
                  topicId: topicId,
                  fileId: message.voice.file_id,
                  mimeType: mimeType,
                  isTranscribed: true,
                  originalType: 'voice',
                  createdAt: new Date().toISOString()
                });

                await handlerWorker.d1Storage.execute(`
                  INSERT INTO messages (
                    uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in, xaid
                  ) VALUES (?, ?, ?, ?, ?, 0, ?, '', ?, ?)
                `, [
                  uuid,
                  assistant.maid, // Use assistant maid directly
                  fullMaid,
                  transcript,
                  'text',
                  null, // gin
                  dataIn,
                  human.haid
                ]);
                console.log(`✅ Transcribed voice message saved to database`);
              } catch (saveError) {
                console.error('❌ Error saving transcribed voice message:', saveError);
                // Continue execution even if save fails
              }
            }
            
            // Put transcript into message.text and continue normal text flow
            message.text = transcript || '';
          } catch (e) {
            console.error('❌ Voice transcription failed:', e);
            await handlerWorker.messageService.sendMessageToTopic(
              adminChatId,
              topicId,
              'Voice recognition failed. Please send the text or try again.'
            );
            return;
          }
        }

        // Check if message has no text
        if (!message.text) {
          console.log(`📭 No text in message in topic ${topicId}`);
          return;
        }

        const messageText = message.text;
        console.log(`💬 Handling AI answer to user message: ${messageText}`);

        const assistantMaid = assistant.maid;
        const assistantTitle = assistant.title || '';

        console.log(`Found assistant: ${assistantTitle} (${assistantMaid})`);

        // Get assistant settings from data_in (JSON)
        // All settings must be present in data_in - no fallback values
        let prompt: string | null = null;
        let model: string | null = null;
        let contextLength: number | null = null;
        let settingsJson: any = {};
        let historySummaryText: string = '';
        let historySummaryUpdatedAt: string | null = null;
        let historySummaryLastFullMaid: string | null = null;

        if (!assistant.dataIn) {
          console.error(`No data_in found for assistant ${assistantMaid}`);
          await handlerWorker.messageService.sendMessageToTopic(
            adminChatId,
            topicId,
            '❌ Assistant configuration error: settings not found.'
          );
          return;
        }

        try {
          settingsJson = JSON.parse(assistant.dataIn);
          
          // Get required settings from data_in - all are mandatory
          prompt = settingsJson.prompt;
          model = settingsJson.model;
          contextLength = settingsJson.context_length;
          
          // Validate required fields
          if (!prompt || !model || !contextLength) {
            console.error(`Missing required settings in data_in for assistant ${assistantMaid}:`, {
              prompt: !!prompt,
              model: !!model,
              context_length: !!contextLength
            });
            await handlerWorker.messageService.sendMessageToTopic(
              adminChatId,
              topicId,
              '❌ Assistant configuration error: missing required settings (prompt, model, or context_length).'
            );
            return;
          }

          // Get existing summary if any
          if (settingsJson.history_summary && settingsJson.history_summary.text) {
            historySummaryText = settingsJson.history_summary.text as string;
          }
          historySummaryUpdatedAt = settingsJson.history_summary_updated_at || null;
          historySummaryLastFullMaid = settingsJson.history_summary_last_full_maid || null;
        } catch (error) {
          console.error('Error parsing assistant settings:', error);
          await handlerWorker.messageService.sendMessageToTopic(
            adminChatId,
            topicId,
            '❌ Assistant configuration error: invalid JSON in settings.'
          );
          return;
        }

        // At this point all values are guaranteed to be non-null after validation above
        const validatedPrompt = prompt as string;
        const validatedModel = model as string;
        const validatedContextLength = contextLength as number;

        console.log(`Consultant config: model=${validatedModel}, contextLength=${validatedContextLength}`);

        // New algorithm: summary every context_length messages, answer = last context_length messages + summary
        // Use context_length from settings.data_in
        const MESSAGES_FOR_SUMMARY = validatedContextLength;
        const MESSAGES_FOR_ANSWER = validatedContextLength;

        // Get last context_length messages for answer
        console.log('Selecting messages:', assistantMaid, human.haid, MESSAGES_FOR_ANSWER)

        let recentMessages: RecentMessage[] = [];
        try {
          const messages = await handlerWorker.messageRepository.getRecentMessages(
            assistantMaid,
            human.haid,
            'text',
            MESSAGES_FOR_ANSWER
          );
          recentMessages = messages.map(msg => ({
            title: msg.title,
            data_in: msg.data_in
          }));
        } catch (error) {
          console.error('Error getting recent messages:', error);
          // Continue with empty array if error
        }

        // Get AI response using AIRepository
        let aiResponse: string;
        
        try {
          aiResponse = await aiRepository.getAIResponse(
            recentMessages,
            messageText,
            validatedPrompt,
            validatedModel,
            historySummaryText || undefined
          );
        } catch (error) {
          console.error('❌ Error calling AI service:', error);
          console.error('Error details:', error?.message, error?.stack);
          
          // Send error message to topic
          const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again later.';
          try {
            await handlerWorker.messageService.sendMessageToTopic(
              adminChatId,
              topicId,
              errorMessage
            );
            console.log(`⚠️ Error message sent to topic ${topicId}`);
          } catch (sendError) {
            console.error('❌ Failed to send error message to topic:', sendError);
          }
          
          // Exit early - user message is already saved, but AI response is not
          // This preserves message count consistency (no partial saves)
          return;
        }

        // Save AI response to database directly using d1Storage
        try {
          const uuid = generateUuidV4();
          const fullMaid = generateAid('m');
          const dataIn = JSON.stringify({ 
            messageType: 'bot_text',
            direction: 'outgoing',
            assistant: assistantMaid, 
            response: aiResponse, 
            isAIResponse: true,
            topicId: topicId,
            createdAt: new Date().toISOString() 
          });

          await handlerWorker.d1Storage.execute(`
            INSERT INTO messages (
              uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in, xaid
            ) VALUES (?, ?, ?, ?, ?, 0, ?, '', ?, ?)
          `, [
            uuid,
            assistantMaid, // Use assistant maid directly
            fullMaid,
            aiResponse,
            'text',
            null, // gin
            dataIn,
            human.haid
          ]);
          console.log(`✅ AI message saved (linked to assistant ${assistantMaid})`);
        } catch (error) {
          console.error('❌ Error saving AI response to database:', error);
          // Continue execution to send response even if DB save fails
        }

        // Send AI response to topic only
        try {
          console.log(`📤 Sending AI response to topic ${topicId}`);
          await handlerWorker.messageService.sendMessageToTopic(
            adminChatId,
            topicId,
            aiResponse
          );

          console.log(`✅ AI response sent to topic ${topicId}`);
        } catch (error) {
          console.error('❌ Error sending AI response to topic:', error);
          // Don't return here - summary check should still happen
        }

        // ================== CREATE / UPDATE SUMMARY ==================
        try {
          console.log('Start summarization logic...');

          const MAX_MESSAGES_FOR_SUMMARY = 10; // can change
          const allMessages = await handlerWorker.messageRepository.getAllMessagesByMaid(
            assistantMaid,
            human.haid,
            'text'
          );

          const totalMessages = allMessages.length;
          const contextLength = validatedContextLength;
          const currentSummaryVersion = settingsJson.summary_version || 0;
          const latestSummaryVersion = Math.floor(totalMessages / contextLength);

          if (latestSummaryVersion <= currentSummaryVersion) {
            console.log('⛔️ No new messages for Summary, skip it.');
            return;
          }

          // Calculating the message range for summary
          let startIndex = currentSummaryVersion * contextLength;
          let endIndex = latestSummaryVersion * contextLength;

          // Limiting the batch of recent messages to MAX_MESSAGES_FOR_SUMMARY
          if (endIndex - startIndex > MAX_MESSAGES_FOR_SUMMARY) {
            startIndex = endIndex - MAX_MESSAGES_FOR_SUMMARY;
          }

          const messagesToSummarize = allMessages
            .slice(startIndex, endIndex)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

          if (messagesToSummarize.length === 0) {
            console.log('⛔️ There are no messages to create summary after filtering');
            return;
          }

          // Generate summary using AIRepository
          const newSummaryText = await aiRepository.generateSummary(
            messagesToSummarize,
            validatedModel,
            currentSummaryVersion,
            historySummaryText || undefined
          );

          // Last batch message
          const lastMessage = messagesToSummarize[messagesToSummarize.length - 1];
          const lastMessageFullMaid = lastMessage?.full_maid || null;

          // Updating settingsJson
          settingsJson.history_summary = { text: newSummaryText, version: latestSummaryVersion };
          settingsJson.history_summary_last_full_maid = lastMessageFullMaid;
          settingsJson.summary_version = latestSummaryVersion;
          settingsJson.history_summary_updated_at = new Date().toISOString();

          // Update message thread using repository
          if (!assistant.id) {
            throw new Error('Assistant id is missing');
          }
          await handlerWorker.messageThreadRepository.updateMessageThread(assistant.id, {
            dataIn: JSON.stringify(settingsJson)
          });

          console.log(`✅ Summary updated to version ${latestSummaryVersion}`);
        } catch (error) {
          console.error('❌ Error creating summary after AI response:', error);
        }

        
      } catch (error) {
        console.error('❌ Error in handleAssistantTopicMessage:', error);
        console.error('Error details:', error?.message, error?.stack);
      }
    },

  };
};

