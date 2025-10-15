import type { BotFlow, FlowStepType } from '../../core/flow-types';

export const flows: Record<string, BotFlow> = {

  // Main flow for /start command (registration + welcome)
  start_registration: {
    name: 'start_registration',
    description: 'Language check and action selection',
    steps: [
      {
        type: 'handler',
        id: 'register_user',
        handlerName: 'registerUser',
        nextStep: 'check_language_and_route'
      },
      {
        type: 'handler',
        id: 'check_language_and_route',
        handlerName: 'checkLanguageAndRoute'
        // Handler decides where to go: send_lang or onboarding
      },
      {
        type: 'message',
        id: 'send_lang',
        messageKey: 'selectLanguage',
        keyboardKey: 'lang'
        // Language value is saved through callbackActions in callbacks.ts
        // sr/ru buttons save selection in profile.language and start onboarding
      },
      {
        type: 'handler',
        id: 'save_language',
        handlerName: 'saveLang',
        nextStep: 'redirect_to_onboarding'
      },
      {
        type: 'flow',
        id: 'redirect_to_onboarding',
        flowName: 'onboarding',
      }
    ]
  },


  onboarding: {
    name: 'onboarding',
    description: 'Primary organization card filling process',
    steps: [
      {
        type: 'handler',
        id: 'check_user_company',
        handlerName: 'checkUserCompany'
        // Handler decides where to go: main_menu or send_welcome
      },
      {
        type: 'message',
        id: 'send_welcome',
        messageKey: 'welcome',
        keyboardKey: 'start_creating_company'
      },
      {
        type: 'wait_input',
        id: 'ask_company_name',
        prompt: 'companyName',
        saveToVariable: 'company.name',
        nextStep: 'pib'
      },
      {
        type: 'wait_input',
        id: 'pib',
        prompt: 'pib',
        saveToVariable: 'company.pib',
        nextStep: 'okved'
      },
      {
        type: 'wait_input',
        id: 'okved',
        prompt: 'okved',
        saveToVariable: 'company.okved',
        nextStep: 'mainService'
      },
      {
        type: 'wait_input',
        id: 'mainService',
        prompt: 'mainService',
        saveToVariable: 'mainService.name',
        nextStep: 'phone'
      },
      {
        type: 'wait_input',
        id: 'phone',
        prompt: 'phone',
        saveToVariable: 'company.phone',
        nextStep: 'email'
      },
      {
        type: 'wait_input',
        id: 'email',
        prompt: 'email',
        saveToVariable: 'company.email',
        nextStep: 'create_company_handler'
      },
      {
        type: 'handler',
        id: 'create_company_handler',
        handlerName: 'createCompanyAndMainService',
        nextStep: 'onboardingThanks'
      },
      {
        type: 'message',
        id: 'onboardingThanks',
        messageKey: 'onboardingThanks',
        nextStep: 'redirect_to_main_menu'
      },
      {
        type: 'flow',
        id: 'redirect_to_main_menu',
        flowName: 'menu',
      }
    ]
  },

  
  menu: {
    name: 'menu',
    description: 'Main menu',
    steps: [
      {
        type: 'message',
        id: 'show_main_menu',
        messageKey: 'mainMenu',
        keyboardKey: 'main_menu'
      },
    ]
  },


  create_invoice: {
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
  },

  consultation: {
    name: 'consultation',
    description: 'Consultation request',
    steps: [
      {
        type: 'message',
        id: 'send_consultation_greeting',
        messageKey: 'consultation_greeting',
        keyboardKey: 'consultation'
      },
      {
        type: 'wait_input',
        id: 'ask_to_lawyer',
        prompt: 'ask_to_lawyer',
        saveToVariable: 'consultation.request',
        nextStep: 'consultation_auto_answer'
      },
      {
        type: 'wait_input',
        id: 'ask_to_accountant',
        prompt: 'ask_to_accountant',
        saveToVariable: 'consultation.request',
        nextStep: 'consultation_auto_answer'
      },
      {
        type: 'message',
        id: 'consultation_auto_answer',
        messageKey: 'consultation_auto_answer',
        nextStep: 'handle_consultation_request'
      },
      {
        type: 'handler',
        id: 'handle_consultation_request',
        handlerName: 'processConsultationRequest',
        nextStep: ''
      },
    ]
  },


  doc_templates: {
    name: 'doc_templates',
    description: 'Template request',
    steps: [
      {
        type: 'message',
        id: 'select_template',
        messageKey: 'select_template',
        keyboardKey: 'select_template'
      },
      {
        type: 'handler',
        id: 'handle_get_template',
        handlerName: 'getTemplate',
        nextStep: 'template_auto_answer'
      },
      {
        type: 'message',
        id: 'template_auto_answer',
        messageKey: 'template_auto_answer',
        nextStep: ''
      },
    ]
  },

  reports: {
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
  },

  profile: {
    name: 'profile',
    description: 'Profile editing menu',
    steps: [
      {
        type: 'dynamic',
        id: 'select_profile_item',
        handler: 'getProfile',
        keyboardKey: 'select_profile_item'
      },
    ]
  },

  edit_company_name: {
    name: 'edit_company_name',
    description: 'Company name change',
    steps: [
      {
        type: 'wait_input',
        id: 'edit_company_name',
        prompt: 'companyName',
        saveToVariable: 'company.name',
        nextStep: 'edit_company_name_handler'
      },
      {
        type: 'handler',
        id: 'edit_company_name_handler',
        handlerName: 'updateCompany',
        nextStep: 'redirect_to_profile'
      },
      {
        type: 'flow',
        id: 'redirect_to_profile',
        flowName: 'profile',
      }
    ]
  },

  edit_company_pib: {
    name: 'edit_company_pib',
    description: 'Company PIB change',
    steps: [
      {
        type: 'wait_input',
        id: 'edit_company_pib',
        prompt: 'pib',
        saveToVariable: 'company.pib',
        nextStep: 'edit_company_pib_handler'
      },
      {
        type: 'handler',
        id: 'edit_company_pib_handler',
        handlerName: 'updateCompany',
        nextStep: 'redirect_to_profile'
      },
      {
        type: 'flow',
        id: 'redirect_to_profile',
        flowName: 'profile',
      }
    ]
  },


  edit_company_okved: {
    name: 'edit_company_okved',
    description: 'Company OKVED change',
    steps: [
      {
        type: 'wait_input',
        id: 'edit_company_okved',
        prompt: 'okved',
        saveToVariable: 'company.okved',
        nextStep: 'edit_company_okved_handler'
      },
      {
        type: 'handler',
        id: 'edit_company_okved_handler',
        handlerName: 'updateCompany',
        nextStep: 'redirect_to_profile'
      },
      {
        type: 'flow',
        id: 'redirect_to_profile',
        flowName: 'profile',
      }
    ]
  },

  edit_language: {
    name: 'edit_language',
    description: 'Language change',
    steps: [
      {
        type: 'message',
        id: 'send_lang',
        messageKey: 'selectLanguage',
        keyboardKey: 'edit_lang'
      },
      {
        type: 'handler',
        id: 'save_edited_language',
        handlerName: 'saveLang',
        nextStep: 'redirect_to_profile'
      },
      {
        type: 'flow',
        id: 'redirect_to_profile',
        flowName: 'profile',
      }
    ]
  },

  edit_service: {
    name: 'edit_service',
    description: 'Service editing',
    steps: [
      {
        type: 'dynamic',
        id: 'show_profile_service',
        handler: 'generateServiceCard',
        keyboardKey: 'edit_service',
      },
      {
        type: 'wait_input',
        id: 'ask_to_new_service_name',
        prompt: 'ask_to_invoice_service_name',//
        saveToVariable: 'mainService.name',
        nextStep: 'save_new_service'
      },
      {
        type: 'handler',
        id: 'save_new_service',
        handlerName: 'createMainService',//
        nextStep: 'redirect_to_profile'
      },
      {
        type: 'wait_input',
        id: 'ask_to_edit_service_name',
        prompt: 'ask_to_invoice_service_name',//
        saveToVariable: 'mainService.name',
        nextStep: 'update_main_service'
      },
      {
        type: 'handler',
        id: 'update_main_service',
        handlerName: 'updateMainService',//
        nextStep: 'redirect_to_profile'
      },
      {
        type: 'flow',
        id: 'redirect_to_profile',
        flowName: 'profile',
      }
    ]
  },


};