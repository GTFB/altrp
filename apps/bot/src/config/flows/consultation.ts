import type { BotFlow } from '../../core/flow-types';

export const consultationFlow: BotFlow = {
  name: 'consultation',
  description: 'Consultation request',
  steps: [
    {
      type: 'message',
      id: 'send_consultation_greeting',
      messageKey: 'consultation_greeting',
      keyboardKey: 'consultation'
    },
    {
      type: 'wait_input',
      id: 'ask_to_lawyer',
      prompt: 'ask_to_lawyer',
      saveToVariable: 'consultation.request',
      nextStep: 'consultation_auto_answer'
    },
    {
      type: 'wait_input',
      id: 'ask_to_accountant',
      prompt: 'ask_to_accountant',
      saveToVariable: 'consultation.request',
      nextStep: 'consultation_auto_answer'
    },
    {
      type: 'message',
      id: 'consultation_auto_answer',
      messageKey: 'consultation_auto_answer',
      nextStep: 'handle_consultation_request'
    },
    {
      type: 'handler',
      id: 'handle_consultation_request',
      handlerName: 'processConsultationRequest',
      nextStep: ''
    },
  ]
};
