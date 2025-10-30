import type { BotFlow } from '../../core/flow-types';

export const docTemplatesFlow: BotFlow = {
  name: 'doc_templates',
  description: 'Template request',
  steps: [
    {
      type: 'message',
      id: 'select_template',
      messageKey: 'select_template',
      keyboardKey: 'select_template'
    },
    {
      type: 'handler',
      id: 'handle_get_template',
      handlerName: 'getTemplate',
      nextStepId: 'template_auto_answer'
    },
    {
      type: 'message',
      id: 'template_auto_answer',
      messageKey: 'template_auto_answer',
      nextStepId: ''
    },
  ]
};
