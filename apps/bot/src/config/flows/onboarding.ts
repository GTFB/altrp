import type { BotFlow } from '../../core/flow-types';

export const onboardingFlow: BotFlow = {
  name: 'onboarding',
  description: 'Primary organization card filling process',
  steps: [
    {
      type: 'handler',
      id: 'check_user_company',
      handlerName: 'checkUserCompany'
      // Handler decides where to go: main_menu or send_welcome
    },
    {
      type: 'message',
      id: 'send_welcome',
      messageKey: 'welcome',
      keyboardKey: 'start_creating_company'
    },
    {
      type: 'wait_input',
      id: 'ask_company_name',
      prompt: 'companyName',
      saveToVariable: 'company.name',
      nextStepId: 'pib'
    },
    {
      type: 'wait_input',
      id: 'pib',
      prompt: 'pib',
      saveToVariable: 'company.pib',
      nextStepId: 'okved'
    },
    {
      type: 'wait_input',
      id: 'okved',
      prompt: 'okved',
      saveToVariable: 'company.okved',
      nextStepId: 'mainService'
    },
    {
      type: 'wait_input',
      id: 'mainService',
      prompt: 'mainService',
      saveToVariable: 'mainService.name',
      nextStepId: 'phone'
    },
    {
      type: 'wait_input',
      id: 'phone',
      prompt: 'phone',
      saveToVariable: 'company.phone',
      nextStepId: 'email'
    },
    {
      type: 'wait_input',
      id: 'email',
      prompt: 'email',
      saveToVariable: 'company.email',
      nextStepId: 'create_company_handler'
    },
    {
      type: 'handler',
      id: 'create_company_handler',
      handlerName: 'createCompanyAndMainService',
      nextStepId: 'onboardingThanks'
    },
    {
      type: 'message',
      id: 'onboardingThanks',
      messageKey: 'onboardingThanks',
      nextStepId: 'redirect_to_main_menu'
    },
    {
      type: 'flow',
      id: 'redirect_to_main_menu',
      flowName: 'menu',
    }
  ]
};
