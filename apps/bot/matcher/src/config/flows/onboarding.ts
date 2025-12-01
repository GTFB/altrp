import type { BotFlow } from '../../core/flow-types';

export const onboardingFlow: BotFlow = {
  name: 'onboarding',
  description: 'Matcher onboarding flow for offers and requests',
  steps: [
    {
      type: 'message',
      id: 'send_welcome',
      text: '👋 <b>Matcher</b> will help you find products or services within the community.\nClick the button to complete a short onboarding.',
      keyboardKey: 'start_onboarding_button'
    },
    {
      type: 'wait_input',
      id: 'onboarding_asking_name',
      text: 'What is your name?',
      saveToVariable: 'hmn.name',
      nextStepId: 'onboarding_asking_email'
    },
    {
      type: 'wait_input',
      id: 'onboarding_asking_email',
      text: 'Please provide your email:',
      saveToVariable: 'hmn.email',
      validation: {
        type: 'email',
        errorMessage: 'Please provide a valid email'
      },
      nextStepId: 'onboarding_save_user_data'
    },
    {
      type: 'handler',
      id: 'onboarding_save_user_data',
      handlerName: 'matcherSaveUserDataHandler',
      nextStepId: 'onboarding_choose_role'
    },
    {
      type: 'message',
      id: 'onboarding_choose_role',
      text: 'Choose role',
      keyboardKey: 'matcher_role_keyboard'
    }
  ]
};
