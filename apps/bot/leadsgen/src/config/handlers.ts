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

        

        


        

        console.log(`✅ AI enabled for human ${humanTelegramId} in topic ${topicId}`);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '✅ AI enabled.');
      } catch (error) {
        console.error(`❌ Error enabling AI for topic ${topicId}:`, error);
        await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, '❌ Error when enabling AI.');
      }
    },

  };
};

