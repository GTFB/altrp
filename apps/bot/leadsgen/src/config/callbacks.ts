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
  
};

export const callbackActions = {
  
  "start_onboarding_button": {
    action: "go_to_step",
    nextStepId: "onboarding_asking_name"
  },
  "start_conversation": {
    action: "start_flow",
    flowName: "start_conversation"
  },
  "help": {
    action: "start_flow",
    flowName: "help"
  },

} as const;


// Legacy callbacks removed - now only callbackActions is used

// TypeScript types
//export type CommandHandler = keyof typeof commands;
export type CallbackActionType = 'start_flow' | 'go_to_step' | 'go_to_flow' | 'set_variable';

export interface CallbackActionConfig {
  action: CallbackActionType;
  flowName?: string;    // For start_flow
  nextStepId?: string;      // For go_to_step
  variable?: string;    // For set_variable
  value?: any;          // For set_variable
  nextFlow?: string;    // For transition to next flow after action
  nextStepId?: string;    // For transition to next step after action
}
