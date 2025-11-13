export const keyboards = {

  start_onboarding_button: {
    inline_keyboard: [[
      {
        text: "🚀 Start",
        callback_data: "start_onboarding_button"
      },
    ]]
  },
  main_menu: {
    inline_keyboard: [
      [
        {
          text: "Start a conversation",
          callback_data: "start_conversation"
        },
      ],
      [
        {
          text: "Help",
          callback_data: "help"
        },
      ],
    ]
  },
  status_menu: {
    inline_keyboard: [
      [
        {
          text: "💡 New",
          callback_data: "new_lead_status"
        },
        {
          text: "🔥 Hot",
          callback_data: "hot_lead_status"
        },
        {
          text: "💰 Sell",
          callback_data: "sell_lead_status"
        },
      ],
    ]
  },
  
};

export const callbackActions = {
  
  "start_onboarding_button": {
    action: "start_flow",
    flowName: "onboarding"
  },
  "start_conversation": {
    action: "start_flow",
    flowName: "start_conversation"
  },
  "help": {
    action: "start_flow",
    flowName: "help"
  },
  "new_lead_status": {
    action: "handler",
    handlerName: "setStatusHandler"
    // Optional: nextStepId or nextFlow can be added here if handler should transition
    // Example: nextStepId: "next_step" or nextFlow: "some_flow"
  },
  "hot_lead_status": {
    action: "handler",
    handlerName: "setStatusHandler"
  },
  "sell_lead_status": {
    action: "handler",
    handlerName: "setStatusHandler"
  },

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
