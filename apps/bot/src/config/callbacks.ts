// Keyboards
export const keyboards = {
  lang: {
    inline_keyboard: [[
      {
        text: "🇷🇸 Srpski",
        callback_data: "lang_select_sr"
      },
      {
        text: "🇷🇺 Russian",
        callback_data: "lang_select_ru"
      }
    ]]
  },
  edit_lang: {
    inline_keyboard: [[
      {
        text: "🇷🇸 Srpski",
        callback_data: "save_edited_language_sr"
      },
      {
        text: "🇷🇺 Russian",
        callback_data: "save_edited_language_ru"
      }
    ]]
  },

  start_creating_company: {
    inline_keyboard: [[
      {
        text: "Start setup",
        callback_data: "start_creating_company_step"
      },
    ]]
  },
  main_menu: {
    inline_keyboard: [
      [
        {
          text: "📄 Create invoice",
          callback_data: "create_invoice"
        },
      ],
      [
        {
          text: "📊 Reports",
          callback_data: "reports"
        },
      ],
      [
        {
          text: "📁 Templates",
          callback_data: "doc_templates"
        },
      ],
      [
        {
          text: "💡 Help and consultations",
          callback_data: "consultation"
        },
      ],
      [
        {
          text: "⚙️ My profile",
          callback_data: "profile"
        },
      ],
    ]
  },
  consultation: {
    inline_keyboard: [[
      {
        text: "⚖️ Lawyer",
        callback_data: "consultation_lawyer"
      },
      {
        text: "🧾 Accountant",
        callback_data: "consultation_accountant"
      }
    ]]
  },
  client_card_buttons: {
    inline_keyboard: [[
      {
        text: "Continue",
        callback_data: "show_main_service"
      },
      {
        text: "New client",
        callback_data: "create_invoice"
      }
    ]]
  },
  service_card_buttons: {
    inline_keyboard: [[
      {
        text: "Yes, correct",
        callback_data: "ask_to_invoice_amount"
      },
      {
        text: "Enter different service",
        callback_data: "ask_to_invoice_service_name"
      }
    ]]
  },

  edit_service: {
    inline_keyboard: [[
      {
        text: "Edit",
        callback_data: "edit_service_name"
      },
      {
        text: "Add different service",
        callback_data: "add_new_service_name"
      }
    ]]
  },

  invoice_card_buttons: {
    inline_keyboard: [[
      {
        text: "All correct",
        callback_data: "confirm_invoice_data"
      },
      {
        text: "Create new",
        callback_data: "create_invoice"
      }
    ]]
  },

  select_template: {
    inline_keyboard: [[
      {
        text: "📄 Contract",
        callback_data: "get_contract_template"
      },
      {
        text: "✅ Work completion certificate",
        callback_data: "get_act_template"
      }
    ]]
  },

  select_report: {
    inline_keyboard: [[
      {
        text: "📈 Income / Payments",
        callback_data: "get_payments"
      },
      {
        text: "📉 Expenses",
        callback_data: "get_expenses"
      }
    ]]
  },

  add_new_expense: {
    inline_keyboard: [[
      {
        text: "Add new expense",
        callback_data: "add_new_expense"
      },
    ]]
  },

  select_profile_item: {
    inline_keyboard: [
      [
        {
          text: "Company name",
          callback_data: "edit_company_name"
        },
      ],
      [
        {
          text: "PIB",
          callback_data: "edit_company_pib"
        },
      ],
      [
        {
          text: "OKVED",
          callback_data: "edit_company_okved"
        },
      ],
      [
        {
          text: "Main service",
          callback_data: "edit_service"
        },
      ],
      [
        {
          text: "Change language",
          callback_data: "edit_language"
        }
      ],
    ]
  },

  // subscription: {
  //   inline_keyboard: [
  //     [
  //       {
  //         text: "👉 Our Telegram",
  //         url: "https://t.me/ml_cosmetic"
  //       }
  //     ],
  //     [
  //       {
  //         text: "✨Ready! Check!",
  //         callback_data: "check_subscription"
  //       }
  //     ]
  //   ]
  // }
};

// Commands and their handlers
export const commands = {
  "/start": "start",
  "/help": "help", 
  "/confirmed": "confirmed",
  "/not_confirmed": "notConfirmed"
} as const;

// Callback button configuration - what to do when pressed
// export const callbackActions = {
//   "start_flow": {
//     action: "start_flow", // Start flow
//     flowName: "subscription"
//   },
//   "check_subscription": {
//     action: "go_to_step", // Go to step
//     stepId: "ask_vk_link"
//   }
// } as const;
// Unique actions for each context
export const callbackActions = {
  // Language selection during registration
  "lang_select_sr": {
    action: "set_variable",
    variable: "profile.language",
    value: "sr",
    //nextFlow: "onboarding"
    nextStepId: "save_language"
  },
  "lang_select_ru": {
    action: "set_variable", 
    variable: "profile.language",
    value: "ru",
    //nextFlow: "onboarding"
    nextStepId: "save_language"
  },

  "save_edited_language_sr": {
    action: "set_variable",
    variable: "profile.language",
    value: "sr",
    nextStepId: "save_edited_language"
  },
  "save_edited_language_ru": {
    action: "set_variable", 
    variable: "profile.language",
    value: "ru",
    nextStepId: "save_edited_language"
  },

  // Onboarding navigation
  "start_creating_company_step": {
    action: "go_to_step",
    stepId: "ask_company_name"
  },

  "consultation": {
    action: "start_flow",
    flowName: "consultation"
  },

  "reports": {
    action: "start_flow",
    flowName: "reports"
  },

  "get_payments": {
    action: "go_to_step",
    stepId: "handle_get_payments"
  },
  "get_expenses": {
    action: "go_to_step",
    stepId: "handle_get_expenses"
  },
  


  "doc_templates": {
    action: "start_flow",
    flowName: "doc_templates"
  },

  "create_invoice": {
    action: "start_flow",
    flowName: "create_invoice"
  },

  "confirm_invoice_data": {
    action: "go_to_step",
    stepId: "confirm_invoice_data"
  },

  "show_main_service": {
    action: "go_to_step",
    stepId: "show_main_service"
  },
  "ask_to_invoice_service_name": {
    action: "go_to_step",
    stepId: "ask_to_invoice_service_name"
  },
  "ask_to_invoice_amount": {
    action: "go_to_step",
    stepId: "ask_to_invoice_amount"
  },

  "add_new_expense": {
    action: "go_to_step",
    stepId: "add_new_expense_amount"
  },

  "consultation_lawyer": {
    action: "set_variable",
    variable: "consultation.type",
    value: "lawyer",
    nextStepId: "ask_to_lawyer"
  },
  "consultation_accountant": {
    action: "set_variable",
    variable: "consultation.type",
    value: "accountant", 
    nextStepId: "ask_to_accountant"
  },

  //Template requests
  "get_contract_template": {
    action: "set_variable",
    variable: "need_template.type",
    value: "contract", 
    nextStepId: "handle_get_template"
  },

  "get_act_template": {
    action: "set_variable",
    variable: "need_template.type",
    value: "act", 
    nextStepId: "handle_get_template"
  },

  //profile
  "profile": {
    action: "start_flow",
    flowName: "profile"
  },

  "edit_company_name": {
    action: "start_flow",
    flowName: "edit_company_name"
  },

  "edit_company_pib": {
    action: "start_flow",
    flowName: "edit_company_pib"
  },

  "edit_company_okved": {
    action: "start_flow",
    flowName: "edit_company_okved"
  },

  "edit_service": {
    action: "start_flow",
    flowName: "edit_service"
  },

  "edit_language": {
    action: "start_flow",
    flowName: "edit_language"
  },


  "edit_service_name": {
    action: "go_to_step",
    stepId: "ask_to_edit_service_name"
  },
  "add_new_service_name": {
    action: "go_to_step",
    stepId: "ask_to_new_service_name"
  },
  



  // Global actions
  "restart_bot": {
    action: "start_flow",
    flowName: "start_registration"
  },


  

} as const;


// Legacy callbacks removed - now only callbackActions is used

// TypeScript types
export type CommandHandler = keyof typeof commands;
export type CallbackActionType = 'start_flow' | 'go_to_step' | 'go_to_flow' | 'set_variable';

export interface CallbackActionConfig {
  action: CallbackActionType;
  flowName?: string;    // For start_flow
  stepId?: string;      // For go_to_step
  variable?: string;    // For set_variable
  value?: any;          // For set_variable
  nextFlow?: string;    // For transition to next flow after action
  nextStepId?: string;    // For transition to next step after action
}
