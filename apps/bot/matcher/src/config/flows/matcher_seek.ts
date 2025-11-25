import type { BotFlow } from '../../core/flow-types';

export const matcherSeekFlow: BotFlow = {
  name: 'matcher_seek',
  description: 'Collect seeker request and show matches',
  steps: [
    {
      type: 'wait_input',
      id: 'matcher_seek_description',
      text: 'Опишите, что именно вы ищете:',
      saveToVariable: 'matcher.seek.description',
      nextStepId: 'matcher_seek_process'
    },
    {
      type: 'handler',
      id: 'matcher_seek_process',
      handlerName: 'matcherHandleSeekDescription'
    }
  ]
};

