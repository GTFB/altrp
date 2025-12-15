import type { BotFlow } from '../../core/flow-types';

export const startConversationFlow: BotFlow = {
  name: 'start_conversation',
  description: 'Start conversation message',
  steps: [
    {
      type: 'forwarding_control',
      id: 'enable_forwarding',
      action: 'enable',
      nextStepId: 'show_message',
    },
    {
      type: 'message',
      id: 'show_message',
      text: 'Write your question.',
    },
  ]
};
