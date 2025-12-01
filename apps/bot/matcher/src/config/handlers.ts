import { BotInterface } from '../core/bot-interface';
import { UserContextManager } from '../core/user-context';
import { ProductRepository } from '../repositories/ProductRepository';
import { keyboards } from './callbacks';

type MatcherRole = 'offer' | 'seek';

const ROLE_LABELS: Record<MatcherRole, string> = {
  offer: 'Suggest',
  seek: 'Looking for'
};

const ROLE_PROMPTS: Record<MatcherRole, string> = {
  offer: 'What do you suggest?',
  seek: 'What are you looking for?'
};

const MAX_SEARCH_RESULTS = 5;

interface GroupSelectionPayload {
  handlerName?: string;
  maid?: string;
  m?: string;
}

const parseNumber = (value?: string): number | null => {
  if (!value) return null;
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const safeParseJson = <T>(json?: string): T | undefined => {
  if (!json) return undefined;
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
};

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
  
  const productRepository = new ProductRepository({ db: handlerWorker.env.DB });

  const parseHumanDataIn = (human: any): Record<string, any> => {
    if (!human?.dataIn) {
      return {};
    }
    try {
      return JSON.parse(human.dataIn);
    } catch {
      return {};
    }
  };

  const saveHumanDataIn = async (telegramId: number, data: Record<string, any>) => {
    await handlerWorker.humanRepository.updateHumanDataIn(telegramId, JSON.stringify(data));
  };

  const getOrCreateHuman = async (message: any) => {
    const telegramId = message.from.id;
    let human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
    if (human) {
      return human;
    }

        const fullName = [message.from.first_name, message.from.last_name]
          .filter(Boolean)
          .join(' ') || message.from.first_name || 'Unknown';
        
    await handlerWorker.humanRepository.addHuman({
      fullName,
      dataIn: JSON.stringify({
        telegram_id: telegramId,
          first_name: message.from.first_name,
          last_name: message.from.last_name || '',
          username: message.from.username || ''
      })
    });

    human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
    return human;
  };

  const sendGroupKeyboard = async (telegramId: number, role: MatcherRole, context: any) => {
    const groups = await handlerWorker.messageThreadRepository.getMatcherGroupsByType(role);
    const humanId = context?.humanId;

    if (!groups.length) {
      await handlerWorker.messageService.sendMessage(
        telegramId,
        'No groups have been set up for this role yet. Contact the administrator.',
        humanId
      );
        return;
      }

    const inline_keyboard = groups.map(group => {
      const payload = JSON.stringify({
        action: 'handler',
        h: 'mGrp',
        m: group.maid
      });
      return [{
        text: group.title || 'Group with no name',
        callback_data: payload
      }];
    });

    await handlerWorker.messageService.sendMessageWithKeyboard(
      telegramId,
      ROLE_PROMPTS[role],
      { inline_keyboard },
      humanId
    );
  };

  const ensureTopicForGroup = async (telegramId: number, role: MatcherRole, maid: string) => {
    const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
    if (!human || !human.haid) {
      throw new Error('Human not found for topic assignment');
    }

    const groupThread = await handlerWorker.messageThreadRepository.getMessageThreadByMaid(maid);
    if (!groupThread || !groupThread.value) {
      throw new Error('Group thread not found or missing chat id');
    }

    const chatId = parseInt(groupThread.value, 10);
    if (Number.isNaN(chatId)) {
      throw new Error('Invalid chat id in group thread');
    }

    const existingThread = await handlerWorker.messageThreadRepository.getThreadByParentAndXaid(
      groupThread.maid,
      human.haid
    );

    let topicId = existingThread?.value ? parseInt(existingThread.value, 10) : null;

    if (!topicId) {
      const topicTitle = `${human.fullName || human.uuid || 'Participant'} • ${groupThread.title || 'Matcher'}`;
      topicId = await handlerWorker.topicService.createTopic(topicTitle, 0x6FB9F0, chatId);
      if (!topicId) {
        throw new Error('Failed to create Telegram topic');
      }

      await handlerWorker.messageThreadRepository.addMessageThread({
        parentMaid: groupThread.maid,
        title: topicTitle,
        statusName: role,
        type: 'matcher',
        xaid: human.haid,
        value: topicId.toString(),
        dataIn: JSON.stringify({
          chat_id: chatId,
          matcher_status: role,
          group_maid: groupThread.maid
        })
      });
    }

    const humanData = parseHumanDataIn(human);
    humanData.topic_id = topicId;
    humanData.topic_chat_id = chatId;
    humanData.matcher_status = role;
    humanData.matcher_group_maid = maid;
    await saveHumanDataIn(telegramId, humanData);

    return { topicId, chatId, groupThread, humanData, human };
  };

  const exitDialogMode = async (telegramId: number) => {
    const context = await handlerWorker.userContextManager.getContext(telegramId);
    if (!context) return;

    const isDialogActive = context.data?.matcher?.dialog?.active;
    if (!isDialogActive) return; // Not in dialog mode

    console.log(`🚪 Exiting dialog mode for user ${telegramId}`);

    // Clear dialog state
    await handlerWorker.userContextManager.setVariable(telegramId, 'matcher.dialog.active', false);
    await handlerWorker.userContextManager.setVariable(telegramId, 'matcher.dialog.partnerTelegramId', null);
    await handlerWorker.userContextManager.setVariable(telegramId, 'matcher.dialog.productIndex', null);
    await handlerWorker.userContextManager.setVariable(telegramId, 'matcher.dialog.isInitiator', false);
    await handlerWorker.userContextManager.setVariable(telegramId, '_system.waitingForDialogMessage', null);
  };

  const startRoleFlow = async (telegramId: number, role: MatcherRole) => {
    if (role === 'offer') {
      await handlerWorker.flowEngine.startFlow(telegramId, 'matcher_offer');
        } else {
      await handlerWorker.flowEngine.startFlow(telegramId, 'matcher_seek');
    }
  };

  const formatOfferSummary = (title?: string, description?: string, price?: string | number | null) => {
    const parts = [
      'Check the offer card:',
      title ? `• <b>Title:</b> ${title}` : null,
      description ? `• <b>Description:</b> ${description}` : null,
      price !== null && price !== undefined && price !== ''
        ? `• <b>Cost:</b> ${price}`
        : null
    ];

    return parts.filter(Boolean).join('\n');
  };

  const formatSearchResults = (products: Array<{ title?: string; dataIn?: string }>) => {
    if (!products.length) {
      return 'Not found anything yet. Your request has been accepted, and you will receive a response later.';
    }

    const lines = products.map((product, index) => {
      const meta = safeParseJson<{ description?: string; price?: number | string }>(product.dataIn);
      const priceText = meta?.price ? `${meta.price}` : 'not specified';
      return `${index + 1}. <b>${product.title || 'Untitled'}</b>\n   Price: ${priceText}${meta?.description ? `\n   Description: ${meta.description}` : ''}`;
    });

    return `I found similar offers:\n\n${lines.join('\n\n')}`;
  };

  const formatProductCard = (product: { title?: string; dataIn?: string }, index: number, total: number) => {
    const meta = safeParseJson<{ description?: string; price?: number | string }>(product.dataIn);
    const priceText = meta?.price ? `${meta.price}` : 'not specified';
    const parts = [
      `<b>${product.title || 'Untitled'}</b>`,
      `💰 Price: ${priceText}`,
      meta?.description ? `📝 Description: ${meta.description}` : null,
      total > 1 ? `\n(${index + 1} from ${total})` : null
    ];
    return parts.filter(Boolean).join('\n');
  };

  const showProductWithNavigation = async (
    telegramId: number,
    contextManager: UserContextManager,
    products: Array<{ title?: string; dataIn?: string; paid?: string }>,
    currentIndex: number
  ) => {
    const context = await contextManager.getContext(telegramId);
    if (!context) return;

    if (products.length === 0) {
      await handlerWorker.messageService.sendMessage(
        telegramId,
        'We haven not found anything yet. Your request has been accepted, and you will receive a response later.',
        context.humanId
      );
      return;
    }

    const normalizedIndex = currentIndex % products.length;
    const product = products[normalizedIndex];
    const cardText = formatProductCard(product, normalizedIndex, products.length);

    // Create keyboard based on number of products
    let keyboard: any = { inline_keyboard: [] };
    
    if (products.length > 1) {
      keyboard.inline_keyboard = [
        [
          {
            text: '➡️ Next',
            callback_data: JSON.stringify({
              action: 'handler',
              h: 'matcherNextProduct'
            })
          },
          {
            text: '✅ Choose',
            callback_data: JSON.stringify({
              action: 'handler',
              h: 'matcherSelectProduct'
            })
          }
        ]
      ];
    } else {

      keyboard.inline_keyboard = [
        [
          {
            text: '✅ Choose',
            callback_data: JSON.stringify({
              action: 'handler',
              h: 'matcherSelectProduct'
            })
          }
        ]
      ];
    }

    await handlerWorker.messageService.sendMessageWithKeyboard(
      telegramId,
      cardText,
      keyboard,
      context.humanId
    );
  };

  const handleGroupSelection = async (telegramId: number, contextManager: UserContextManager, payload: GroupSelectionPayload) => {
    const maid = payload?.maid || payload?.m;
    if (!maid) {
      console.error('Group selection payload missing maid');
          return;
        }

      const context = await contextManager.getContext(telegramId);
    if (!context) return;

    const role = context.data?.matcher?.status as MatcherRole | undefined;
    if (!role) {
      await handlerWorker.messageService.sendMessage(
        telegramId,
        'The role is not defined. Click /start and re-onboarding.',
        context.humanId
      );
          return;
        }

      try {
      const { topicId, chatId, groupThread, human } = await ensureTopicForGroup(telegramId, role, maid);

      await contextManager.setVariable(telegramId, 'matcher.topicId', topicId);
      await contextManager.setVariable(telegramId, 'matcher.chatId', chatId);
      await contextManager.setVariable(telegramId, 'matcher.groupMaid', groupThread.maid);

      await handlerWorker.messageService.sendMessage(
        telegramId,
        `You have chosen "${groupThread.title || 'untitled'}".`,
        context.humanId
      );

        await handlerWorker.messageService.sendMessageToTopic(
        chatId,
            topicId, 
        `👤 <b>${human.fullName || human.uuid}</b> joined the role "${ROLE_LABELS[role]}".`
        );

        await handlerWorker.flowEngine.completeFlow(telegramId);
      await startRoleFlow(telegramId, role);
      } catch (error) {
      console.error('Error handling group selection:', error);
      await handlerWorker.messageService.sendMessage(
        telegramId,
        'Something went wrong... Try again later or contact the administrator.',
        context.humanId
      );
    }
  };

  const matcherStartOnboardingHandler = async (telegramId: number, contextManager: UserContextManager) => {
    const context = await contextManager.getContext(telegramId);
    if (!context) return;

    // First, check data_in.meta (similar to how human.name and human.email are stored)
    const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
    let dataInMeta: any = {};
    if (human) {
      const humanData = parseHumanDataIn(human);
      dataInMeta = humanData.meta || {};
    }

    // Check if meta data already exists in context
    let meta = context.data?.meta || {};
    let hasName = !!(meta.name && meta.name.trim());
    let hasEmail = !!(meta.email && meta.email.trim());

    // If not in context, check data_in.meta
    if (!hasName && dataInMeta.name && dataInMeta.name.trim()) {
      meta.name = dataInMeta.name;
      hasName = true;
      await contextManager.setVariable(telegramId, 'meta.name', dataInMeta.name);
      console.log(`✅ Loaded name from data_in.meta for ${telegramId}`);
    }
    if (!hasEmail && dataInMeta.email && dataInMeta.email.trim()) {
      meta.email = dataInMeta.email;
      hasEmail = true;
      await contextManager.setVariable(telegramId, 'meta.email', dataInMeta.email);
      console.log(`✅ Loaded email from data_in.meta for ${telegramId}`);
    }

    // Migration: if data exists in old onboarding.* location, migrate to meta.*
    const oldOnboarding = context.data?.onboarding || {};
    if (!hasName && oldOnboarding.name && oldOnboarding.name.trim()) {
      meta.name = oldOnboarding.name;
      hasName = true;
      await contextManager.setVariable(telegramId, 'meta.name', oldOnboarding.name);
      console.log(`✅ Migrated name from onboarding.name to meta.name for ${telegramId}`);
    }
    if (!hasEmail && oldOnboarding.email && oldOnboarding.email.trim()) {
      meta.email = oldOnboarding.email;
      hasEmail = true;
      await contextManager.setVariable(telegramId, 'meta.email', oldOnboarding.email);
      console.log(`✅ Migrated email from onboarding.email to meta.email for ${telegramId}`);
    }

    // Clear old waitingForInput if it uses old onboarding.* paths
    const waitingForInput = context.data?._system?.waitingForInput;
    if (waitingForInput && waitingForInput.saveToVariable?.startsWith('onboarding.')) {
      await contextManager.setVariable(telegramId, '_system.waitingForInput', null);
      console.log(`✅ Cleared old waitingForInput with path ${waitingForInput.saveToVariable} for ${telegramId}`);
    }

    // If still not found, try to load from database fields
    if (!hasName || !hasEmail) {
      if (human) {
        if (!hasName && human.fullName && human.fullName.trim()) {
          meta.name = human.fullName;
          hasName = true;
          await contextManager.setVariable(telegramId, 'meta.name', human.fullName);
        }
        if (!hasEmail && human.email && human.email.trim()) {
          meta.email = human.email;
          hasEmail = true;
          await contextManager.setVariable(telegramId, 'meta.email', human.email);
        }
      }
    }

    // Determine next step based on what data is available
    if (hasName && hasEmail) {
      // Both exist - skip directly to role selection
      await handlerWorker.flowEngine.goToStep(telegramId, 'onboarding_choose_role');
    } else if (hasName && !hasEmail) {
      // Name exists but email missing - skip to email step
      await handlerWorker.flowEngine.goToStep(telegramId, 'onboarding_asking_email');
    } else {
      // Name missing - start with name step
      await handlerWorker.flowEngine.goToStep(telegramId, 'onboarding_asking_name');
    }
  };

  const matcherCheckExistingDataHandler = async (telegramId: number, contextManager: UserContextManager) => {
    const context = await contextManager.getContext(telegramId);
    if (!context) return;

    // First, check data_in.meta (similar to how human.name and human.email are stored)
    const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
    let dataInMeta: any = {};
    if (human) {
      const humanData = parseHumanDataIn(human);
      dataInMeta = humanData.meta || {};
    }

    // Check if meta data already exists in context
    let meta = context.data?.meta || {};
    let hasName = !!(meta.name && meta.name.trim());
    let hasEmail = !!(meta.email && meta.email.trim());

    // If not in context, check data_in.meta
    if (!hasName && dataInMeta.name && dataInMeta.name.trim()) {
      meta.name = dataInMeta.name;
      hasName = true;
      await contextManager.setVariable(telegramId, 'meta.name', dataInMeta.name);
      console.log(`✅ Loaded name from data_in.meta for ${telegramId}`);
    }
    if (!hasEmail && dataInMeta.email && dataInMeta.email.trim()) {
      meta.email = dataInMeta.email;
      hasEmail = true;
      await contextManager.setVariable(telegramId, 'meta.email', dataInMeta.email);
      console.log(`✅ Loaded email from data_in.meta for ${telegramId}`);
    }

    // Migration: if data exists in old onboarding.* location, migrate to meta.*
    const oldOnboarding = context.data?.onboarding || {};
    if (!hasName && oldOnboarding.name && oldOnboarding.name.trim()) {
      meta.name = oldOnboarding.name;
      hasName = true;
      await contextManager.setVariable(telegramId, 'meta.name', oldOnboarding.name);
      console.log(`✅ Migrated name from onboarding.name to meta.name for ${telegramId}`);
    }
    if (!hasEmail && oldOnboarding.email && oldOnboarding.email.trim()) {
      meta.email = oldOnboarding.email;
      hasEmail = true;
      await contextManager.setVariable(telegramId, 'meta.email', oldOnboarding.email);
      console.log(`✅ Migrated email from onboarding.email to meta.email for ${telegramId}`);
    }

    // Clear old waitingForInput if it uses old onboarding.* paths
    const waitingForInput = context.data?._system?.waitingForInput;
    if (waitingForInput && waitingForInput.saveToVariable?.startsWith('onboarding.')) {
      await contextManager.setVariable(telegramId, '_system.waitingForInput', null);
      console.log(`✅ Cleared old waitingForInput with path ${waitingForInput.saveToVariable} for ${telegramId}`);
    }

    // If still not found, try to load from database fields
    if (!hasName || !hasEmail) {
      if (human) {
        if (!hasName && human.fullName && human.fullName.trim()) {
          meta.name = human.fullName;
          hasName = true;
          await contextManager.setVariable(telegramId, 'meta.name', human.fullName);
        }
        if (!hasEmail && human.email && human.email.trim()) {
          meta.email = human.email;
          hasEmail = true;
          await contextManager.setVariable(telegramId, 'meta.email', human.email);
        }
      }
    }

    // Determine next step based on what data is available
    if (hasName && hasEmail) {
      // Both exist - skip directly to role selection
      await handlerWorker.flowEngine.goToStep(telegramId, 'onboarding_choose_role');
    } else if (hasName && !hasEmail) {
      // Name exists but email missing - skip to email step
      await handlerWorker.flowEngine.goToStep(telegramId, 'onboarding_asking_email');
    } else {
      // Name missing - start with name step
      await handlerWorker.flowEngine.goToStep(telegramId, 'onboarding_asking_name');
    }
  };

  const matcherSaveUserDataHandler = async (telegramId: number, contextManager: UserContextManager) => {
    const context = await contextManager.getContext(telegramId);
    if (!context) return;

    const name = context.data?.meta?.name;
    const email = context.data?.meta?.email;

    // Save to database
    if (name || email) {
      await handlerWorker.humanRepository.updateHuman(telegramId, {
        fullName: name || undefined,
        email: email || undefined
      });
      console.log(`✅ Saved user data to DB for ${telegramId}: name=${!!name}, email=${!!email}`);
    }

    // Save to data_in.meta (similar to how human.name and human.email are saved)
    const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
    if (human) {
      const humanData = parseHumanDataIn(human);
      
      // Ensure meta object exists
      if (!humanData.meta) {
        humanData.meta = {};
      }
      
      // Update meta with current values
      if (name) {
        humanData.meta.name = name;
      }
      if (email) {
        humanData.meta.email = email;
      }
      
      // Remove old onboarding data if it exists
      if (humanData.onboarding) {
        delete humanData.onboarding.name;
        delete humanData.onboarding.email;
        // If onboarding object is empty, remove it
        if (Object.keys(humanData.onboarding).length === 0) {
          delete humanData.onboarding;
        }
      }
      
      await saveHumanDataIn(telegramId, humanData);
      console.log(`✅ Saved meta to data_in for ${telegramId}: name=${!!name}, email=${!!email}`);
    }
    
    
    // Ensure meta object exists in context
    if (!context.data.meta) {
      context.data.meta = {};
    }
    
    // Data is already in context.data.meta from saveToVariable, just ensure it persists
    console.log(`✅ User data in context for ${telegramId}: name=${!!name}, email=${!!email}`);
  };

  return {
    exitDialogMode,

    matcherStartOnboardingHandler,

    handleStartCommand: async (message: any, bot: any) => {
      const userId = message.from.id;
      const human = await getOrCreateHuman(message);

      if (!human?.id) {
        console.error(`❌ Failed to register human ${userId}`);
        return;
      }

      await bot.userContextManager.getOrCreateContext(userId, human.id);
      await bot.userContextManager.setVariable(userId, '_system.currentMessage', message);
      await handlerWorker.flowEngine.startFlow(userId, 'onboarding');
    },

    handleMenuCommand: async (message: any) => {
      const userId = message.from.id;
      await handlerWorker.flowEngine.startFlow(userId, 'menu');
    },

    matcherHandleRoleOffer: async (telegramId: number, contextManager: UserContextManager) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      await contextManager.setVariable(telegramId, 'matcher.status', 'offer');
      await contextManager.setVariable(telegramId, 'matcher.groupMaid', null);
      
      // Save matcher_status to human.data_in
      const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
      if (human) {
        const humanData = parseHumanDataIn(human);
        humanData.matcher_status = 'offer';
        await saveHumanDataIn(telegramId, humanData);
      }
      
      // Complete onboarding flow before showing group selection
      await handlerWorker.flowEngine.completeFlow(telegramId);
      
      await sendGroupKeyboard(telegramId, 'offer', context);
    },

    matcherHandleRoleSeek: async (telegramId: number, contextManager: UserContextManager) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      await contextManager.setVariable(telegramId, 'matcher.status', 'seek');
      await contextManager.setVariable(telegramId, 'matcher.groupMaid', null);
      
      // Save matcher_status to human.data_in
      const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
      if (human) {
        const humanData = parseHumanDataIn(human);
        humanData.matcher_status = 'seek';
        await saveHumanDataIn(telegramId, humanData);
      }
      
      // Complete onboarding flow before showing group selection
        await handlerWorker.flowEngine.completeFlow(telegramId);

      await sendGroupKeyboard(telegramId, 'seek', context);
    },

    matcherHandleGroupSelection: handleGroupSelection,
    mGrp: handleGroupSelection,

    matcherShowOfferSummaryHandler: async (telegramId: number, contextManager: UserContextManager) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      const offer = context.data?.matcher?.offer || {};
      const summary = formatOfferSummary(offer.title, offer.description, offer.price);

      await handlerWorker.messageService.sendMessageWithKeyboard(
        telegramId,
        summary,
        keyboards.matcher_offer_summary,
        context.humanId
      );
    },

    matcherConfirmOfferHandler: async (telegramId: number, contextManager: UserContextManager) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      const offer = context.data?.matcher?.offer;
      const topicId = context.data?.matcher?.topicId;
      const chatId = context.data?.matcher?.chatId;

      if (!offer || !topicId || !chatId) {
        await handlerWorker.messageService.sendMessage(
          telegramId,
          'There is not enough data to publish the offer. Try again.',
          context.humanId
        );
        return;
      }

      const human = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
      if (!human || !human.haid) {
        console.error('Human not found when confirming offer');
        return;
      }

      await productRepository.addProduct({
        title: offer.title,
        category: 'offer',
        type: 'offer',
        xaid: human.haid,
        dataIn: JSON.stringify({
          description: offer.description,
          price: offer.price,
          telegram_id: telegramId
        }),
        statusName: 'active'
      });

      const priceValue = parseNumber(offer.price);
      const topicMessage = [
        `🧾 <b>${offer.title || 'New offer'}</b>`,
        offer.description ? offer.description : null,
        priceValue !== null ? `💰 ${priceValue}` : null
      ].filter(Boolean).join('\n');

      await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, topicMessage);
      await handlerWorker.messageService.sendMessage(telegramId, '✅ The offer has been published and submitted to the group.', context.humanId);

      await contextManager.setVariable(telegramId, 'matcher.offer', {});
      await handlerWorker.flowEngine.completeFlow(telegramId);
    },

    matcherCheckExistingDataHandler,
    matcherSaveUserDataHandler,

    matcherHandleSeekDescription: async (telegramId: number, contextManager: UserContextManager) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      const description: string | undefined = context.data?.matcher?.seek?.description;
      if (!description) {
        await handlerWorker.messageService.sendMessage(
          telegramId,
          'Describe what you are looking for so that I can help.',
          context.humanId
        );
        return;
      }

      const products = await productRepository.searchProductsByQuery(description, MAX_SEARCH_RESULTS);
      
      // Save products list to context for navigation
      await contextManager.setVariable(telegramId, 'matcher.search.products', products);
      await contextManager.setVariable(telegramId, 'matcher.search.currentIndex', 0);

      // Show first product with navigation
      await showProductWithNavigation(telegramId, contextManager, products, 0);

      const topicId = context.data?.matcher?.topicId;
      const chatId = context.data?.matcher?.chatId;
      if (topicId && chatId) {
        await handlerWorker.messageService.sendMessageToTopic(
          chatId,
          topicId,
          `🔎 Запрос: ${description}`
        );
      }

      await handlerWorker.flowEngine.completeFlow(telegramId);
    },

    matcherNextProduct: async (telegramId: number, contextManager: UserContextManager, payload: any) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      const products = context.data?.matcher?.search?.products || [];
      if (products.length === 0) return;

      const currentIndex = context.data?.matcher?.search?.currentIndex ?? 0;
      const nextIndex = (currentIndex + 1) % products.length;

      await contextManager.setVariable(telegramId, 'matcher.search.currentIndex', nextIndex);
      await showProductWithNavigation(telegramId, contextManager, products, nextIndex);
    },

    matcherSelectProduct: async (telegramId: number, contextManager: UserContextManager, payload: any) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      const products = context.data?.matcher?.search?.products || [];
      const currentIndex = context.data?.matcher?.search?.currentIndex ?? 0;
      const selectedIndex = currentIndex;

      if (products.length === 0 || !products[selectedIndex]) {
        await handlerWorker.messageService.sendMessage(
          telegramId,
          'Product not found.',
          context.humanId
        );
        return;
      }

      const product = products[selectedIndex];
      const cardText = formatProductCard(product, selectedIndex, products.length);

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: '💬 Start a dialogue',
              callback_data: JSON.stringify({
                action: 'handler',
                h: 'matcherStartDialog',
                productIndex: selectedIndex
              })
            }
          ]
        ]
      };

      await handlerWorker.messageService.sendMessageWithKeyboard(
        telegramId,
        `✅ Selected:\n\n${cardText}`,
        keyboard,
        context.humanId
      );
    },

    matcherStartDialog: async (telegramId: number, contextManager: UserContextManager, payload: any) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      const products = context.data?.matcher?.search?.products || [];
      const productIndex = payload?.productIndex ?? context.data?.matcher?.search?.currentIndex ?? 0;
      const product = products[productIndex];

      if (!product || !product.xaid) {
        await handlerWorker.messageService.sendMessage(
          telegramId,
          '❌ The product was not found or the owner is not specified.',
          context.humanId
        );
        return;
      }

      // Find product owner by xaid (which equals haid)
      const ownerHuman = await handlerWorker.humanRepository.getHumanByHaid(product.xaid);
      if (!ownerHuman) {
        await handlerWorker.messageService.sendMessage(
          telegramId,
          '❌ The owner of the product has not been found.',
          context.humanId
        );
        return;
      }

      // Get owner's telegram_id from data_in
      let ownerTelegramId: number | null = null;
      if (ownerHuman.dataIn) {
        try {
          const ownerDataIn = JSON.parse(ownerHuman.dataIn);
          ownerTelegramId = ownerDataIn.telegram_id || null;
        } catch (e) {
          console.error('Failed to parse owner data_in:', e);
        }
      }

      if (!ownerTelegramId) {
        await handlerWorker.messageService.sendMessage(
          telegramId,
          '❌ Product owner not found.',
          context.humanId
        );
        return;
      }

      // Save dialog state: who is talking to whom
      await contextManager.setVariable(telegramId, 'matcher.dialog.active', true);
      await contextManager.setVariable(telegramId, 'matcher.dialog.partnerTelegramId', ownerTelegramId);
      await contextManager.setVariable(telegramId, 'matcher.dialog.productIndex', productIndex);
      await contextManager.setVariable(telegramId, 'matcher.dialog.isInitiator', true);

      // Request message from user
      await handlerWorker.messageService.sendMessage(
        telegramId,
        '💬 Write to the counterparty:',
        context.humanId
      );

      // Set waiting state for dialog message
      await contextManager.setVariable(telegramId, '_system.waitingForDialogMessage', true);
    },

    handleDialogMessage: async (telegramId: number, messageText: string) => {
      const context = await handlerWorker.userContextManager.getContext(telegramId);
      if (!context) return false;

      const isDialogActive = context.data?.matcher?.dialog?.active;
      const partnerTelegramId = context.data?.matcher?.dialog?.partnerTelegramId;
      const isInitiator = context.data?.matcher?.dialog?.isInitiator;
      const waitingForDialogMessage = context.data?._system?.waitingForDialogMessage;

      // Check if user is waiting for dialog message (initiator) or in active dialog (both)
      if (!isDialogActive || !partnerTelegramId) {
        // Not in dialog mode, handle normally
        return false;
      }

      // If initiator is waiting for first message, process it
      if (isInitiator && !waitingForDialogMessage) {
        // Initiator already sent first message, now they can continue dialog
        // This will be handled below
      }

      // Get partner's human info
      const partnerHuman = await handlerWorker.humanRepository.getHumanByTelegramId(partnerTelegramId);
      if (!partnerHuman) {
        await handlerWorker.messageService.sendMessage(
          telegramId,
          '❌ Counterparty not found.',
          context.humanId
        );
        return true; // Message handled
      }

      // Get current user info
      const currentUser = await handlerWorker.humanRepository.getHumanByTelegramId(telegramId);
      if (!currentUser) {
        return true;
      }

      // Send message to partner
      const senderName = currentUser.fullName || `User ${telegramId}`;
      const messageToPartner = `💬 Message from ${senderName}:\n\n${messageText}`;

      await handlerWorker.messageService.sendMessage(
        partnerTelegramId,
        messageToPartner,
        partnerHuman.id
      );

      // Save dialog state for partner (they are now in dialog with current user)
      const partnerContext = await handlerWorker.userContextManager.getContext(partnerTelegramId);
      if (partnerContext) {
        await handlerWorker.userContextManager.setVariable(partnerTelegramId, 'matcher.dialog.active', true);
        await handlerWorker.userContextManager.setVariable(partnerTelegramId, 'matcher.dialog.partnerTelegramId', telegramId);
        await handlerWorker.userContextManager.setVariable(partnerTelegramId, 'matcher.dialog.isInitiator', false);
      } else {
        // Create context for partner if doesn't exist
        await handlerWorker.userContextManager.getOrCreateContext(partnerTelegramId, partnerHuman.id);
        await handlerWorker.userContextManager.setVariable(partnerTelegramId, 'matcher.dialog.active', true);
        await handlerWorker.userContextManager.setVariable(partnerTelegramId, 'matcher.dialog.partnerTelegramId', telegramId);
        await handlerWorker.userContextManager.setVariable(partnerTelegramId, 'matcher.dialog.isInitiator', false);
      }

      // Clear waiting state for initiator
      if (isInitiator) {
        await handlerWorker.userContextManager.setVariable(telegramId, '_system.waitingForDialogMessage', null);
      }

      // Confirm message sent
      await handlerWorker.messageService.sendMessage(
        telegramId,
        '✅ The message has been sent.',
        context.humanId
      );

      return true; // Message handled
    }
  };
};