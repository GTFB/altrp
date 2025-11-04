import { BotInterface } from '../core/bot-interface';
import { AIService } from '../core/ai-service';
import { generateUuidV4, generateAid, generateFullId } from '../core/helpers';

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
    flowEngine: worker['flowEngine'],
    env: worker['env'],
    messageService: worker['messageService'],
    topicService: worker['topicService']
  };
  
  return {
    /**
     * Handle /start command - initialize consultants
     */
    handleStartCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /start command via flow for human ${userId}`);

      // Get or create human in database to get dbHumanId
      let existingHuman = await handlerWorker.d1Storage.getHumanByTelegramId(userId);
      
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

        await handlerWorker.d1Storage.addHuman(newHuman);
        console.log(`✅ New human ${userId} registered for start flow`);
        
        // Update human reference
        existingHuman = await handlerWorker.d1Storage.getHumanByTelegramId(userId);
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


    handleEnableAICommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;
      const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);

      // Check if command is executed in admin group
      if (chatId !== adminChatId) {
        console.log(`/enable_ai command ignored - not in admin group`);
        return;
      }

      // Check if command is executed in a topic
      const topicId = (message as any).message_thread_id;
      if (!topicId) {
        console.log(`/enable_ai command ignored - not in a topic`);
        return;
      }

      console.log(`🚀 Handling /enable_ai command in topic ${topicId}`);

      try {
        // Find human by topic_id
        const humanTelegramId = await handlerWorker.d1Storage.getHumanTelegramIdByTopic(topicId);
        
        if (!humanTelegramId) {
          console.error(`❌ Human not found for topic ${topicId}`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found for this topic.');
          return;
        }

        // Get human to access current data_in
        const human = await handlerWorker.d1Storage.getHumanByTelegramId(humanTelegramId);
        
        if (!human) {
          console.error(`❌ Human ${humanTelegramId} not found in database`);
          return;
        }

        // Parse existing data_in and add ai_enabled: true
        let dataInObj: any = {};
        if (human.dataIn) {
          try {
            dataInObj = JSON.parse(human.dataIn);
          } catch (e) {
            console.warn(`Failed to parse existing data_in for human ${humanTelegramId}, using empty object`);
          }
        }

        // Ensure telegram_id and topic_id are preserved
        if (!dataInObj.telegram_id) {
          dataInObj.telegram_id = humanTelegramId;
        }
        if (!dataInObj.topic_id) {
          dataInObj.topic_id = topicId;
        }

        // Set ai_enabled to true
        dataInObj.ai_enabled = true;

        // Update data_in
        await handlerWorker.d1Storage.updateHumanDataIn(humanTelegramId, JSON.stringify(dataInObj));

        console.log(`✅ AI enabled for human ${humanTelegramId} in topic ${topicId}`);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '✅ AI enabled.');
      } catch (error) {
        console.error(`❌ Error enabling AI for topic ${topicId}:`, error);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '❌ Error when enabling AI.');
      }
    },


    handleDisableAICommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;
      const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);

      // Check if command is executed in admin group
      if (chatId !== adminChatId) {
        console.log(`/disable_ai command ignored - not in admin group`);
        return;
      }

      // Check if command is executed in a topic
      const topicId = (message as any).message_thread_id;
      if (!topicId) {
        console.log(`/disable_ai command ignored - not in a topic`);
        return;
      }

      console.log(`🚀 Handling /disable_ai command in topic ${topicId}`);

      try {
        // Find human by topic_id
        const humanTelegramId = await handlerWorker.d1Storage.getHumanTelegramIdByTopic(topicId);
        
        if (!humanTelegramId) {
          console.error(`❌ Human not found for topic ${topicId}`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found for this topic.');
          return;
        }

        // Get human to access current data_in
        const human = await handlerWorker.d1Storage.getHumanByTelegramId(humanTelegramId);
        
        if (!human) {
          console.error(`❌ Human ${humanTelegramId} not found in database`);
          return;
        }

        // Parse existing data_in and set ai_enabled: false
        let dataInObj: any = {};
        if (human.dataIn) {
          try {
            dataInObj = JSON.parse(human.dataIn);
          } catch (e) {
            console.warn(`Failed to parse existing data_in for human ${humanTelegramId}, using empty object`);
          }
        }

        // Ensure telegram_id and topic_id are preserved
        if (!dataInObj.telegram_id) {
          dataInObj.telegram_id = humanTelegramId;
        }
        if (!dataInObj.topic_id) {
          dataInObj.topic_id = topicId;
        }

        // Set ai_enabled to false
        dataInObj.ai_enabled = false;

        // Update data_in
        await handlerWorker.d1Storage.updateHumanDataIn(humanTelegramId, JSON.stringify(dataInObj));

        console.log(`✅ AI disabled for human ${humanTelegramId} in topic ${topicId}`);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '✅ AI disabled.');
      } catch (error) {
        console.error(`❌ Error disabling AI for topic ${topicId}:`, error);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '❌ Error when disabling AI.');
      }
    },


    handleMenuCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /menu command via flow for user ${userId}`);
     
      // Start menu flow
      await handlerWorker.flowEngine.startFlow(userId, 'menu');

      console.log(`✅ Menu flow launched for user ${userId}`);
    },


    handleSetStatusCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;
      const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID);

      // Check if command is executed in admin group
      if (chatId !== adminChatId) {
        console.log(`/set_status command ignored - not in admin group`);
        return;
      }

      // Check if command is executed in a topic
      const topicId = (message as any).message_thread_id;
      if (!topicId) {
        console.log(`/set_status command ignored - not in a topic`);
        return;
      }

      console.log(`🚀 Handling /set_status command in topic ${topicId}`);

      try {
        // Find human by topic_id
        const humanTelegramId = await handlerWorker.d1Storage.getHumanTelegramIdByTopic(topicId);
        
        if (!humanTelegramId) {
          console.error(`❌ Human not found for topic ${topicId}`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found for this topic.');
          return;
        }

        // Get human to ensure it exists and get context
        const human = await handlerWorker.d1Storage.getHumanByTelegramId(humanTelegramId);
        
        if (!human || !human.id) {
          console.error(`❌ Human ${humanTelegramId} not found in database`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found in database.');
          return;
        }

        // Get or create human context
        await bot.userContextManager.getOrCreateContext(humanTelegramId, human.id);

        // Start set_status flow for the human associated with this topic
        await handlerWorker.flowEngine.startFlow(humanTelegramId, 'set_status');

        console.log(`✅ Set status flow launched for human ${humanTelegramId} in topic ${topicId}`);
      } catch (error) {
        console.error(`❌ Error starting set_status flow for topic ${topicId}:`, error);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '❌ Error starting set_status flow.');
      }
    },


    /**
     * Handle messages in consultant topics
     */
    handleConsultantTopicMessage: async (message: any) => {
      try {
        // Get ADMIN_CHAT_ID from env
        const adminChatId = parseInt(handlerWorker.env.ADMIN_CHAT_ID || '');
        if (!adminChatId) {
          console.error('ADMIN_CHAT_ID is not configured!');
        return;
      }

      // Extract topicId and chatId from message
      const topicId = (message as any).message_thread_id;
      const chatId = message.chat.id;
      const messageFromId = message.from.id;

      if (!topicId) {
        console.log('No topic ID in message');
        return;
      }

      // Check if message is voice -> transcribe and continue as text
      if (message.voice) {
        console.log(`🎤 Voice message detected in topic ${topicId}`);
        try {
          const botToken = handlerWorker.env.BOT_TOKEN || '';
          if (!botToken) {
            throw new Error('BOT_TOKEN is not configured');
          }

          // 1) Get file path by file_id
          const getFileResp = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${message.voice.file_id}`);
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
          const mimeType = (message.voice.mime_type as string) || 'audio/ogg';
          const blob = new Blob([arrayBuffer], { type: mimeType });

          // 3) Transcribe via AIService.upload
          const aiApiToken = handlerWorker.env.AI_API_TOKEN;
          if (!aiApiToken) {
            throw new Error('AI_API_TOKEN is not configured');
          }
          const aiService = new AIService(
            handlerWorker.env.AI_API_URL,
            aiApiToken
          );
          const transcriptionModel = handlerWorker.env.TRANSCRIPTION_MODEL || 'whisper-large-v3';
          
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
          const transcript = await aiService.upload(transcriptionModel, blob, filename);
          console.log(`📝 Transcript: ${transcript}`);

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
        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          topicId,
          'Send a text or voice message.'
        );
        return;
      }

      const messageText = message.text;
      console.log(`💬 Handling consultant message in topic ${topicId}: ${messageText}`);

      // Get consultant by topic_id from message_threads
      const consultantResult = await handlerWorker.d1Storage.execute(`
      SELECT id, maid, title, data_in 
      FROM message_threads 
      WHERE value = ? AND type = 'consultant' AND deleted_at IS NULL
      LIMIT 1
      `, [topicId.toString()]);

      if (!consultantResult || consultantResult.length === 0) {
        console.log(`No consultant found for topic ${topicId}`);
        return;
      }

      const consultant = consultantResult[0];
      const consultantMaid = consultant.maid as string;
      const consultantTitle = consultant.title as string;

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

      if (!consultant.data_in) {
        console.error(`No data_in found for consultant ${consultantMaid}`);
        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          topicId,
          '❌ Consultant configuration error: settings not found.'
        );
        return;
      }

      try {
        settingsJson = JSON.parse(consultant.data_in);
        
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
          await handlerWorker.messageService.sendMessageToTopic(
            adminChatId,
            topicId,
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
        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          topicId,
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
      // Read current summary if exists
      let context = '';
      try {
        const recentMessages = await handlerWorker.d1Storage.execute(`
          SELECT title, created_at, data_in 
          FROM messages 
          WHERE maid = ?
          ORDER BY created_at DESC
          LIMIT ?
        `, [consultantMaid, MESSAGES_FOR_ANSWER]);

        if (recentMessages && recentMessages.length > 0) {
          const recent = recentMessages
            .reverse()
            .map((msg: any) => msg.title || '')
            .filter(text => text) // Remove empty
            .join('\n\n');
          
          // Answer format: summary (if exists) + last 6 messages
          context = historySummaryText 
            ? `Summary:\n${historySummaryText}\n\n${recent}`
            : recent;
        } else if (historySummaryText) {
          // If no recent messages but summary exists
          context = `Summary:\n${historySummaryText}`;
        }
      } catch (error) {
        console.error('Error getting recent messages:', error);
        context = ''; // Continue without context if error
      }

      // Prepare AI input
      const aiInput = `${validatedPrompt}\n\nRecent conversation:\n${context}\n\nUser: ${messageText}\n\nConsultant:`;

      // Check for duplicate message (same text from same user in last 5 seconds)
      const duplicateCheck = await handlerWorker.d1Storage.execute(`
        SELECT full_maid
        FROM messages
        WHERE maid = ? AND title = ? AND created_at > datetime('now', '-5 seconds')
        LIMIT 1
      `, [consultantMaid, messageText]);
      
      if (duplicateCheck && duplicateCheck.length > 0) {
        console.log(`⚠️ Duplicate message detected, skipping: ${messageText}`);
        return;
      }

      // Save user message to database FIRST (before AI call)
      // Use consultantMaid in maid field to link messages with message_threads
      const userMessageUuid = generateUuidV4();
      const userMessageFullMaid = generateFullId('m');
      await handlerWorker.d1Storage.execute(`
        INSERT INTO messages (uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in)
        VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?)
      `, [
        userMessageUuid,
        consultantMaid, // Link to message_threads via maid
        userMessageFullMaid,
        messageText,
        consultantMaid, // Use maid for grouping (gin is redundant)
        JSON.stringify({ consultant: consultantMaid, fromId: messageFromId, text: messageText, createdAt: new Date().toISOString() })
      ]);
      console.log(`✅ User message saved: ${userMessageFullMaid} (linked to consultant ${consultantMaid})`);

      // Check if AI token is configured
      const aiApiToken = handlerWorker.env.AI_API_TOKEN;
      if (!aiApiToken) {
        console.error('AI_API_TOKEN is not configured! Set it with: wrangler secret put AI_API_TOKEN');
        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          topicId,
          '❌ AI service is not configured. Please set AI_API_TOKEN secret.'
        );
        return;
      }

      // Get AI response with error handling
      console.log(`🤖 Calling AI service with model: ${validatedModel}`);
      let aiResponse: string;
      
      try {
        const aiService = new AIService(
          handlerWorker.env.AI_API_URL,
          aiApiToken
        );

        aiResponse = await aiService.ask(validatedModel, aiInput);
        console.log(`✅ AI Response received: ${aiResponse}`);
      } catch (error) {
        console.error('❌ Error calling AI service:', error);
        console.error('Error details:', error?.message, error?.stack);
        
        // Send error message to user
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

      // Save AI response to database
      // Use consultantMaid in maid field to link messages with message_threads
      try {
        const aiMessageUuid = generateUuidV4();
        const aiMessageFullMaid = generateFullId('m');
        await handlerWorker.d1Storage.execute(`
          INSERT INTO messages (uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in)
          VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?)
        `, [
          aiMessageUuid,
          consultantMaid, // Link to message_threads via maid
          aiMessageFullMaid,
          aiResponse,
          consultantMaid, // Use maid for grouping (gin is redundant)
          JSON.stringify({ consultant: consultantMaid, response: aiResponse, createdAt: new Date().toISOString() })
        ]);
        console.log(`✅ AI message saved: ${aiMessageFullMaid} (linked to consultant ${consultantMaid})`);
      } catch (error) {
        console.error('❌ Error saving AI response to database:', error);
        // Continue execution to send response even if DB save fails
      }

        // Send AI response to topic
      try {
        console.log(`📤 Sending AI response to topic ${topicId}`);
        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          topicId,
          aiResponse
        );
        console.log(`✅ Message sent to topic ${topicId}`);
      } catch (error) {
        console.error('❌ Error sending AI response to topic:', error);
        // Don't return here - summary check should still happen
      }
        
      // Create/update summary after AI response if total messages divisible by context_length
      try {
        // Count total messages after saving both user and AI messages
        const allMessages = await handlerWorker.d1Storage.execute(`
          SELECT created_at, full_maid
          FROM messages
          WHERE maid = ?
          ORDER BY created_at ASC
        `, [consultantMaid]);

        const totalMessageCount = allMessages?.length || 0;
        console.log(`📊 Total messages after saving: ${totalMessageCount} (expected: ${totalMessageCount % MESSAGES_FOR_SUMMARY === 0 ? 'CREATE SUMMARY' : 'NO SUMMARY'})`);

        // Check if we need to create/update summary (every context_length messages)
        if (totalMessageCount > 0 && totalMessageCount % MESSAGES_FOR_SUMMARY === 0) {
          console.log(`🧾 SUMMARY TRIGGER: totalMessageCount=${totalMessageCount}, MESSAGES_FOR_SUMMARY=${MESSAGES_FOR_SUMMARY}, ${totalMessageCount % MESSAGES_FOR_SUMMARY} === 0`);
          console.log(`🧾 Creating/updating summary after message ${totalMessageCount} (every ${MESSAGES_FOR_SUMMARY} messages)`);

          let messagesToSummarize: any[] = [];
          
          if (!historySummaryText) {
            // First summary: first context_length messages
            const firstMessages = await handlerWorker.d1Storage.execute(`
              SELECT title, full_maid, data_in
              FROM messages
              WHERE maid = ?
              ORDER BY created_at ASC
              LIMIT ?
            `, [consultantMaid, MESSAGES_FOR_SUMMARY]);
            
            messagesToSummarize = firstMessages || [];
            console.log(`📝 First summary: ${messagesToSummarize.length} messages`);
          } else {
            // Subsequent summaries: next context_length messages after last summary
            const nextMessages = await handlerWorker.d1Storage.execute(`
              SELECT title, full_maid, data_in
              FROM messages
              WHERE maid = ? AND created_at > ?
              ORDER BY created_at ASC
              LIMIT ?
            `, [consultantMaid, historySummaryUpdatedAt || '1970-01-01', MESSAGES_FOR_SUMMARY]);
            
            messagesToSummarize = nextMessages || [];
            console.log(`📝 Next summary batch: ${messagesToSummarize.length} messages`);
          }

          if (messagesToSummarize.length > 0) {
            const messagesText = messagesToSummarize
              .map((msg: any) => {
                const text = (msg.title || '').trim();
                if (!text) return '';
                
                // Determine message author from data_in
                let author = 'User';
                try {
                  if (msg.data_in) {
                    const data = JSON.parse(msg.data_in);
                    // If data_in has 'response' field, it's from AI/Consultant
                    // If data_in has 'text' field, it's from user
                    if (data.response !== undefined) {
                      author = 'Consultant';
                    } else if (data.text !== undefined) {
                      author = 'User';
                    }
                  }
                } catch (e) {
                  // If parsing fails, default to 'User'
                  console.warn('Failed to parse data_in for message:', msg.full_maid);
                }
                
                return `${author}: ${text}`;
              })
              .filter(Boolean)
              .join('\n\n');

            const summaryPrompt = historySummaryText
            ? [
                'Summarize the conversation briefly and informatively.',
                'Preserve facts, agreements, intentions, definitions and terms.',
                'Do not make up facts. Use neutral tone.',
                'IMPORTANT: Complete all sentences fully. Do not cut phrases in the middle.',
                '',
                'Previous summary:',
                historySummaryText,
                '',
                `New ${MESSAGES_FOR_SUMMARY} replies to add:`,
                messagesText,
                '',
                'Merge the previous summary with new replies into one complete summary. Each sentence must be completed.'
              ].join('\n')
            : [
                `Summarize the first ${MESSAGES_FOR_SUMMARY} messages of the conversation briefly and informatively.`,
                'Preserve facts, agreements, intentions, definitions and terms.',
                'Do not make up facts. Use neutral tone.',
                'IMPORTANT: Complete all sentences fully. Do not cut phrases in the middle.',
                '',
                'Messages:',
                messagesText
              ].join('\n');

            const aiApiToken = handlerWorker.env.AI_API_TOKEN;
            if (aiApiToken) {
              const aiServiceForSummary = new AIService(
                handlerWorker.env.AI_API_URL,
                aiApiToken
              );

              let newSummaryText = await aiServiceForSummary.ask(validatedModel, summaryPrompt);
              
              // Fix incomplete sentences at the end
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
              
              // Find last message full_maid for tracking
              const lastMessage = allMessages[allMessages.length - 1]; // Use allMessages for last full_maid
              const lastMessageFullMaid = lastMessage?.full_maid || historySummaryLastFullMaid;

              // Update settings.data_in with new summary
              settingsJson.history_summary = { text: newSummaryText, version: 1 };
              settingsJson.history_summary_last_full_maid = lastMessageFullMaid;
              settingsJson.history_summary_updated_at = new Date().toISOString();

              await handlerWorker.d1Storage.execute(`
                UPDATE message_threads
                SET data_in = ?, updated_at = datetime('now')
                WHERE id = ?
              `, [JSON.stringify(settingsJson), consultant.id]);

              console.log('✅ Summary updated in settings');
            }
          }
        }
      } catch (error) {
        console.error('Error creating summary after AI response:', error);
      }
      
    } catch (error) {
      console.error('❌ Error in handleConsultantTopicMessage:', error);
      console.error('Error details:', error?.message, error?.stack);
    }
  },

  };
};

