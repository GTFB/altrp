import type { BotFlow } from '../../core/flow-types';

export const helpFlow: BotFlow = {
  name: 'help',
  description: 'Helpfull information',
  steps: [
    {
      type: 'message',
      id: 'show_help',
      text: `📜 In order to launch the main menu with options for my functions (navigation, information, settings, etc.),\nsimply send the following command to the chat:\n\n/menu`,
      //keyboardKey: 'main_menu'
    },
  ]
};
