import type { BotFlow } from '../../core/flow-types';

export const onboardingFlow: BotFlow = {
  name: 'onboarding',
  description: 'Primary organization card filling process',
  steps: [
    // {
    //   type: 'handler',
    //   id: 'check_human',
    //   handlerName: 'checkHuman'
    // },
    {
      type: 'message',
      id: 'send_welcome',
      text: `🚀 <b>LeadsGen Bot:</b> Automatic 24/7 Lead Collector<b>LeadsGen Bot</b> is an effective tool for automating the collection of contact data (leads) and prequalification of clients.`,
      keyboardKey: 'start_onboarding_button'
    },
    {
      type: 'wait_input',
      id: 'onboarding_asking_name',
      text: 'Enter a name:',
      saveToVariable: 'human.name',
      nextStepId: 'onboarding_asking_email'
    },
    {
      type: 'wait_input',
      id: 'onboarding_asking_email',
      text: 'Specify the email address:',
      saveToVariable: 'human.email',
      nextStepId: 'onboarding_thanks'
    },
    {
      type: 'message',
      id: 'onboarding_thanks',
      text: 'Thanks for registering!',
      nextStepId: 'onboarding_main_menu'
    },
    {
      type: 'flow',
      id: 'onboarding_main_menu',
      flowName: 'menu',
    }
  ]
};
