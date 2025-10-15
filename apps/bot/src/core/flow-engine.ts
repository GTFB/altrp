import { UserContextManager } from './user-context';
import { MessageService } from './message-service';
import { I18nService } from './i18n';
import type { FlowStepType, MessageStep, WaitInputStep, CallbackStep, ConditionStep, HandlerStep, FlowStep, ForwardingControlStep, DynamicStep } from './flow-types';
import { flows } from '../config/flows/index';
import { callbackActions } from '../config/callbacks';
//import { messages, keyboards } from '../config/callbacks';
import { keyboards } from '../config/callbacks';

export class FlowEngine {
  constructor(
    private userContextManager: UserContextManager,
    private messageService: MessageService,
    private i18nService: I18nService,
    private customHandlers: Record<string, Function> = {}
  ) {
    
  }

  setCustomHandlers(handlers: Record<string, Function>): void {
    this.customHandlers = handlers;
  }

  async executeStep(telegramId: number, step: FlowStepType): Promise<void> {
    console.log(`🎯 Executing step "${step.id}" (${step.type}) for user ${telegramId}`);
    
    try {
      switch (step.type) {
        case 'message':
          await this.handleMessageStep(telegramId, step as MessageStep);
          break;
        case 'wait_input':
          await this.handleWaitInputStep(telegramId, step as WaitInputStep);
          break;
        case 'callback':
          await this.handleCallbackStep(telegramId, step as CallbackStep);
          break;
        case 'condition':
          await this.handleConditionStep(telegramId, step as ConditionStep);
          break;
        case 'handler':
          await this.handleHandlerStep(telegramId, step as HandlerStep);
          break;
        case 'flow':
          await this.handleFlowStep(telegramId, step as FlowStep);
          break;
        case 'dynamic':
          await this.handleDynamicStep(telegramId, step as DynamicStep);
          break;
        case 'forwarding_control':
          await this.handleForwardingControlStep(telegramId, step as ForwardingControlStep);
          break;
        // flow_control removed - now automatically in startFlow/completeFlow
        default:
          console.error(`❌ Unknown step type: ${(step as any).type}`);
      }
    } catch (error) {
      console.error(`❌ Error executing step for user ${telegramId}:`, error);
    }
  }

  async startFlow(telegramId: number, flowName: string): Promise<void> {
    console.log(`🎬 Starting flow "${flowName}" for user ${telegramId}`);
    
    const flow = flows[flowName];
    if (!flow) {
      console.error(`❌ Flow ${flowName} not found`);
      return;
    }

    // Automatically enter flow mode when starting any flow
    await this.userContextManager.enterFlowMode(telegramId);

    await this.userContextManager.updateContext(telegramId, {
      currentFlow: flowName,
      currentStep: 0
    });

    console.log(`✅ Flow "${flowName}" started for user ${telegramId}, total steps: ${flow.steps.length}`);

    // Execute first step
    if (flow.steps.length > 0) {
      if (flow.steps[0]) {
        await this.executeStep(telegramId, flow.steps[0]);
      }
    } else {
      console.warn(`⚠️ Flow "${flowName}" has no steps`);
    }
  }

  // Public method for external calls
  async goToStep(telegramId: number, stepIdentifier: string | number): Promise<void> {
    return this.goToStepInternal(telegramId, stepIdentifier);
  }

  private async goToStepInternal(telegramId: number, stepIdentifier: string | number): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context || !context.currentFlow) {
      console.error(`❌ No active flow for user ${telegramId}`);
      return;
    }

    const flow = flows[context.currentFlow];
    if (!flow) {
      console.error(`❌ Flow ${context.currentFlow} not found`);
      return;
    }

    let stepIndex = -1;
    
    if (typeof stepIdentifier === 'string') {
      // Search by ID
      stepIndex = flow.steps.findIndex(step => step.id === stepIdentifier);
    } else {
      // Use step number
      stepIndex = stepIdentifier;
    }

    if (stepIndex === -1 || stepIndex >= flow.steps.length) {
      console.error(`❌ Step "${stepIdentifier}" not found in flow ${context.currentFlow}`);
      return;
    }

    console.log(`📍 Going to step ${stepIndex} ("${stepIdentifier}") for user ${telegramId}`);
    
    await this.userContextManager.updateContext(telegramId, {
      currentStep: stepIndex
    });

    const step = flow.steps[stepIndex];
    if (step) {
      await this.executeStep(telegramId, step);
    }
  }

  async completeFlow(telegramId: number): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;

    console.log(`🏁 Completing flow "${context.currentFlow}" for user ${telegramId}`);
    
    // Automatically exit flow mode when completing
    await this.userContextManager.exitFlowMode(telegramId);
    
    await this.userContextManager.updateContext(telegramId, {
      currentFlow: '',
      currentStep: 0
    });

    console.log(`✅ Flow completed for user ${telegramId}`);
  }

  private async handleMessageStep(telegramId: number, step: MessageStep): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;
    
    // Get user language through UserContextManager
    const userLanguage = await this.userContextManager.getUserLanguage(telegramId);
    const message = await this.i18nService.getMessage(step.messageKey, userLanguage);
    
    if (!message) {
      console.error(`❌ Message key "${step.messageKey}" not found`);
      return;
    }

    console.log(`💬 Sending message to user ${telegramId}: "${step.messageKey}" (${message}) [lang: ${userLanguage}]`);

    const keyboard = step.keyboardKey ? keyboards[step.keyboardKey as keyof typeof keyboards] : undefined;
    
    if (keyboard) {
      await this.messageService.sendMessageWithKeyboard(telegramId, message, keyboard, context.userId);
      
      // If there is a keyboard, do NOT automatically go to next step
      // Transition will only happen on button press
      console.log(`⏳ Message with keyboard sent, waiting for user interaction...`);
    } else {
      await this.messageService.sendMessage(telegramId, message, context.userId);
      
      // If no keyboard, go to next step
      if (step.nextStepId) {
        await this.goToStepInternal(telegramId, step.nextStepId);
      } else {
        // If no nextStepId - complete flow
        console.log(`🏁 No next step defined, completing flow for user ${telegramId}`);
        await this.completeFlow(telegramId);
      }
    }
  }

  private async handleWaitInputStep(telegramId: number, step: WaitInputStep): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;
    
    console.log(`⏳ Setting up wait input for user ${telegramId}, saving to: ${step.saveToVariable}`);
    
    // Set input waiting state
    await this.userContextManager.setVariable(telegramId, '_system.waitingForInput', {
      stepId: step.id,
      saveToVariable: step.saveToVariable,
      validation: step.validation,
      nextStepId: step.nextStepId
    });

    if (step.prompt) {
      // Get user language and translated message
      const userLanguage = await this.userContextManager.getUserLanguage(telegramId);
      const message = await this.i18nService.getMessage(step.prompt, userLanguage);
      await this.messageService.sendMessage(telegramId, message, context.userId);
    }
  }

  private async handleCallbackStep(telegramId: number, step: CallbackStep): Promise<void> {
    console.log(`🔘 Creating callback buttons for user ${telegramId}`, step.buttons);
    
    // Create keyboard from step buttons
    const keyboard = {
      inline_keyboard: [
        step.buttons.map(button => ({
          text: button.text,
          callback_data: JSON.stringify({
            stepId: step.id,
            value: button.value,
            saveToVariable: button.saveToVariable,
            nextStepId: button.nextStepId,
            nextFlow: button.nextFlow
          })
        }))
      ]
    };

    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;

    // Send message with buttons (can add messageKey to CallbackStep if needed)
    await this.messageService.sendMessageWithKeyboard(
      telegramId, 
      step.buttons.map(b => b.text).join(' or ') + '?', // Temporary message
      keyboard, 
      context.userId
    );
  }

  private async handleConditionStep(telegramId: number, step: ConditionStep): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;
    
    console.log(`🔀 Evaluating condition for user ${telegramId}: ${step.condition}`);
    
    const result = this.evaluateCondition(step.condition, { globalObject: context.data });
    console.log(`🔀 Condition result: ${result}`);
    
    if (result) {
      if (step.trueFlow) {
        await this.startFlow(telegramId, step.trueFlow);
      } else if (step.trueStep) {
        await this.goToStepInternal(telegramId, step.trueStep);
      }
    } else {
      if (step.falseFlow) {
        await this.startFlow(telegramId, step.falseFlow);
      } else if (step.falseStep) {
        await this.goToStepInternal(telegramId, step.falseStep);
      }
    }
  }

  private async handleHandlerStep(telegramId: number, step: HandlerStep): Promise<void> {
    console.log(`🛠️ Executing custom handler "${step.handlerName}" for user ${telegramId}`);
    
    const handler = this.customHandlers[step.handlerName];
    if (handler) {
      try {
        await handler(telegramId, this.userContextManager);
      } catch (error) {
        console.error(`❌ Error in custom handler "${step.handlerName}":`, error);
      }
    } else {
      console.error(`❌ Custom handler "${step.handlerName}" not found`);
    }

    //TODO Add step type check?
    if (step.nextStepId) {
      await this.goToStepInternal(telegramId, step.nextStepId);
    }
    // else {
    //   // If no nextStepId - complete flow
    //   console.log(`🏁 Handler step completed with no next step, completing flow for user ${telegramId}`);
    //   await this.completeFlow(telegramId);
    // }
  }

  private async handleFlowStep(telegramId: number, step: FlowStep): Promise<void> {
    console.log(`🎭 Transitioning to flow "${step.flowName}" for user ${telegramId}`);
    await this.startFlow(telegramId, step.flowName);
  }

  private async handleForwardingControlStep(telegramId: number, step: ForwardingControlStep): Promise<void> {
    console.log(`📤 ${step.action === 'enable' ? 'Enabling' : 'Disabling'} message forwarding for user ${telegramId}`);
    
    if (step.action === 'enable') {
      await this.userContextManager.enableMessageForwarding(telegramId);
    } else {
      await this.userContextManager.disableMessageForwarding(telegramId);
    }

    if (step.nextStepId) {
      await this.goToStepInternal(telegramId, step.nextStepId);
    }
  }

  // handleFlowControlStep removed - now automatically in startFlow/completeFlow

  private evaluateCondition(condition: string, globalObject: any): boolean {
    try {
      const func = new Function('globalObject', `return ${condition}`);
      return func(globalObject);
    } catch (error) {
      console.error(`❌ Error evaluating condition: ${condition}`, error);
      return false;
    }
  }

  // Universal incoming message handler
  async handleIncomingMessage(telegramId: number, messageText: string): Promise<void> {
    console.log(`📥 Handling incoming message from user ${telegramId}: "${messageText}"`);
    
    const waitingState = await this.userContextManager.getVariable(telegramId, '_system.waitingForInput');
    
    if (waitingState) {
      console.log(`⏳ User ${telegramId} was waiting for input, processing...`);
      
      // Validation if specified
      if (waitingState.validation && !this.validateInput(messageText, waitingState.validation)) {
        const context = await this.userContextManager.getContext(telegramId);
        if (!context) return;
        
        console.log(`❌ Validation failed for user ${telegramId}`);
        await this.messageService.sendMessage(
          telegramId, 
          waitingState.validation.errorMessage || 'Invalid input format', 
          context.userId
        );
        return;
      }

      // Save response
      await this.userContextManager.setVariable(telegramId, waitingState.saveToVariable, messageText);
      
      // Clear waiting state
      await this.userContextManager.setVariable(telegramId, '_system.waitingForInput', null);
      
      // Go to next step
      if (waitingState.nextStepId) {
        await this.goToStepInternal(telegramId, waitingState.nextStepId);
      }
    } else {
      console.log(`💬 User ${telegramId} not waiting for input, message ignored in flow context`);
    }
  }

  private async handleDynamicStep(telegramId: number, step: DynamicStep): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;

    const handler = this.customHandlers[step.handler];
    if (handler) {
      try {
        const dynamicMessage = await handler(telegramId, this.userContextManager);

        const keyboard = step.keyboardKey ? keyboards[step.keyboardKey as keyof typeof keyboards] : undefined;
        
        if (keyboard) {
          await this.messageService.sendMessageWithKeyboard(
            telegramId, 
            dynamicMessage, 
            keyboard, 
            context.userId
          );
        } else {
          await this.messageService.sendMessage(
            telegramId, 
            dynamicMessage, 
            context.userId
          );
        }

        if (step.nextStepId) {
          await this.goToStepInternal(telegramId, step.nextStepId);
        }
        else if(step.nextStepId === ''){
          await this.completeFlow(telegramId);
        }
        //  else {
        //   await this.completeFlow(telegramId);
        // }

      } catch (error) {
        console.error(`❌ Error in dynamic step handler ${step.handler}:`, error);
        if (step.nextStepId) {
          await this.goToStepInternal(telegramId, step.nextStepId);
        } else {
          await this.completeFlow(telegramId);
        }
      }
    } else {
      console.error(`❌ Dynamic handler ${step.handler} not found`);
      await this.completeFlow(telegramId);
    }
  }

  // Universal callback handler
  async handleIncomingCallback(telegramId: number, callbackData: string): Promise<void> {
    console.log(`🔘 Handling incoming callback from user ${telegramId}: ${callbackData}`);
    
    // FIRST check callback configuration
    const callbackConfig = callbackActions[callbackData as keyof typeof callbackActions] as any;
    if (callbackConfig) {
      console.log(`🎯 Found callback config for "${callbackData}":`, callbackConfig);
      
      switch (callbackConfig.action) {
        case 'start_flow':
          console.log(`🚀 Starting flow: ${callbackConfig.flowName}`);
          await this.startFlow(telegramId, callbackConfig.flowName!);
          return;
          
        case 'go_to_step':
          console.log(`📍 Going to step: ${callbackConfig.stepId}`);
          await this.goToStepInternal(telegramId, callbackConfig.stepId!);
          return;

        case 'set_variable':
          console.log(`💾 Setting variable: ${callbackConfig.variable} = ${callbackConfig.value}`);
          if (callbackConfig.variable && callbackConfig.value !== undefined) {
            await this.userContextManager.setVariable(telegramId, callbackConfig.variable, callbackConfig.value);
          }
          // Go to next flow if specified
          if (callbackConfig.nextFlow) {
            console.log(`🚀 Starting next flow: ${callbackConfig.nextFlow}`);
            await this.startFlow(telegramId, callbackConfig.nextFlow);
          } else if (callbackConfig.nextStepId) {
            console.log(`📍 Going to next step: ${callbackConfig.nextStepId}`);
            await this.goToStepInternal(telegramId, callbackConfig.nextStepId);
          }
          return;
          
        default:
          console.log(`⚠️ Unknown callback action: ${(callbackConfig as any).action}`);
      }
    }
    
    // If not in configuration - try JSON format
    try {
      const data = JSON.parse(callbackData);
      console.log(`📋 Parsed callback data:`, data);
      
      // Process different action types in JSON
      switch (data.action) {
        case 'set_variable':
          console.log(`💾 Setting variable: ${data.variable} = ${data.value}`);
          if (data.variable && data.value !== undefined) {
            await this.userContextManager.setVariable(telegramId, data.variable, data.value);
          }
          // Go to next flow if specified
          if (data.nextFlow) {
            console.log(`🚀 Starting next flow: ${data.nextFlow}`);
            await this.startFlow(telegramId, data.nextFlow);
          } else if (data.nextStepId) {
            await this.goToStepInternal(telegramId, data.nextStepId);
          }
          break;
          
        case 'start_flow':
          if (data.flowName) {
            await this.startFlow(telegramId, data.flowName);
          }
          break;
          
        case 'go_to_step':
          if (data.stepId) {
            await this.goToStepInternal(telegramId, data.stepId);
          }
          break;
          
        default:
          // Legacy support for old format (saveToVariable)
          if (data.saveToVariable) {
            await this.userContextManager.setVariable(telegramId, data.saveToVariable, data.value);
          }
          // Go to next step or flow
          if (data.nextFlow) {
            await this.startFlow(telegramId, data.nextFlow);
          } else if (data.nextStepId) {
            await this.goToStepInternal(telegramId, data.nextStepId);
          }
      }
    } catch (error) {
      console.error('❌ Error parsing callback data:', error);
      
      // Last attempt - processing through keyboard callback (for users in flow)
      console.log(`🔄 Trying to handle as keyboard callback: ${callbackData}`);
      await this.handleKeyboardCallback(telegramId, callbackData);
    }
  }

  private async handleKeyboardCallback(telegramId: number, callbackData: string): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;
    
    const flow = flows[context.currentFlow];

    console.log(`🔍 Handling keyboard callback for user ${telegramId}:`);
    console.log(`  - Callback data: ${callbackData}`);
    console.log(`  - Current flow: ${context.currentFlow}`);
    console.log(`  - Current step: ${context.currentStep}`);
    console.log(`  - Flow exists: ${!!flow}`);
    console.log(`  - Flow steps count: ${flow?.steps?.length || 0}`);

    if (!flow || !flow.steps[context.currentStep]) {
      console.log(`❌ No current step found for keyboard callback`);
      console.log(`  - Flow: ${!!flow ? 'exists' : 'missing'}`);
      console.log(`  - Step index ${context.currentStep} valid: ${flow ? context.currentStep < flow.steps.length : 'N/A'}`);
      return;
    }

    const currentStep = flow.steps[context.currentStep];
    console.log(`  - Current step type: ${currentStep?.type}`);
    console.log(`  - Current step ID: ${currentStep?.id}`);
    
    // Check if current step is a message step with keyboard
    if (currentStep && currentStep.type === 'message' && (currentStep as MessageStep).keyboardKey) {
      console.log(`🎯 Processing keyboard callback for message step "${currentStep.id}"`);
      console.log(`  - Keyboard key: ${(currentStep as MessageStep).keyboardKey}`);
      console.log(`  - Next step: ${(currentStep as MessageStep).nextStepId}`);
      
      // Save callback data as variable 
      await this.userContextManager.setVariable(telegramId, `keyboard.${callbackData}`, callbackData);
      
      // Configuration already processed in handleIncomingCallback, here only fallback
      
      // Go to next step, if specified
      if ((currentStep as MessageStep).nextStepId) {
        console.log(`🚀 Going to next step: ${(currentStep as MessageStep).nextStepId}`);
        await this.goToStepInternal(telegramId, (currentStep as MessageStep).nextStepId!);
      } else {
        console.log(`⚠️ No next step defined for message step`);
      }
    } else {
      console.log(`⚠️ Current step is not a message step with keyboard, callback ignored`);
      console.log(`  - Step type: ${currentStep?.type}`);
      console.log(`  - Has keyboard: ${currentStep?.type === 'message' ? !!(currentStep as MessageStep).keyboardKey : 'N/A'}`);
    }
  }

  private validateInput(input: string, validation: any): boolean {
    switch (validation.type) {
      case 'text':
        return input.trim().length > 0;
      case 'number':
        return !isNaN(Number(input));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      default:
        return true;
    }
  }
}
