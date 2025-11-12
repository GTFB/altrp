import type { BotFlow } from '../../core/flow-types';

export const startFlow: BotFlow = {
  name: 'start',
  description: 'Primary organization card filling process',
  steps: [
    {
      type: 'message',
      id: 'send_welcome',
      text: `🚀 <b>LeadsGen Bot 1:</b> Automatic 24/7 Lead Collector<b>LeadsGen Bot</b> is an effective tool for automating the collection of contact data (leads) and prequalification of clients.`,
      keyboardKey: 'start_onboarding_button'
    }
  ]
};
