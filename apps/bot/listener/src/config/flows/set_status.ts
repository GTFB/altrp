import type { BotFlow } from '../../core/flow-types';

export const setStatusFlow: BotFlow = {
  name: 'set_status',
  description: 'Set status',
  steps: [
    {
      type: 'message',
      id: 'show_set_status_buttons',
      text: 'Select the status:',
      keyboardKey: 'status_menu'
    },
  ]
};
