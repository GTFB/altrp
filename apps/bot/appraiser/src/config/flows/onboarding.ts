import type { BotFlow } from '../../core/flow-types';

export const onboardingFlow: BotFlow = {
  name: 'onboarding',
  description: 'Primary organization card filling process with dynamic steps from database',
  steps: [
    {
      type: 'handler',
      id: 'load_next_onboarding_step',
      handlerName: 'loadNextOnboardingStep'
    }
  ]
};
