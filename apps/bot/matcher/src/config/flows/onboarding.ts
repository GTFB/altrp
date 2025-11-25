import type { BotFlow } from '../../core/flow-types';

export const onboardingFlow: BotFlow = {
  name: 'onboarding',
  description: 'Matcher onboarding flow for offers and requests',
  steps: [
    {
      type: 'message',
      id: 'send_welcome',
      text: '👋 <b>Matcher</b> поможет найти товары или услуги внутри сообщества.\nНажмите кнопку, чтобы пройти короткий онбординг.',
      keyboardKey: 'start_onboarding_button'
    },
    {
      type: 'wait_input',
      id: 'onboarding_asking_name',
      text: 'Как вас зовут?',
      saveToVariable: 'onboarding.name',
      nextStepId: 'onboarding_asking_email'
    },
    {
      type: 'wait_input',
      id: 'onboarding_asking_email',
      text: 'Укажите email для связи:',
      saveToVariable: 'onboarding.email',
      validation: {
        type: 'email',
        errorMessage: 'Пожалуйста, укажите корректный email'
      },
      nextStepId: 'onboarding_choose_role'
    },
    {
      type: 'message',
      id: 'onboarding_choose_role',
      text: 'В какой роли вы регистрируетесь?',
      keyboardKey: 'matcher_role_keyboard'
    }
  ]
};
