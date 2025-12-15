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
    topicService: worker['topicService'],
    userContextManager: worker['userContextManager']
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
  
  /**
   * Ensure topic exists for user in leadsgen group
   * Similar to ensureTopicForGroup in matcher, but simplified for single group
   */
  const ensureTopicForLeadsgenGroup = async (telegramId: number, group: any) => {
    const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
    if (!human || !human.haid) {
      throw new Error('Human not found for topic assignment');
    }

    if (!group || !group.value) {
      throw new Error('Group not found or missing chat id');
    }

    const chatId = parseInt(group.value, 10);
    if (Number.isNaN(chatId)) {
      throw new Error('Invalid chat id in group thread');
    }

    // Check if topic already exists for this user in this group
    const existingThread = await handlerWorker.messageThreadRepository.getThreadByParentAndXaid(
      group.maid,
      human.haid
    );

    let topicId = existingThread?.value ? parseInt(existingThread.value, 10) : null;

    if (!topicId) {
      // Create new topic in the group
      const fullName = human.fullName || human.uuid || 'Participant';
      const topicTitle = `${fullName} • ${group.title || 'Leadsgen'}`;
      topicId = await handlerWorker.topicService.createTopic(topicTitle, 0x6FB9F0, chatId);
      
      if (!topicId) {
        throw new Error('Failed to create Telegram topic');
      }

      // Create message_thread entry for the topic
      const threadDataIn = JSON.stringify({
        prompt: "You are a technical support assistant providing troubleshooting help and technical guidance. Help users resolve technical issues, understand software functionality, and navigate system features. Always clarify that your assistance is for general troubleshooting and encourage users to contact official support channels for complex issues, account problems, or security concerns. Keep your answers brief and concise. Format your responses using HTML tags for Telegram only from this list: use <b> for bold, <i> for italics, <u> for underscores, <code> for code, and <a href=\"url\"> for links DO NOT use <br> tag. Respond clearly only to the user's message, taking into account the context, without unnecessary auxiliary information.",
        model: "gemini-2.5-flash",
        context_length: 6
      });

      await handlerWorker.messageThreadRepository.addMessageThread({
        parentMaid: group.maid,
        title: topicTitle,
        statusName: 'active',
        type: 'leadsgen',
        xaid: human.haid,
        value: topicId.toString(),
        dataIn: threadDataIn
      });
      
      console.log(`✅ Created new topic ${topicId} for user ${telegramId} in group ${group.maid}`);
    }

    return { topicId, chatId, group, human };
  };

  return {
    /**
     * Handle /start command
     */
    handleStartCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;

      console.log(`🚀 Handling /start command via flow for human ${userId}`);

      // Get leadsgen group from message_threads
      const group = await handlerWorker.messageThreadRepository.getAdminGroup(handlerWorker.env.BOT_TYPE || 'leadsgen');
      let groupChatId: number | null = null;
      
      // If no admin group configured in message_threads — fail with config error
      if (!group) {
        console.error('❌ No admin group found in message_threads for BOT_TYPE. Please configure message_threads.');
        await handlerWorker.messageService.sendMessage(
          chatId,
          '❌ Configuration error: admin group not found. Please contact administrator.',
          null
        );
        return;
      } else {
        groupChatId = group.chatId;
        console.log(`✅ Found leadsgen group: ${group.title} (chat_id: ${groupChatId})`);
      }

      // Get or create human in database to get dbHumanId
      let existingHuman = await handlerWorker.humanRepository.getHumanByTelegramId(userId);
      
      if (!existingHuman) {
        // Compose full name from first and last name
        const fullName = [message.from.first_name, message.from.last_name]
          .filter(Boolean)
          .join(' ') || message.from.first_name || 'Unknown';
        
        // Register human minimally to get dbHumanId and haid
        const dataIn = JSON.stringify({
          telegram_id: userId,
          topic_id: 0, // Will be set after topic creation
          first_name: message.from.first_name,
          last_name: message.from.last_name || '',
          username: message.from.username || ''
        });
        
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

      // Ensure topic exists for user in group (if group found)
      let topicId: number | null = null;
      if (group) {
        try {
          const topicInfo = await ensureTopicForLeadsgenGroup(userId, group);
          topicId = topicInfo.topicId;
          
          // Update human.dataIn with topic_id and group info
          let dataInObj: any = {};
          if (existingHuman.dataIn) {
            try {
              dataInObj = JSON.parse(existingHuman.dataIn);
            } catch (e) {
              console.warn(`Failed to parse existing data_in for human ${userId}`);
            }
          }
          
          dataInObj.telegram_id = userId;
          dataInObj.topic_id = topicId;
          dataInObj.topic_chat_id = groupChatId;
          dataInObj.group_maid = group.maid;
          dataInObj.first_name = message.from.first_name;
          dataInObj.last_name = message.from.last_name || '';
          dataInObj.username = message.from.username || '';
          
          await handlerWorker.humanRepository.updateHumanDataIn(userId, JSON.stringify(dataInObj));
          
          // Send welcome message to topic
          if (topicId && groupChatId) {
            await handlerWorker.messageService.sendMessageToTopic(groupChatId, topicId, 
              `👋 New user!\n\n` +
              `Name: ${message.from.first_name} ${message.from.last_name || ''}\n` +
              `Username: @${message.from.username || 'not specified'}\n` +
              `ID: ${userId}\n\n`
            );
          }
          
          console.log(`✅ Topic ${topicId} ensured for user ${userId} in group ${group.maid}`);
        } catch (error) {
          console.error(`❌ Error ensuring topic for user ${userId}:`, error);
          // Continue with flow even if topic creation fails
        }
      } else {
        // Fallback: create topic using old method if group not found
        const fullName = existingHuman.fullName || [message.from.first_name, message.from.last_name]
          .filter(Boolean)
          .join(' ') || message.from.first_name || 'Unknown';
        
        topicId = await handlerWorker.topicService.createTopic(fullName);
        
        if (topicId && groupChatId) {
          await handlerWorker.messageService.sendMessageToTopic(groupChatId, topicId, 
            `👋 New user!\n\n` +
            `Name: ${message.from.first_name} ${message.from.last_name || ''}\n` +
            `Username: @${message.from.username || 'not specified'}\n` +
            `ID: ${userId}\n\n`
          );
          
          // Update human.dataIn
          let dataInObj: any = {};
          if (existingHuman.dataIn) {
            try {
              dataInObj = JSON.parse(existingHuman.dataIn);
            } catch (e) {
              console.warn(`Failed to parse existing data_in for human ${userId}`);
            }
          }
          
          dataInObj.telegram_id = userId;
          dataInObj.topic_id = topicId;
          dataInObj.topic_chat_id = groupChatId;
          
          await handlerWorker.humanRepository.updateHumanDataIn(userId, JSON.stringify(dataInObj));
          
          // Create message_threads entry if human has haid
          if (existingHuman.haid) {
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
              title: fullName
            });
          }
        }
      }

      // Get or create human context
      await bot.userContextManager.getOrCreateContext(userId, existingHuman.id);
      
      // Save group info to context
      if (group) {
        await bot.userContextManager.setVariable(userId, 'leadsgen.groupMaid', group.maid);
        await bot.userContextManager.setVariable(userId, 'leadsgen.groupChatId', groupChatId);
        await bot.userContextManager.setVariable(userId, 'leadsgen.topicId', topicId);
      }
      
      // Save info about the current message for handlers
      await bot.userContextManager.setVariable(userId, '_system.currentMessage', message);

      // Start registration flow
      await handlerWorker.flowEngine.startFlow(userId, 'onboarding');

      console.log(`✅ Start flow launched for human ${userId}`);
    },


    handleEnableAICommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const chatId = message.chat.id;
      const adminChatId = chatId;

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
          let originalIconEmojiId: string | null = null;
          try {
            const ctxIcon = await bot.userContextManager.getVariable(humanTelegramId, 'leadsgen.topicIcon');
            if (typeof ctxIcon === 'string' && ctxIcon.length > 0) {
              originalIconEmojiId = ctxIcon;
            }
          } catch (e) {
            console.warn(`Failed to read topicIcon from context for human ${humanTelegramId}`, e);
          }

          dataInObj.original_topic_icon = {
            icon_color: 0x6FB9F0, // Default blue color
            icon_custom_emoji_id: originalIconEmojiId
          };
        }

        // Set ai_enabled to true
        dataInObj.ai_enabled = true;

        // Update data_in
        await handlerWorker.humanRepository.updateHumanDataIn(humanTelegramId, JSON.stringify(dataInObj));

        // Change topic icon to AI emoji
        const iconChanged = await handlerWorker.topicService.editTopicIcon(
          topicId,
          "5309832892262654231",
          undefined,
          adminChatId
        );
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
      const adminChatId = chatId;

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

        // Restore topic icon:
        // 1) Try to use icon saved in user context (leadsgen.topicIcon)
        // 2) Fallback to original_topic_icon from data_in
        // 3) Fallback to default (blue color, no emoji)
        let restored = false;

        try {
          const ctxIcon = await bot.userContextManager.getVariable(humanTelegramId, 'leadsgen.topicIcon');
          if (typeof ctxIcon === 'string' && ctxIcon.length > 0) {
            const iconRestoredFromCtx = await handlerWorker.topicService.editTopicIcon(
              topicId,
              ctxIcon,
              undefined,
              adminChatId
            );
            if (iconRestoredFromCtx) {
              console.log(`✅ Topic icon restored from context (${ctxIcon}) for topic ${topicId}`);
              restored = true;
            } else {
              console.warn(`⚠️ Failed to restore topic icon from context for topic ${topicId}`);
            }
          }
        } catch (e) {
          console.warn(`⚠️ Failed to read topicIcon from context for human ${humanTelegramId}`, e);
        }

        if (!restored) {
          const originalIcon = dataInObj.original_topic_icon;
          if (originalIcon) {
            const iconRestored = await handlerWorker.topicService.editTopicIcon(
              topicId,
              originalIcon.icon_custom_emoji_id,
              originalIcon.icon_color,
              adminChatId
            );
            if (!iconRestored) {
              console.warn(`⚠️ Failed to restore topic icon from original_topic_icon for topic ${topicId}`);
            } else {
              console.log(`✅ Topic icon restored from original_topic_icon for topic ${topicId}`);
            }
          } else {
            // If no original icon saved, use default (blue color, no emoji)
            const iconRestored = await handlerWorker.topicService.editTopicIcon(
              topicId,
              null,
              0x6FB9F0,
              adminChatId
            );
            if (!iconRestored) {
              console.warn(`⚠️ Failed to restore default topic icon for topic ${topicId}`);
            } else {
              console.log(`✅ Default topic icon restored for topic ${topicId}`);
            }
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
      const adminChatId = chatId;

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

        console.log(`🎨 Setting status ${statusName} icon ${icon} for topic ${topicId} in chat ${adminChatId}`);

        if (icon) {
          // Pass adminChatId explicitly so TopicService knows which chat the topic belongs to
          const iconChanged = await handlerWorker.topicService.editTopicIcon(
            topicId,
            icon,
            undefined,
            adminChatId
          );
          if (!iconChanged) {
            console.warn(`⚠️ Failed to change topic icon for topic ${topicId}`);
          } else {
            console.log(`✅ Topic icon updated to ${icon} for topic ${topicId}`);
          }

          // Save topic icon code in user's context for future usage
          try {
            const targetHuman = await handlerWorker.humanRepository.getHumanByTelegramId(targetUserId);
            if (targetHuman?.id) {
              // Ensure user context exists
              await contextManager.getOrCreateContext(targetUserId, targetHuman.id);
              await contextManager.setVariable(targetUserId, 'leadsgen.topicIcon', icon);
              console.log(`🧠 Saved topic icon ${icon} to context for user ${targetUserId}`);
            } else {
              console.warn(`⚠️ Cannot save topic icon to context: human ${targetUserId} not found`);
            }
          } catch (ctxError) {
            console.warn(`⚠️ Failed to save topic icon to user context for ${targetUserId}:`, ctxError);
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

        // Complete flow and exit flow mode (clears flowInTopic, topicId, etc.)
        await handlerWorker.flowEngine.completeFlow(telegramId);

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
     * Handle messages for AI assistant
     */
    handleAssistantTopicMessage: async (message: any) => {
      try {
        // Get admin group from message_threads
        const group = await handlerWorker.messageThreadRepository.getAdminGroup(handlerWorker.env.BOT_TYPE || 'leadsgen');
        let adminChatId: number | null = null;
        
        if (group) {
          adminChatId = group.chatId;
        }
        
        if (!adminChatId || Number.isNaN(adminChatId)) {
          console.error('❌ No admin group found in message_threads for BOT_TYPE. Please configure message_threads.');
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

    /**
     * Exit dialog mode (if user is in dialog)
     * For leadsgen, this is a stub as dialog mode is specific to matcher
     */
    exitDialogMode: async (telegramId: number) => {
      const context = await handlerWorker.userContextManager.getContext(telegramId);
      if (!context) return;

      // For leadsgen, dialog mode is not used, but we keep the function for compatibility
      // If needed in the future, dialog state can be stored in context.data.leadsgen.dialog
      console.log(`🚪 exitDialogMode called for user ${telegramId} (leadsgen - no dialog mode)`);
    },

    /**
     * Handle dialog message (if user is in dialog)
     * For leadsgen, this is a stub as dialog mode is specific to matcher
     */
    handleDialogMessage: async (telegramId: number, messageText: string) => {
      // For leadsgen, dialog mode is not used, so always return false (not handled)
      return false;
    }

  };
};

