import type { BotFlow } from '../../core/flow-types';

export const menuFlow: BotFlow = {
  name: 'menu',
  description: 'Matcher main menu',
  steps: [
    {
      type: 'message',
      id: 'show_main_menu',
      text: 'Если хотите добавить ещё один товар или запрос — отправьте команду /start и повторите онбординг.',
    }
  ]
};
