import type { BotFlow } from '../../core/flow-types';

export const editLanguageFlow: BotFlow = {
  name: 'edit_language',
  description: 'Language change',
  steps: [
    {
      type: 'message',
      id: 'send_lang',
      messageKey: 'selectLanguage',
      keyboardKey: 'edit_lang'
    },
    {
      type: 'handler',
      id: 'save_edited_language',
      handlerName: 'saveLang',
      nextStep: 'redirect_to_profile'
    },
    {
      type: 'flow',
      id: 'redirect_to_profile',
      flowName: 'profile',
    }
  ]
};
