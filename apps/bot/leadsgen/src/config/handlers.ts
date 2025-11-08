import { BotInterface } from '../core/bot-interface';
import { AIService } from '../integrations/ai-service';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';

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
    flowEngine: worker['flowEngine'],
    env: worker['env'],
    messageService: worker['messageService'],
    topicService: worker['topicService']
  };
  
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
        const humanTelegramId = await handlerWorker.humanRepository.getHumanTelegramIdByTopic(topicId);
        
        if (!humanTelegramId) {
          console.error(`❌ Human not found for topic ${topicId}`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found for this topic.');
          return;
        }

        // Get human to access current data_in
        const human = await handlerWorker.humanRepository.getHumanByTelegramId(humanTelegramId);
        
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

        // Save original icon if not already saved
        if (!dataInObj.original_topic_icon) {
          dataInObj.original_topic_icon = {
            icon_color: 0x6FB9F0, // Default blue color
            icon_custom_emoji_id: null
          };
        }

        // Set ai_enabled to true
        dataInObj.ai_enabled = true;

        // Update data_in
        await handlerWorker.humanRepository.updateHumanDataIn(humanTelegramId, JSON.stringify(dataInObj));

        // Change topic icon to AI emoji
        const iconChanged = await handlerWorker.topicService.editTopicIcon(topicId, "5309832892262654231");
        if (!iconChanged) {
          console.warn(`⚠️ Failed to change topic icon for topic ${topicId}`);
        }

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
        const humanTelegramId = await handlerWorker.humanRepository.getHumanTelegramIdByTopic(topicId);
        
        if (!humanTelegramId) {
          console.error(`❌ Human not found for topic ${topicId}`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found for this topic.');
          return;
        }

        // Get human to access current data_in
        const human = await handlerWorker.humanRepository.getHumanByTelegramId(humanTelegramId);
        
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
        await handlerWorker.humanRepository.updateHumanDataIn(humanTelegramId, JSON.stringify(dataInObj));

        // Restore original topic icon
        const originalIcon = dataInObj.original_topic_icon;
        if (originalIcon) {
          const iconRestored = await handlerWorker.topicService.editTopicIcon(
            topicId, 
            originalIcon.icon_custom_emoji_id, 
            originalIcon.icon_color
          );
          if (!iconRestored) {
            console.warn(`⚠️ Failed to restore topic icon for topic ${topicId}`);
          }
        } else {
          // If no original icon saved, use default (blue color, no emoji)
          const iconRestored = await handlerWorker.topicService.editTopicIcon(topicId, null, 0x6FB9F0);
          if (!iconRestored) {
            console.warn(`⚠️ Failed to restore default topic icon for topic ${topicId}`);
          }
        }

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
        const humanTelegramId = await handlerWorker.humanRepository.getHumanTelegramIdByTopic(topicId);
        
        if (!humanTelegramId) {
          console.error(`❌ Human not found for topic ${topicId}`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found for this topic.');
          return;
        }

        // Get human to ensure it exists and get context
        const human = await handlerWorker.humanRepository.getHumanByTelegramId(humanTelegramId);
        
        if (!human || !human.id) {
          console.error(`❌ Human ${humanTelegramId} not found in database`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Human not found in database.');
          return;
        }

        // Get or create admin context (admin who runs the command)
        const adminHuman = await handlerWorker.humanRepository.getHumanByTelegramId(userId);
        if (!adminHuman || !adminHuman.id) {
          console.error(`❌ Admin ${userId} not found in database`);
          await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, 'Admin not found in database.');
          return;
        }

        await bot.userContextManager.getOrCreateContext(userId, adminHuman.id);

        // Start set_status flow in topic mode for admin
        await handlerWorker.flowEngine.startTopicFlow(userId, topicId, 'set_status', humanTelegramId, adminChatId);

        console.log(`✅ Set status flow launched for admin ${userId} in topic ${topicId} (managing user ${humanTelegramId})`);
      } catch (error) {
        console.error(`❌ Error starting set_status flow for topic ${topicId}:`, error);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '❌ Error starting set_status flow.');
      }
    },


    setStatusHandler: async (telegramId: number, contextManager: UserContextManager, callbackData: string) => {
      console.log(`🛠️ setStatusHandler called with callbackData: ${callbackData}`);
      
      // Get context to access topic flow information
      const context = await contextManager.getContext(telegramId);
      if (!context) {
        console.error(`❌ Context not found for admin ${telegramId}`);
        return;
      }

      // Get target user ID and topic ID from context
      const targetUserId = context.targetUserId;
      const topicId = context.topicId;
      const adminChatId = context.adminChatId;

      if (!targetUserId || !topicId || !adminChatId) {
        console.error(`❌ Missing required context: targetUserId=${targetUserId}, topicId=${topicId}, adminChatId=${adminChatId}`);
        return;
      }

      // Map callbackData to status name
      const statusMap: Record<string, string> = {
        'new_lead_status': 'NEW',
        'hot_lead_status': 'HOT',
        'sell_lead_status': 'SELL'
      };

      const statusName = statusMap[callbackData];
      if (!statusName) {
        console.error(`❌ Unknown callback data: ${callbackData}`);
        return;
      }

      try {
        // Update human status_name
        await handlerWorker.humanRepository.updateHuman(targetUserId, {
          statusName: statusName
        });
        console.log(`✅ Status updated to "${statusName}" for human ${targetUserId}`);

        // Change topic icon based on status
        let icon: string | null = null;
        switch (statusName) {
          case 'NEW':
            icon = '5312536423851630001';
            break;
          case 'HOT':
            icon = '5312241539987020022';
            break;
          case 'SELL':
            icon = '5350452584119279096';
            break;
        }

        console.log(`🎨 Setting status ${statusName} icon ${icon} for topic ${topicId}`);

        if (icon) {
          const iconChanged = await handlerWorker.topicService.editTopicIcon(topicId, icon);
          if (!iconChanged) {
            console.warn(`⚠️ Failed to change topic icon for topic ${topicId}`);
          } else {
            console.log(`✅ Topic icon updated to ${icon} for topic ${topicId}`);
          }
        } else {
          console.warn(`⚠️ No icon defined for status ${statusName}`);
        }

        // Send confirmation message to topic
        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          topicId,
          `✅ Status updated to <b>${statusName}</b>`
        );
      } catch (error) {
        console.error(`❌ Error in setStatusHandler:`, error);
        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          topicId,
          `❌ Error updating status: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
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

      // if (!topicId) {
      //   console.log('No topic ID in message');
      //   return;
      // }

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
        await handlerWorker.messageService.sendMessage(
          chatId,
          'Send a text or voice message.'
        );
        return;
      }

      const messageText = message.text;
      console.log(`💬 Handling AI answer to human message: ${messageText}`);

      // Get consultant from message_threads
      const consultantResult = await handlerWorker.d1Storage.execute(`
      SELECT id, maid, title, data_in 
      FROM message_threads 
      WHERE type = 'leadsgen' AND deleted_at IS NULL
      LIMIT 1
      `);

      if (!consultantResult || consultantResult.length === 0) {
        console.log(`No consultant found`);
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
        await handlerWorker.messageService.sendMessage(
          adminChatId,
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
      // Read current summary if exists
      let context = '';

      const human = await handlerWorker.humanRepository.getHumanByTelegramId(chatId);

      const dataInObj = JSON.parse(human.dataIn);

      console.log('Selecting messages:', consultantMaid, human.haid, MESSAGES_FOR_ANSWER)

      try {
        const recentMessages = await handlerWorker.d1Storage.execute(`
          SELECT title, created_at, data_in 
          FROM messages 
          WHERE maid = ? AND xaid = ?
          ORDER BY created_at DESC
          LIMIT ?
        `, [consultantMaid, human.haid, MESSAGES_FOR_ANSWER]);

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
      //const aiInput = `${validatedPrompt}\n\nRecent conversation:\n${context}\n\nUser: ${messageText}\n\nConsultant:`;
      const aiInput = `${validatedPrompt}\n\nRecent conversation:\n${context}\n\nUser: ${messageText}`;

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
      const userMessageFullMaid = generateAid('m');
      await handlerWorker.d1Storage.execute(`
        INSERT INTO messages (uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in, xaid)
        VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?, ?)
      `, [
        userMessageUuid,
        consultantMaid, // Link to message_threads via maid
        userMessageFullMaid,
        messageText,
        consultantMaid, // Use maid for grouping (gin is redundant)
        JSON.stringify({ consultant: consultantMaid, fromId: messageFromId, text: messageText, createdAt: new Date().toISOString() }),
        human.haid,
      ]);
      console.log(`✅ User message saved: ${userMessageFullMaid} (linked to consultant ${consultantMaid})`);

      // Check if AI token is configured
      const aiApiToken = handlerWorker.env.AI_API_TOKEN;
      if (!aiApiToken) {
        console.error('AI_API_TOKEN is not configured! Set it with: wrangler secret put AI_API_TOKEN');
        await handlerWorker.messageService.sendMessage(
          adminChatId,
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

      // Save AI response to database
      // Use consultantMaid in maid field to link messages with message_threads
      try {
        const aiMessageUuid = generateUuidV4();
        const aiMessageFullMaid = generateAid('m');
        await handlerWorker.d1Storage.execute(`
          INSERT INTO messages (uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in, xaid)
          VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?)
        `, [
          aiMessageUuid,
          consultantMaid, // Link to message_threads via maid
          aiMessageFullMaid,
          aiResponse,
          consultantMaid, // Use maid for grouping (gin is redundant)
          JSON.stringify({ consultant: consultantMaid, response: aiResponse, createdAt: new Date().toISOString() }),
          human.haid,
        ]);
        console.log(`✅ AI message saved: ${aiMessageFullMaid} (linked to consultant ${consultantMaid})`);
      } catch (error) {
        console.error('❌ Error saving AI response to database:', error);
        // Continue execution to send response even if DB save fails
      }

      // Send AI response to topic
      try {
        console.log(`📤 Sending AI response to topic ${topicId}`);
        await handlerWorker.messageService.sendMessage(
          chatId,
          aiResponse
        );

        await handlerWorker.messageService.sendMessageToTopic(
          adminChatId,
          dataInObj.topic_id,
          `<b>AI</b>

${aiResponse}`
        );

        console.log(`✅ Message sent to human ${chatId}`);
      } catch (error) {
        console.error('❌ Error sending AI response to topic:', error);
        // Don't return here - summary check should still happen
      }
      
    } catch (error) {
      console.error('❌ Error in handleConsultantTopicMessage:', error);
      console.error('Error details:', error?.message, error?.stack);
    }
  },

  };
};

