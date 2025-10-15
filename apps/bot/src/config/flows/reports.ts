import type { BotFlow } from '../../core/flow-types';

export const reportsFlow: BotFlow = {
  name: 'reports',
  description: 'Reports',
  steps: [
    {
      type: 'message',
      id: 'select_report',
      messageKey: 'select_report',
      keyboardKey: 'select_report'
    },
    {
      type: 'dynamic',
      id: 'handle_get_payments',
      handler: 'getPayments',//
      nextStep: 'select_report'
    },
    {
      type: 'dynamic',
      id: 'handle_get_expenses',
      handler: 'getExpenses',//
      keyboardKey: 'add_new_expense',
    },
    {
      type: 'wait_input',
      id: 'add_new_expense_amount',
      prompt: 'add_new_expense_amount',
      saveToVariable: 'expense.amount',
      nextStep: 'add_new_expense_description'
    },
    {
      type: 'wait_input',
      id: 'add_new_expense_description',
      prompt: 'add_new_expense_description',
      saveToVariable: 'expense.description',
      nextStep: 'handle_create_expense'
    },
    {
      type: 'handler',
      id: 'handle_create_expense',
      handlerName: 'createExpense',
      nextStep: 'handle_get_expenses'
    },
  ]
};
