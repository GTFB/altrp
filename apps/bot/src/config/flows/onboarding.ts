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
      nextStep: 'pib'
    },
    {
      type: 'wait_input',
      id: 'pib',
      prompt: 'pib',
      saveToVariable: 'company.pib',
      nextStep: 'okved'
    },
    {
      type: 'wait_input',
      id: 'okved',
      prompt: 'okved',
      saveToVariable: 'company.okved',
      nextStep: 'mainService'
    },
    {
      type: 'wait_input',
      id: 'mainService',
      prompt: 'mainService',
      saveToVariable: 'mainService.name',
      nextStep: 'phone'
    },
    {
      type: 'wait_input',
      id: 'phone',
      prompt: 'phone',
      saveToVariable: 'company.phone',
      nextStep: 'email'
    },
    {
      type: 'wait_input',
      id: 'email',
      prompt: 'email',
      saveToVariable: 'company.email',
      nextStep: 'create_company_handler'
    },
    {
      type: 'handler',
      id: 'create_company_handler',
      handlerName: 'createCompanyAndMainService',
      nextStep: 'onboardingThanks'
    },
    {
      type: 'message',
      id: 'onboardingThanks',
      messageKey: 'onboardingThanks',
      nextStep: 'redirect_to_main_menu'
    },
    {
      type: 'flow',
      id: 'redirect_to_main_menu',
      flowName: 'menu',
    }
  ]
};
