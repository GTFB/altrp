import { BotInterface } from '../core/bot-interface';
import { UserContextManager } from '../core/user-context';
import { ProductRepository } from '../repositories/ProductRepository';
import { keyboards } from './callbacks';

type MatcherRole = 'offer' | 'seek';

const ROLE_LABELS: Record<MatcherRole, string> = {
  offer: 'Предлагаю',
  seek: 'Ищу'
};

const ROLE_PROMPTS: Record<MatcherRole, string> = {
  offer: 'Что вы предлагаете?',
  seek: 'Что вы ищете?'
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
    topicService: worker['topicService']
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
        'Группы для этой роли пока не настроены. Свяжитесь с администратором.',
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
        text: group.title || 'Группа без названия',
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
      const topicTitle = `${human.fullName || human.uuid || 'Участник'} • ${groupThread.title || 'Matcher'}`;
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

  const startRoleFlow = async (telegramId: number, role: MatcherRole) => {
    if (role === 'offer') {
      await handlerWorker.flowEngine.startFlow(telegramId, 'matcher_offer');
        } else {
      await handlerWorker.flowEngine.startFlow(telegramId, 'matcher_seek');
    }
  };

  const formatOfferSummary = (title?: string, description?: string, price?: string | number | null) => {
    const parts = [
      'Проверьте карточку предложения:',
      title ? `• <b>Название:</b> ${title}` : null,
      description ? `• <b>Описание:</b> ${description}` : null,
      price !== null && price !== undefined && price !== ''
        ? `• <b>Стоимость:</b> ${price}`
        : null
    ];

    return parts.filter(Boolean).join('\n');
  };

  const formatSearchResults = (products: Array<{ title?: string; dataIn?: string }>) => {
    if (!products.length) {
      return 'Пока ничего не нашли. Я передал запрос в нужную группу — вам ответят позже.';
    }

    const lines = products.map((product, index) => {
      const meta = safeParseJson<{ description?: string; price?: number | string }>(product.dataIn);
      const priceText = meta?.price ? `${meta.price}` : 'не указана';
      return `${index + 1}. <b>${product.title || 'Без названия'}</b>\n   Цена: ${priceText}${meta?.description ? `\n   Описание: ${meta.description}` : ''}`;
    });

    return `Нашёл похожие предложения:\n\n${lines.join('\n\n')}`;
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
        'Роль не определена. Нажмите /start и пройдите онбординг заново.',
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
        `Вы выбрали группу «${groupThread.title || 'без названия'}».`,
        context.humanId
      );

        await handlerWorker.messageService.sendMessageToTopic(
        chatId,
          topicId,
        `👤 <b>${human.fullName || human.uuid}</b> подключился к роли "${ROLE_LABELS[role]}".`
        );

        await handlerWorker.flowEngine.completeFlow(telegramId);
      await startRoleFlow(telegramId, role);
      } catch (error) {
      console.error('Error handling group selection:', error);
      await handlerWorker.messageService.sendMessage(
        telegramId,
        'Не удалось подключиться к группе. Попробуйте позже или обратитесь к администратору.',
        context.humanId
      );
    }
  };

  return {
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
      await sendGroupKeyboard(telegramId, 'offer', context);
    },

    matcherHandleRoleSeek: async (telegramId: number, contextManager: UserContextManager) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      await contextManager.setVariable(telegramId, 'matcher.status', 'seek');
      await contextManager.setVariable(telegramId, 'matcher.groupMaid', null);
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
          'Не хватает данных для публикации предложения. Попробуйте снова.',
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
        `🧾 <b>${offer.title || 'Новое предложение'}</b>`,
        offer.description ? offer.description : null,
        priceValue !== null ? `💰 ${priceValue}` : null
      ].filter(Boolean).join('\n');

      await handlerWorker.messageService.sendMessageToTopic(chatId, topicId, topicMessage);
      await handlerWorker.messageService.sendMessage(telegramId, '✅ Предложение опубликовано и передано в группу.', context.humanId);

      await contextManager.setVariable(telegramId, 'matcher.offer', {});
      await handlerWorker.flowEngine.completeFlow(telegramId);
    },

    matcherHandleSeekDescription: async (telegramId: number, contextManager: UserContextManager) => {
      const context = await contextManager.getContext(telegramId);
      if (!context) return;

      const description: string | undefined = context.data?.matcher?.seek?.description;
      if (!description) {
          await handlerWorker.messageService.sendMessage(
          telegramId,
          'Опишите, что вы ищете, чтобы я смог помочь.',
          context.humanId
          );
          return;
        }

      const products = await productRepository.searchProductsByQuery(description, MAX_SEARCH_RESULTS);
      const summary = formatSearchResults(products);

      await handlerWorker.messageService.sendMessage(telegramId, summary, context.humanId);

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
    }
  };
};