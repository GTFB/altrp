import type { BotFlow } from '../../core/flow-types';

export const startConversationFlow: BotFlow = {
  name: 'start_conversation',
  description: 'Start conversation message',
  steps: [
    {
      type: 'message',
      id: 'show_message',
      text: 'Write your question.',
    },
  ]
};
