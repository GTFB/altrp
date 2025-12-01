import type { BotFlow } from '../../core/flow-types';

export const menuFlow: BotFlow = {
  name: 'menu',
  description: 'Matcher main menu',
  steps: [
    {
      type: 'message',
      id: 'show_main_menu',
      text: 'If you want to add another product or request — send the /start command and repeat the onboarding.',
    }
  ]
};
