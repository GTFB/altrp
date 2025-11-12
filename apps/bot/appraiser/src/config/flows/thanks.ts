import type { BotFlow } from '../../core/flow-types';

export const thanksFlow: BotFlow = {
  name: 'thanks',
  description: 'thanks message',
  steps: [
    {
      type: 'message',
      id: 'send_thanks',
      text: `✅ Спасибо за регистрацию!`,
    }
  ]
};
