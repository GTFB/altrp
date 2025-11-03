import type { BotFlow } from '../../core/flow-types';

export const menuFlow: BotFlow = {
  name: 'menu',
  description: 'Main menu',
  steps: [
    {
      type: 'message',
      id: 'show_main_menu',
      text: 'Select an action:',
      keyboardKey: 'main_menu'
    },
  ]
};
