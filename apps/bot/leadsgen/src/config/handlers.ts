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
      await handlerWorker.flowEngine.startFlow(userId, 'start_registration');

      console.log(`✅ Start flow launched for human ${userId}`);
    },

  };
};

