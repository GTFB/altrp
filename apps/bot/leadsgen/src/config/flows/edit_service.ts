import type { BotFlow } from '../../core/flow-types';

export const editServiceFlow: BotFlow = {
  name: 'edit_service',
  description: 'Service editing',
  steps: [
    {
      type: 'dynamic',
      id: 'show_profile_service',
      handler: 'generateServiceCard',
      keyboardKey: 'edit_service',
    },
    {
      type: 'wait_input',
      id: 'ask_to_new_service_name',
      prompt: 'ask_to_invoice_service_name',//
      saveToVariable: 'mainService.name',
      nextStepId: 'save_new_service'
    },
    {
      type: 'handler',
      id: 'save_new_service',
      handlerName: 'createMainService',//
      nextStepId: 'redirect_to_profile'
    },
    {
      type: 'wait_input',
      id: 'ask_to_edit_service_name',
      prompt: 'ask_to_invoice_service_name',//
      saveToVariable: 'mainService.name',
      nextStepId: 'update_main_service'
    },
    {
      type: 'handler',
      id: 'update_main_service',
      handlerName: 'updateMainService',//
      nextStepId: 'redirect_to_profile'
    },
    {
      type: 'flow',
      id: 'redirect_to_profile',
      flowName: 'profile',
    }
  ]
};
