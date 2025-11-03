export interface BaseFlowStep {
  type: 'message' | 'wait_input' | 'callback' | 'condition' | 'handler' | 'flow' | 'delay' | 'forwarding_control' | 'dynamic' | 'dynamic_callback';
  id?: string; // Unique step ID for navigation
}

export interface MessageStep extends BaseFlowStep {
  type: 'message';
  //messageKey?: string;
  text: string;
  keyboardKey?: string;
  nextStepId?: string | number; // Next step ID or number
}

export interface WaitInputStep extends BaseFlowStep {
  type: 'wait_input';
  //prompt?: string; // Request text (optional)
  text: string;
  saveToVariable: string; // Path where to save response (e.g.: "onboarding.name")
  validation?: {
    type: 'text' | 'number' | 'email' | 'phone' | 'url';
    pattern?: string; // regex for validation
    errorMessage?: string;
  };
  nextStepId?: string | number;
}

export interface CallbackStep extends BaseFlowStep {
  type: 'callback';
  buttons: Array<{
    text: string;
    value: any; // Value that gets saved
    saveToVariable?: string; // Where to save value
    nextStepId?: string | number; // Next step for this button
    nextFlow?: string; // Next flow for this button
  }>;
}

export interface ConditionStep extends BaseFlowStep {
  type: 'condition';
  condition: string; // JS condition as string
  trueStep?: string | number; // Step if condition is true
  falseStep?: string | number; // Step if condition is false
  trueFlow?: string; // Flow if condition is true
  falseFlow?: string; // Flow if condition is false
}

export interface HandlerStep extends BaseFlowStep {
  type: 'handler';
  handlerName: string; // Custom handler name
  nextStepId?: string | number;
}

export interface FlowStep extends BaseFlowStep {
  type: 'flow';
  flowName: string; // Flow name for transition
  returnStep?: string | number; // Where to return after flow completion
}

export interface DelayStep extends BaseFlowStep {
  type: 'delay';
  duration: number; // Delay in milliseconds
  nextStepId?: string | number;
}

export interface ForwardingControlStep extends BaseFlowStep {
  type: 'forwarding_control';
  action: 'enable' | 'disable'; // Enable or disable forwarding
  nextStepId?: string | number;
}

export interface DynamicStep extends BaseFlowStep {
  type: 'dynamic';
  handler: string; // custom handler (from customHandlers)
  keyboardKey?: string;
  nextStepId?: string | number;
}

export interface DynamicCallbackStep extends BaseFlowStep {
  type: 'dynamic_callback';
  handler: string; // custom handler for generating buttons
  saveToVariable: string; // where to save selected value
  nextStepId?: string | number; // next step after selection
  nextFlow?: string; // next flow after selection
  callbackPrefix?: string; // custom prefix for callback_data (optional)
}

// FlowControlStep removed - now automatically managed at startFlow/completeFlow

export type FlowStepType = MessageStep | WaitInputStep | CallbackStep | ConditionStep | 
                          HandlerStep | FlowStep | DelayStep | ForwardingControlStep | DynamicStep | DynamicCallbackStep;

export interface BotFlow {
  name: string;
  description?: string;
  steps: FlowStepType[];
}
