export interface BaseFlowStep {
  type: 'message' | 'wait_input' | 'callback' | 'condition' | 'handler' | 'flow' | 'delay' | 'forwarding_control' | 'dynamic';
  id?: string; // Уникальный ID шага для навигации
}

export interface MessageStep extends BaseFlowStep {
  type: 'message';
  messageKey: string;
  keyboardKey?: string;
  nextStep?: string | number; // ID следующего шага или номер
}

export interface WaitInputStep extends BaseFlowStep {
  type: 'wait_input';
  prompt?: string; // Текст запроса (опционально)
  saveToVariable: string; // Путь куда сохранить ответ (например: "onboarding.name")
  validation?: {
    type: 'text' | 'number' | 'email' | 'phone' | 'url';
    pattern?: string; // regex для валидации
    errorMessage?: string;
  };
  nextStep?: string | number;
}

export interface CallbackStep extends BaseFlowStep {
  type: 'callback';
  buttons: Array<{
    text: string;
    value: any; // Значение которое сохраняется
    saveToVariable?: string; // Куда сохранить значение
    nextStep?: string | number; // Следующий шаг для этой кнопки
    nextFlow?: string; // Следующий флоу для этой кнопки
  }>;
}

export interface ConditionStep extends BaseFlowStep {
  type: 'condition';
  condition: string; // JS условие как строка
  trueStep?: string | number; // Шаг если условие true
  falseStep?: string | number; // Шаг если условие false
  trueFlow?: string; // Флоу если условие true
  falseFlow?: string; // Флоу если условие false
}

export interface HandlerStep extends BaseFlowStep {
  type: 'handler';
  handlerName: string; // Имя кастомного обработчика
  nextStep?: string | number;
}

export interface FlowStep extends BaseFlowStep {
  type: 'flow';
  flowName: string; // Имя флоу для перехода
  returnStep?: string | number; // Куда вернуться после завершения флоу
}

export interface DelayStep extends BaseFlowStep {
  type: 'delay';
  duration: number; // Задержка в миллисекундах
  nextStep?: string | number;
}

export interface ForwardingControlStep extends BaseFlowStep {
  type: 'forwarding_control';
  action: 'enable' | 'disable'; // Включить или отключить пересылку
  nextStep?: string | number;
}

export interface DynamicStep extends BaseFlowStep {
  type: 'dynamic';
  handler: string; // кастомный handler (из customHandlers)
  keyboardKey?: string;
  nextStep?: string | number;
}

// FlowControlStep удален - теперь автоматически управляется при startFlow/completeFlow

export type FlowStepType = MessageStep | WaitInputStep | CallbackStep | ConditionStep | 
                          HandlerStep | FlowStep | DelayStep | ForwardingControlStep | DynamicStep;

export interface BotFlow {
  name: string;
  description?: string;
  steps: FlowStepType[];
}
