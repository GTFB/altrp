import type { BotFlow } from '../../core/flow-types';

export const startRegistrationFlow: BotFlow = {
  name: 'start_registration',
  description: 'Language check and action selection',
  steps: [
    {
      type: 'handler',
      id: 'register_user',
      handlerName: 'registerUser',
      nextStep: 'check_language_and_route'
    },
    {
      type: 'handler',
      id: 'check_language_and_route',
      handlerName: 'checkLanguageAndRoute'
      // Handler decides where to go: send_lang or onboarding
    },
    {
      type: 'message',
      id: 'send_lang',
      messageKey: 'selectLanguage',
      keyboardKey: 'lang'
      // Language value is saved through callbackActions in callbacks.ts
      // sr/ru buttons save selection in profile.language and start onboarding
    },
    {
      type: 'handler',
      id: 'save_language',
      handlerName: 'saveLang',
      nextStep: 'redirect_to_onboarding'
    },
    {
      type: 'flow',
      id: 'redirect_to_onboarding',
      flowName: 'onboarding',
    }
  ]
};
