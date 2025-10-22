import type { BotFlow } from '../../core/flow-types';

export const menuFlow: BotFlow = {
  name: 'menu',
  description: 'Main menu',
  steps: [
    {
      type: 'message',
      id: 'show_main_menu',
      messageKey: 'mainMenu',
      keyboardKey: 'main_menu'
    },
  ]
};
