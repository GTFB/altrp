export const keyboards = {
  start_onboarding_button: {
    inline_keyboard: [[
      {
        text: "🚀 Начать",
        callback_data: "start_onboarding_button"
      }
    ]]
  },
  matcher_role_keyboard: {
    inline_keyboard: [[
      {
        text: "Предлагаю",
        callback_data: "matcher_role_offer"
      },
      {
        text: "Ищу",
        callback_data: "matcher_role_search"
      }
    ]]
  },
  matcher_offer_summary: {
    inline_keyboard: [[
      {
        text: "Подтвердить",
        callback_data: "matcher_offer_confirm"
      }
    ]]
  }
};

export const callbackActions = {
  start_onboarding_button: {
    action: "handler",
    handlerName: "matcherStartOnboardingHandler"
  },
  matcher_role_offer: {
    action: "handler",
    handlerName: "matcherHandleRoleOffer"
  },
  matcher_role_search: {
    action: "handler",
    handlerName: "matcherHandleRoleSeek"
  },
  matcher_offer_confirm: {
    action: "handler",
    handlerName: "matcherConfirmOfferHandler"
  }
} as const;


// Legacy callbacks removed - now only callbackActions is used

// TypeScript types
//export type CommandHandler = keyof typeof commands;
export type CallbackActionType = 'start_flow' | 'go_to_step' | 'go_to_flow' | 'set_variable' | 'handler';

export interface CallbackActionConfig {
  action: CallbackActionType;
  flowName?: string;    // For start_flow
  nextStepId?: string;      // For go_to_step
  variable?: string;    // For set_variable
  value?: any;          // For set_variable
  nextFlow?: string;    // For transition to next flow after action
  handlerName?: string; // For handler action - name of custom handler
}
