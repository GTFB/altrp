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
        // Create topic in admin group for new human
        const topicId = await handlerWorker.topicService.createTopicInAdminGroup(userId, message.from);
        
        // Compose full name from first and last name
        const fullName = [message.from.first_name, message.from.last_name]
          .filter(Boolean)
          .join(' ') || message.from.first_name || 'Unknown';
        
        // Prepare data_in JSON with telegram_id and topic_id
        const dataIn = JSON.stringify({
          telegram_id: userId,
          topic_id: topicId || 0,
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
      
        // Create message_threads entry if topic was created and human has haid
        if (topicId && existingHuman && existingHuman.haid) {
          const topicName = fullName;
          const threadDataIn = JSON.stringify({
            prompt: "You are a technical support assistant providing troubleshooting help and technical guidance. Help users resolve technical issues, understand software functionality, and navigate system features. Always clarify that your assistance is for general troubleshooting and encourage users to contact official support channels for complex issues, account problems, or security concerns. Keep your answers brief and concise. Format your responses using HTML tags for Telegram only from this list: use <b> for bold, <i> for italics, <u> for underscores, <code> for code, and <a href=\"url\"> for links DO NOT use <br> tag. Respond clearly only to the user's message, taking into account the context, without unnecessary auxiliary information.",
            model: "gemini-2.5-flash",
            context_length: 6
          });
          
          await handlerWorker.messageThreadRepository.addMessageThread({
            value: topicId.toString(),
            dataIn: threadDataIn,
            xaid: existingHuman.haid,
            statusName: 'active',
            type: 'leadsgen',
            title: topicName
          });
          
          console.log(`✅ Message thread created for topic ${topicId}`);
        }
      }

      if (!existingHuman || !existingHuman.id) {
        console.error(`Cannot start flow: human ${userId} registration failed`);
        return;
      }

      // Get or create human context
      await bot.userContextManager.getOrCreateContext(userId, existingHuman.id);
      
      // Save info about the current message for handlers
      await bot.userContextManager.setVariable(userId, '_system.currentMessage', message);

      // Start registration flow
      await handlerWorker.flowEngine.startFlow(userId, 'onboarding');

      console.log(`✅ Start flow launched for human ${userId}`);
    },


    /**
     * Handle messages for AI assistant
     */
    handleAssistantTopicMessage: async (message: any) => {
      try {
        // Get ADMIN_CHAT_ID from env
        const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID || '');
        if (!adminChatId) {
          console.error('ADMIN_CHAT_ID is not configured!');
        return;
      }

      // Extract chatId from message
      const chatId = message.chat.id;
      const messageFromId = message.from.id;

      // if (!topicId) {
      //   console.log('No topic ID in message');
      //   return;
      // }

      // Get human first to extract topic_id (needed for voice transcription error handling)
      const human = await handlerWorker.humanRepository.getHumanByTelegramId(chatId);
      if (!human || !human.dataIn) {
        console.error(`❌ Human ${chatId} not found or has no dataIn`);
        await handlerWorker.messageService.sendMessage(
          chatId,
          '❌ Human not found or has no configuration.'
        );
        return;
      }

      // Extract topic_id from human.dataIn
      let humanTopicId: number | null = null;
      try {
        const dataInObj = JSON.parse(human.dataIn);
        humanTopicId = dataInObj.topic_id;

      } catch (e) {
        console.error(`Failed to parse human.dataIn for human ${chatId}:`, e);
        await handlerWorker.messageService.sendMessage(
          chatId,
          '❌ Error parsing human configuration.'
        );
        return;
      }

      if (!humanTopicId) {
        console.error(`❌ No topic_id found for human ${chatId}`);
        await handlerWorker.messageService.sendMessage(
          chatId,
          '❌ Topic ID not found for this human.'
        );
        return;
      }

      // Check if message is voice -> transcribe and continue as text
      if (message.voice) {
        console.log(`🎤 Voice message detected in topic ${humanTopicId}`);
        try {
          const mimeType = (message.voice.mime_type as string) || 'audio/ogg';
          const transcript = await aiRepository.transcribeVoice(message.voice.file_id, mimeType);
          
          // Save transcribed voice message to database
          if (human.id && transcript) {
            try {
              await handlerWorker.messageRepository.addMessage({
                humanId: human.id,
                messageType: 'user_text',
                direction: 'incoming',
                content: transcript,
                telegramMessageId: message.message_id,
                statusName: 'text',
                data: JSON.stringify({
                  fileId: message.voice.file_id,
                  mimeType: mimeType,
                  isTranscribed: true,
                  originalType: 'voice',
                  createdAt: new Date().toISOString()
                })
              });
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
            humanTopicId,
            'Voice recognition failed. Please send the text or try again.'
          );
          return;
        }
      }

      // Check if message has no text
      if (!message.text) {
        console.log(`📭 No text in message in topic ${humanTopicId}`);
        await handlerWorker.messageService.sendMessage(
          chatId,
          'Send a text or voice message.'
        );
        return;
      }

      const messageText = message.text;
      console.log(`💬 Handling AI answer to human message: ${messageText}`);

      // Get consultant (message_thread) from message_threads by topic_id
      // human and humanTopicId already retrieved above
      const consultant = await handlerWorker.messageThreadRepository.getMessageThreadByValue(
        humanTopicId.toString(),
        'leadsgen'
      );

      if (!consultant) {
        console.log(`No consultant found`);
        return;
      }

      const consultantMaid = consultant.maid;
      const consultantTitle = consultant.title || '';

      console.log(`Found consultant: ${consultantTitle} (${consultantMaid})`);

      // Get consultant settings from data_in (JSON)
      // All settings must be present in data_in - no fallback values
      let prompt: string | null = null;
      let model: string | null = null;
      let contextLength: number | null = null;
      let settingsJson: any = {};
      let historySummaryText: string = '';
      let historySummaryUpdatedAt: string | null = null;
      let historySummaryLastFullMaid: string | null = null;

      if (!consultant.dataIn) {
        console.error(`No data_in found for consultant ${consultantMaid}`);
        await handlerWorker.messageService.sendMessage(
          adminChatId,
          '❌ Consultant configuration error: settings not found.'
        );
        return;
      }

      try {
        settingsJson = JSON.parse(consultant.dataIn);
        
        // Get required settings from data_in - all are mandatory
        prompt = settingsJson.prompt;
        model = settingsJson.model;
        contextLength = settingsJson.context_length;
        
        // Validate required fields
        if (!prompt || !model || !contextLength) {
          console.error(`Missing required settings in data_in for consultant ${consultantMaid}:`, {
            prompt: !!prompt,
            model: !!model,
            context_length: !!contextLength
          });
          await handlerWorker.messageService.sendMessage(
            adminChatId,
            '❌ Consultant configuration error: missing required settings (prompt, model, or context_length).'
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
        console.error('Error parsing consultant settings:', error);
        await handlerWorker.messageService.sendMessage(
          adminChatId,
          '❌ Consultant configuration error: invalid JSON in settings.'
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
      console.log('Selecting messages:', consultantMaid, human.haid, MESSAGES_FOR_ANSWER)

      let recentMessages: RecentMessage[] = [];
      try {
        const messages = await handlerWorker.messageRepository.getRecentMessages(
          consultantMaid,
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
        
        // Send error message to user
        const errorMessage = 'Sorry, I encountered an error while processing your request. Please try again later.';
        try {
          await handlerWorker.messageService.sendMessage(
            chatId,
            errorMessage
          );
          console.log(`⚠️ Error message sent to human ${chatId}`);
        } catch (sendError) {
          console.error('❌ Failed to send error message to topic:', sendError);
        }
        
        // Exit early - user message is already saved, but AI response is not
        // This preserves message count consistency (no partial saves)
        return;
      }

      // Save AI response to database using MessageRepository
      // Use consultantMaid in maid field to link messages with message_threads
      try {
        if (!human.id) {
          throw new Error(`Human ${chatId} has no id`);
        }

        await handlerWorker.messageRepository.addMessage({
          humanId: human.id,
          messageType: 'bot_text',
          direction: 'outgoing',
          content: aiResponse,
          statusName: 'text',
          data: JSON.stringify({ 
            consultant: consultantMaid, 
            response: aiResponse, 
            isAIResponse: true,
            createdAt: new Date().toISOString() 
          })
        });
        console.log(`✅ AI message saved (linked to consultant ${consultantMaid})`);
      } catch (error) {
        console.error('❌ Error saving AI response to database:', error);
        // Continue execution to send response even if DB save fails
      }

      // Send AI response to topic
      //TO DO disable logging this messages
      try {
        console.log(`📤 Sending AI response to topic ${humanTopicId}`);
        await handlerWorker.messageService.sendMessage(
          chatId,
          aiResponse
        );

        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          humanTopicId,
          `🤖 <b>AI</b>

${aiResponse}`
        );

        console.log(`✅ Message sent to human ${chatId}`);
      } catch (error) {
        console.error('❌ Error sending AI response to topic:', error);
        // Don't return here - summary check should still happen
      }

      // ================== CREATE / UPDATE SUMMARY ==================
      try {
        console.log('Start summarization logic...');

        const MAX_MESSAGES_FOR_SUMMARY = 10; // can change
        const allMessages = await handlerWorker.messageRepository.getAllMessagesByMaid(
          consultantMaid,
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
        if (!consultant.id) {
          throw new Error('Consultant id is missing');
        }
        await handlerWorker.messageThreadRepository.updateMessageThread(consultant.id, {
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

