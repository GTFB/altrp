import { UserContextManager } from './user-context';
import { MessageService } from './message-service';
//import { I18nService } from './i18n';
import type { FlowStepType, MessageStep, WaitInputStep, CallbackStep, ConditionStep, HandlerStep, FlowStep, ForwardingControlStep, DynamicStep, DynamicCallbackStep } from './flow-types';
import { flows } from '../config/flows/index';
import { callbackActions } from '../config/callbacks';
//import { messages, keyboards } from '../config/callbacks';
import { keyboards } from '../config/callbacks';

export class FlowEngine {
  constructor(
    private userContextManager: UserContextManager,
    private messageService: MessageService,
    //private i18nService: I18nService,
    private customHandlers: Record<string, Function> = {},
    private adminChatId?: number // Optional admin chat ID for topic flows
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
        case 'dynamic_callback':
          await this.handleDynamicCallbackStep(telegramId, step as DynamicCallbackStep);
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
      currentStep: 0,
      flowInTopic: false, // Regular flow, not in topic
      topicId: null,
      adminChatId: null,
      targetUserId: null
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

  /**
   * Start flow in topic mode (admin manages flow in user's topic)
   */
  async startTopicFlow(adminId: number, topicId: number, flowName: string, targetUserId?: number, adminChatId?: number): Promise<void> {
    console.log(`🎬 Starting topic flow "${flowName}" for admin ${adminId} in topic ${topicId}`);
    
    const flow = flows[flowName];
    if (!flow) {
      console.error(`❌ Flow ${flowName} not found`);
      return;
    }

    // Get admin context (should be created before calling this method)
    const adminContext = await this.userContextManager.getContext(adminId);
    if (!adminContext) {
      console.error(`❌ Admin ${adminId} context not found. Please create context first.`);
      return;
    }

    // Get adminChatId from parameter, class property, or context
    const adminChatIdValue = adminChatId || this.adminChatId || adminContext.adminChatId || null;
    if (!adminChatIdValue) {
      console.error(`❌ Admin chat ID not configured. Please provide adminChatId parameter.`);
      return;
    }

    // Enter flow mode for admin
    await this.userContextManager.enterFlowMode(adminId);

    // Update context with topic flow information
    await this.userContextManager.updateContext(adminId, {
      currentFlow: flowName,
      currentStep: 0,
      flowInTopic: true,
      topicId: topicId,
      adminChatId: adminChatIdValue,
      targetUserId: targetUserId || null
    });

    // Save targetUserId in flow data if provided
    if (targetUserId) {
      await this.userContextManager.setVariable(adminId, 'targetUserId', targetUserId);
    }

    console.log(`✅ Topic flow "${flowName}" started for admin ${adminId} in topic ${topicId}, total steps: ${flow.steps.length}`);

    // Execute first step
    if (flow.steps.length > 0) {
      if (flow.steps[0]) {
        await this.executeStep(adminId, flow.steps[0]);
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
      currentStep: 0,
      flowInTopic: false,
      topicId: null,
      adminChatId: null,
      targetUserId: null
    });

    console.log(`✅ Flow completed for user ${telegramId}`);
  }

  private async handleMessageStep(telegramId: number, step: MessageStep): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;
    
    // Use text property directly from step
    const message = step.text;

    console.log(`💬 Sending message to user ${telegramId}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    const keyboard = step.keyboardKey ? keyboards[step.keyboardKey as keyof typeof keyboards] : undefined;
    
    // Check if flow is in topic mode
    if (context.flowInTopic && context.topicId && context.adminChatId) {
      // Send to topic
      if (keyboard) {
        await this.messageService.sendMessageWithKeyboardToTopic(
          context.adminChatId,
          context.topicId,
          message,
          keyboard
        );
        console.log(`⏳ Message with keyboard sent to topic, waiting for admin interaction...`);
      } else {
        await this.messageService.sendMessageToTopic(
          context.adminChatId,
          context.topicId,
          message
        );
        
        // If no keyboard, go to next step
        if (step.nextStepId) {
          await this.goToStepInternal(telegramId, step.nextStepId);
        } else {
          console.log(`🏁 No next step defined, completing flow for admin ${telegramId}`);
          await this.completeFlow(telegramId);
        }
      }
    } else {
      // Regular flow mode - send to user
      if (keyboard) {
        await this.messageService.sendMessageWithKeyboard(telegramId, message, keyboard, context.humanId);
        console.log(`⏳ Message with keyboard sent, waiting for user interaction...`);
      } else {
        await this.messageService.sendMessage(telegramId, message, context.humanId);
        
        // If no keyboard, go to next step
        if (step.nextStepId) {
          await this.goToStepInternal(telegramId, step.nextStepId);
        } else {
          console.log(`🏁 No next step defined, completing flow for user ${telegramId}`);
          await this.completeFlow(telegramId);
        }
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

    // Use text property directly from step
    const message = step.text;
    
    // Check if flow is in topic mode
    if (context.flowInTopic && context.topicId && context.adminChatId) {
      await this.messageService.sendMessageToTopic(
        context.adminChatId,
        context.topicId,
        message
      );
    } else {
      await this.messageService.sendMessage(telegramId, message, context.humanId);
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

    const message = step.buttons.map(b => b.text).join(' or ') + '?'; // Temporary message

    // Check if flow is in topic mode
    if (context.flowInTopic && context.topicId && context.adminChatId) {
      await this.messageService.sendMessageWithKeyboardToTopic(
        context.adminChatId,
        context.topicId,
        message,
        keyboard
      );
    } else {
      await this.messageService.sendMessageWithKeyboard(
        telegramId, 
        message,
        keyboard, 
        context.humanId
      );
    }
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
      
      const context = await this.userContextManager.getContext(telegramId);
      if (!context) return;
      
      // Validation if specified
      if (waitingState.validation && !this.validateInput(messageText, waitingState.validation)) {
        console.log(`❌ Validation failed for user ${telegramId}`);
        const errorMessage = waitingState.validation.errorMessage || 'Invalid input format';
        
        // Check if flow is in topic mode
        if (context.flowInTopic && context.topicId && context.adminChatId) {
          await this.messageService.sendMessageToTopic(
            context.adminChatId,
            context.topicId,
            errorMessage
          );
        } else {
          await this.messageService.sendMessage(
            telegramId, 
            errorMessage, 
            context.humanId
          );
        }
        return;
      }

      // Save response to the variable
      await this.userContextManager.setVariable(telegramId, waitingState.saveToVariable, messageText);
      
      // Also save to qualification.answers array
      const currentStep = await this.userContextManager.getVariable(telegramId, 'qualification.currentStep');
      if (currentStep && currentStep.stepNumber && currentStep.questionText) {
        const answers = await this.userContextManager.getVariable(telegramId, 'qualification.answers') || [];
        // Check if answer for this step already exists (update) or add new
        const existingIndex = answers.findIndex((a: any) => a.step === currentStep.stepNumber);
        const answerEntry = {
          step: currentStep.stepNumber,
          text: currentStep.questionText,
          answer: messageText
        };
        
        if (existingIndex >= 0) {
          answers[existingIndex] = answerEntry;
        } else {
          answers.push(answerEntry);
        }
        
        await this.userContextManager.setVariable(telegramId, 'qualification.answers', answers);
        console.log(`💾 Saved answer to qualification.answers array: step ${currentStep.stepNumber}`);
      }
      
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

  /**
   * Handle incoming message from topic (admin in topic flow)
   */
  async handleTopicMessage(adminId: number, messageText: string): Promise<void> {
    console.log(`📥 Handling incoming topic message from admin ${adminId}: "${messageText}"`);
    
    // Check if admin is in topic flow mode
    const context = await this.userContextManager.getContext(adminId);
    if (!context || !context.flowInTopic) {
      console.log(`⚠️ Admin ${adminId} is not in topic flow mode`);
      return;
    }

    // Use the same logic as handleIncomingMessage
    await this.handleIncomingMessage(adminId, messageText);
  }

  private async handleDynamicStep(telegramId: number, step: DynamicStep): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;

    const handler = this.customHandlers[step.handler];
    if (handler) {
      try {
        const dynamicMessage = await handler(telegramId, this.userContextManager);

        const keyboard = step.keyboardKey ? keyboards[step.keyboardKey as keyof typeof keyboards] : undefined;
        
        // Check if flow is in topic mode
        if (context.flowInTopic && context.topicId && context.adminChatId) {
          if (keyboard) {
            await this.messageService.sendMessageWithKeyboardToTopic(
              context.adminChatId,
              context.topicId,
              dynamicMessage,
              keyboard
            );
          } else {
            await this.messageService.sendMessageToTopic(
              context.adminChatId,
              context.topicId,
              dynamicMessage
            );
          }
        } else {
          if (keyboard) {
            await this.messageService.sendMessageWithKeyboard(
              telegramId, 
              dynamicMessage, 
              keyboard, 
              context.humanId
            );
          } else {
            await this.messageService.sendMessage(
              telegramId, 
              dynamicMessage, 
              context.humanId
            );
          }
        }

        if (step.nextStepId) {
          await this.goToStepInternal(telegramId, step.nextStepId);
        }
        else if(step.nextStepId === ''){
          await this.completeFlow(telegramId);
        }

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

  private async handleDynamicCallbackStep(telegramId: number, step: DynamicCallbackStep): Promise<void> {
    const context = await this.userContextManager.getContext(telegramId);
    if (!context) return;

    const handler = this.customHandlers[step.handler];
    if (handler) {
      try {
        // Handler should return { message: string, buttons: Array<{text: string, value: any}> }
        const result = await handler(telegramId, this.userContextManager);
        
        if (!result || !result.message || !result.buttons) {
          console.error(`❌ Dynamic callback handler ${step.handler} must return {message, buttons}`);
          await this.completeFlow(telegramId);
          return;
        }

        // Generate callback_data for each button using prefix system
        const prefix = step.callbackPrefix || `dc_${step.id}`; // Default prefix: dc_<stepId>
        console.log(`🔧 Generating dynamic callback buttons with prefix: ${prefix}`);
        
        const keyboard = {
          inline_keyboard: [
            result.buttons.map((button: { text: string; value: any }) => {
              // Create short callback_data: prefix_id_value
              // Example: dc_select_course_123
              const callbackData = `${prefix}_${button.value}`;
              console.log(`🔘 Generated callback_data: ${callbackData} for button: ${button.text}`);
              
              // Check length limit (64 bytes for Telegram)
              if (callbackData.length > 64) {
                console.warn(`⚠️ Callback data too long: ${callbackData} (${callbackData.length} chars)`);
                // Truncate value if needed
                const maxValueLength = 64 - prefix.length - 1; // -1 for underscore
                const truncatedValue = button.value.toString().substring(0, maxValueLength);
                return {
                  text: button.text,
                  callback_data: `${prefix}_${truncatedValue}`
                };
              }
              
              return {
                text: button.text,
                callback_data: callbackData
              };
            })
          ]
        };

        // Check if flow is in topic mode
        if (context.flowInTopic && context.topicId && context.adminChatId) {
          await this.messageService.sendMessageWithKeyboardToTopic(
            context.adminChatId,
            context.topicId,
            result.message,
            keyboard
          );
        } else {
          await this.messageService.sendMessageWithKeyboard(
            telegramId, 
            result.message, 
            keyboard, 
            context.humanId
          );
        }

        // Don't go to next step automatically - wait for callback
        console.log(`⏳ Dynamic callback step "${step.id}" sent, waiting for user selection...`);

      } catch (error) {
        console.error(`❌ Error in dynamic callback step handler ${step.handler}:`, error);
        await this.completeFlow(telegramId);
      }
    } else {
      console.error(`❌ Dynamic callback handler ${step.handler} not found`);
      await this.completeFlow(telegramId);
    }
  }

  private async handleOnboardingStepCallback(telegramId: number, callbackData: string): Promise<void> {
    console.log(`🔘 Handling qualification step callback: ${callbackData}`);
    
    // Check if user is in onboarding flow
    const context = await this.userContextManager.getContext(telegramId);
    if (!context || context.currentFlow !== 'onboarding') {
      console.error(`❌ User ${telegramId} is not in onboarding flow`);
      return;
    }
    
    // Parse callback_data: qualification_step_<stepOrder>_<value>
    // Example: qualification_step_1_a
    const parts = callbackData.split('_');
    if (parts.length < 4) {
      console.error(`❌ Invalid qualification step callback format: ${callbackData}`);
      return;
    }
    
    const stepOrder = parseInt(parts[2]);
    const value = parts.slice(3).join('_'); // In case value contains underscores
    
    if (isNaN(stepOrder)) {
      console.error(`❌ Invalid step order in callback: ${callbackData}`);
      return;
    }
    
    console.log(`🔍 Qualification step ${stepOrder}, value: ${value}`);
    
    // Get saveToVariable from currentStep context (same format as text answers)
    const currentStep = await this.userContextManager.getVariable(telegramId, 'qualification.currentStep');
    let saveToVariable: string;
    
    if (currentStep && currentStep.saveToVariable) {
      // Use saveToVariable from currentStep if available
      saveToVariable = currentStep.saveToVariable;
    } else {
      // Fallback to default format: qualification.answer_N
      saveToVariable = `qualification.answer_${stepOrder}`;
    }
    
    // Save the selected value to the same variable format as text answers
    // e.g., qualification.answer_3, qualification.answer_4, etc.
    await this.userContextManager.setVariable(telegramId, saveToVariable, value);
    console.log(`💾 Saved value "${value}" to variable "${saveToVariable}"`);
    
    // Also save to qualification.answers array
    if (currentStep && currentStep.stepNumber && currentStep.questionText) {
      const answers = await this.userContextManager.getVariable(telegramId, 'qualification.answers') || [];
      // Check if answer for this step already exists (update) or add new
      const existingIndex = answers.findIndex((a: any) => a.step === currentStep.stepNumber);
      const answerEntry = {
        step: currentStep.stepNumber,
        text: currentStep.questionText,
        answer: value
      };
      
      if (existingIndex >= 0) {
        answers[existingIndex] = answerEntry;
      } else {
        answers.push(answerEntry);
      }
      
      await this.userContextManager.setVariable(telegramId, 'qualification.answers', answers);
      console.log(`💾 Saved answer to qualification.answers array: step ${currentStep.stepNumber}`);
    }
    
    // Go to next step (loop back to handler)
    await this.goToStepInternal(telegramId, 'load_next_onboarding_step');
  }

  private async handleDynamicCallback(telegramId: number, callbackData: string): Promise<void> {
    console.log(`🔘 Handling dynamic callback: ${callbackData}`);
    
    // Parse callback_data: dc_<stepId>_<value>
    // Example: dc_select_course_123
    // We need to find the stepId by looking at the current flow steps
    
    // First, get the current flow
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
    
    // Find all dynamic_callback steps in the current flow
    const dynamicCallbackSteps = flow.steps.filter(s => s.type === 'dynamic_callback') as DynamicCallbackStep[];
    
    // Try to match callback_data with each step's prefix
    let matchedStep: DynamicCallbackStep | null = null;
    let value: string = '';
    
    for (const step of dynamicCallbackSteps) {
      const prefix = step.callbackPrefix || `dc_${step.id}`;
      if (callbackData.startsWith(prefix + '_')) {
        matchedStep = step;
        value = callbackData.substring(prefix.length + 1); // Remove prefix + '_'
        break;
      }
    }
    
    if (!matchedStep) {
      console.error(`❌ No matching dynamic callback step found for: ${callbackData}`);
      console.log(`Available dynamic callback steps:`, dynamicCallbackSteps.map(s => s.id));
      return;
    }
    
    console.log(`🔍 Matched step: ${matchedStep.id}, value: ${value}`);
    
    // Save the selected value
    await this.userContextManager.setVariable(telegramId, matchedStep.saveToVariable, value);
    
    // Navigate to next step or flow
    if (matchedStep.nextFlow) {
      console.log(`🚀 Starting next flow: ${matchedStep.nextFlow}`);
      await this.startFlow(telegramId, matchedStep.nextFlow);
    } else if (matchedStep.nextStepId) {
      console.log(`📍 Going to next step: ${matchedStep.nextStepId}`);
      await this.goToStepInternal(telegramId, matchedStep.nextStepId);
    } else {
      console.log(`🏁 No next step defined, completing flow`);
      await this.completeFlow(telegramId);
    }
  }

  /**
   * Handle incoming callback from topic (admin in topic flow)
   */
  async handleTopicCallback(adminId: number, callbackData: string): Promise<void> {
    console.log(`🔘 Handling incoming topic callback from admin ${adminId}: ${callbackData}`);
    
    // Check if admin is in topic flow mode
    const context = await this.userContextManager.getContext(adminId);
    if (!context || !context.flowInTopic) {
      console.log(`⚠️ Admin ${adminId} is not in topic flow mode`);
      return;
    }

    // Use the same logic as handleIncomingCallback
    await this.handleIncomingCallback(adminId, callbackData);
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
          console.log(`📍 Going to step: ${callbackConfig.nextStepId}`);
          await this.goToStepInternal(telegramId, callbackConfig.nextStepId!);
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

        case 'handler':
          console.log(`🛠️ Executing custom handler "${callbackConfig.handlerName}" for callback "${callbackData}"`);
          const handler = this.customHandlers[callbackConfig.handlerName!];
          if (handler) {
            try {
              // Pass callbackData to handler so it can access the callback information
              await handler(telegramId, this.userContextManager, callbackData);
            } catch (error) {
              console.error(`❌ Error in custom handler "${callbackConfig.handlerName}":`, error);
            }
          } else {
            console.error(`❌ Custom handler "${callbackConfig.handlerName}" not found`);
          }
          // Go to next flow or step if specified (after handler execution)
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
    
    // Check for qualification step callback pattern (prefix-based)
    if (callbackData.startsWith('qualification_step_')) {
      console.log(`🔘 Processing qualification step callback: ${callbackData}`);
      await this.handleOnboardingStepCallback(telegramId, callbackData);
      return;
    }
    
    // Check for dynamic callback pattern (prefix-based)
    if (callbackData.startsWith('dc_')) {
      console.log(`🔘 Processing dynamic callback: ${callbackData}`);
      await this.handleDynamicCallback(telegramId, callbackData);
      return;
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
          if (data.nextStepId) {
            await this.goToStepInternal(telegramId, data.nextStepId);
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
