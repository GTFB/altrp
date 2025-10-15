import type { BotFlow } from '../../core/flow-types';

export const createInvoiceFlow: BotFlow = {
  name: 'create_invoice',
  description: 'Create invoice',
  steps: [
    {
      type: 'wait_input',
      id: 'ask_to_client_pib',
      prompt: 'ask_to_client_pib',
      saveToVariable: 'client.pib',
      nextStep: 'searching_company_by_pib'
    },
    {
      type: 'handler',
      id: 'searching_company_by_pib',
      handlerName: 'searchingCompanyByPib',
    },
    {
      type: 'wait_input',
      id: 'ask_to_client_account',
      prompt: 'ask_to_client_account',
      saveToVariable: 'client.account_number',
      nextStep: 'ask_to_client_name'
    },
    {
      type: 'wait_input',
      id: 'ask_to_client_name',
      prompt: 'ask_to_client_name',
      saveToVariable: 'client.name',
      nextStep: 'ask_to_client_address'
    },
    {
      type: 'wait_input',
      id: 'ask_to_client_address',
      prompt: 'ask_to_client_address',
      saveToVariable: 'client.address',
      nextStep: 'saveClientCompany'
    },
    {
      type: 'handler',
      id: 'saveClientCompany',
      handlerName: 'saveClientCompany',
      nextStep: 'show_client_card'
    },
    {
      type: 'dynamic',
      id: 'show_client_card',
      handler: 'generateClientCard',
      keyboardKey: 'client_card_buttons',
      //nextStep: 'show_main_service'
    },
    {
      type: 'dynamic',
      id: 'show_main_service',
      handler: 'generateServiceCard',
      keyboardKey: 'service_card_buttons',
    },
    {
      type: 'wait_input',
      id: 'ask_to_invoice_service_name',
      prompt: 'ask_to_invoice_service_name',//
      saveToVariable: 'mainService.name',
      nextStep: 'save_invoice_service'
    },
    {
      type: 'handler',
      id: 'save_invoice_service',
      handlerName: 'createMainService',//
      nextStep: 'show_main_service'
    },
    {
      type: 'wait_input',
      id: 'ask_to_invoice_amount',
      prompt: 'ask_to_invoice_amount',
      saveToVariable: 'invoice.amount',
      nextStep: 'show_invoice'
    },
    {
      type: 'dynamic',
      id: 'show_invoice',
      handler: 'showInvoice',//
      keyboardKey: 'invoice_card_buttons',
    },
    {
      type: 'handler',
      id: 'confirm_invoice_data',
      handlerName: 'createInvoice',//
      nextStep: 'invoice_auto_answer'
    },
    {
      type: 'message',
      id: 'invoice_auto_answer',
      messageKey: 'invoice_auto_answer',
      nextStep: ''
    },
  ]
};
