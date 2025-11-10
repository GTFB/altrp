export const keyboards = {};

export const callbackActions = {} as const;

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
