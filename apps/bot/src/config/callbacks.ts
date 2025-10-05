// Сообщения бота
// export const messages = {
//   selectLanguage: `Izaberite jezik / Выберите язык:`,
//   welcome: `Добро пожаловать в bznrs! Ваш цифровой помощник для паушальцев. Давайте настроим ваш профиль.`,
//   companyName: `Введите полное название вашей фирмы.`,
//   pib: `Спасибо. Теперь введите ваш PIB (налоговый номер).`,
//   okved: `Отлично. Теперь введите ваш код деятельности (ОКВЭД).`,
//   mainService: `Введите вашу основную услугу (напр., 'Услуги программирования'). Мы будем использовать её как основу для быстрого создания счетов.`,
//   phone: `Спасибо. Теперь введите ваш контактный телефон.`,
//   email: `И напоследок, введите ваш email.`,
//   onboardingThanks: `Отлично, ваш профиль настроен! Теперь можно пользоваться главным меню.`,
//   consultation_greeting: `Выберите, к кому создать обращение.`,
//   ask_to_lawyer: `Опишите свой вопрос юристу.`,
//   ask_to_accountant: `Опишите свой вопрос бухгалтеру.`,
//   consultation_auto_answer: `Спасибо! Ваш вопрос успешно отправлен.`,
//   mainMenu: `Выберите раздел меню.`,

//   help: `Доступные команды:
// /start - начать работу
// /help - помощь`,

// };

// Клавиатуры
export const keyboards = {
  lang: {
    inline_keyboard: [[
      {
        text: "🇷🇸 Srpski",
        callback_data: "lang_select_sr"
      },
      {
        text: "🇷🇺 Русский",
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
        text: "🇷🇺 Русский",
        callback_data: "save_edited_language_ru"
      }
    ]]
  },

  start_creating_company: {
    inline_keyboard: [[
      {
        text: "Начать настройку",
        callback_data: "start_creating_company_step"
      },
    ]]
  },
  main_menu: {
    inline_keyboard: [
      [
        {
          text: "📄 Выставить счет",
          callback_data: "create_invoice"
        },
      ],
      [
        {
          text: "📊 Отчеты",
          callback_data: "reports"
        },
      ],
      [
        {
          text: "📁 Шаблоны",
          callback_data: "doc_templates"
        },
      ],
      [
        {
          text: "💡 Помощь и консультации",
          callback_data: "consultation"
        },
      ],
      [
        {
          text: "⚙️ Мой профиль",
          callback_data: "profile"
        },
      ],
    ]
  },
  consultation: {
    inline_keyboard: [[
      {
        text: "⚖️ Юрист",
        callback_data: "consultation_lawyer"
      },
      {
        text: "🧾 Бухгалтер",
        callback_data: "consultation_accountant"
      }
    ]]
  },
  client_card_buttons: {
    inline_keyboard: [[
      {
        text: "Продолжить",
        callback_data: "show_main_service"
      },
      {
        text: "Новый клиент",
        callback_data: "create_invoice"
      }
    ]]
  },
  service_card_buttons: {
    inline_keyboard: [[
      {
        text: "Да, верно",
        callback_data: "ask_to_invoice_amount"
      },
      {
        text: "Ввести другую услугу",
        callback_data: "ask_to_invoice_service_name"
      }
    ]]
  },

  edit_service: {
    inline_keyboard: [[
      {
        text: "Редактировать",
        callback_data: "edit_service_name"
      },
      {
        text: "Внести другую услугу",
        callback_data: "add_new_service_name"
      }
    ]]
  },

  invoice_card_buttons: {
    inline_keyboard: [[
      {
        text: "Все верно",
        callback_data: "confirm_invoice_data"
      },
      {
        text: "Создать новый",
        callback_data: "create_invoice"
      }
    ]]
  },

  select_template: {
    inline_keyboard: [[
      {
        text: "📄 Договор",
        callback_data: "get_contract_template"
      },
      {
        text: "✅ Акт выполненных работ",
        callback_data: "get_act_template"
      }
    ]]
  },

  select_report: {
    inline_keyboard: [[
      {
        text: "📈 Доходы / КПО",
        callback_data: "get_payments"
      },
      {
        text: "📉 Расходы",
        callback_data: "get_expenses"
      }
    ]]
  },

  add_new_expense: {
    inline_keyboard: [[
      {
        text: "Внести новый расход",
        callback_data: "add_new_expense"
      },
    ]]
  },

  select_profile_item: {
    inline_keyboard: [
      [
        {
          text: "Название фирмы",
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
          text: "ОКВЭД",
          callback_data: "edit_company_okved"
        },
      ],
      [
        {
          text: "Основная услуга",
          callback_data: "edit_service"
        },
      ],
      [
        {
          text: "Сменить язык",
          callback_data: "edit_language"
        }
      ],
    ]
  },

  // subscription: {
  //   inline_keyboard: [
  //     [
  //       {
  //         text: "👉 Наш Telegram",
  //         url: "https://t.me/ml_cosmetic"
  //       }
  //     ],
  //     [
  //       {
  //         text: "✨Готово! Проверяй!",
  //         callback_data: "check_subscription"
  //       }
  //     ]
  //   ]
  // }
};

// Команды и их обработчики
export const commands = {
  "/start": "start",
  "/help": "help", 
  "/confirmed": "confirmed",
  "/not_confirmed": "notConfirmed"
} as const;

// Конфигурация callback кнопок - что делать при нажатии
// export const callbackActions = {
//   "start_flow": {
//     action: "start_flow", // Запустить флоу
//     flowName: "subscription"
//   },
//   "check_subscription": {
//     action: "go_to_step", // Перейти к шагу
//     stepId: "ask_vk_link"
//   }
// } as const;
// Уникальные действия для каждого контекста
export const callbackActions = {
  // Выбор языка при регистрации
  "lang_select_sr": {
    action: "set_variable",
    variable: "profile.language",
    value: "sr",
    //nextFlow: "onboarding"
    nextStep: "save_language"
  },
  "lang_select_ru": {
    action: "set_variable", 
    variable: "profile.language",
    value: "ru",
    //nextFlow: "onboarding"
    nextStep: "save_language"
  },

  "save_edited_language_sr": {
    action: "set_variable",
    variable: "profile.language",
    value: "sr",
    nextStep: "save_edited_language"
  },
  "save_edited_language_ru": {
    action: "set_variable", 
    variable: "profile.language",
    value: "ru",
    nextStep: "save_edited_language"
  },

  // Навигация в onboarding
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
    nextStep: "ask_to_lawyer"
  },
  "consultation_accountant": {
    action: "set_variable",
    variable: "consultation.type",
    value: "accountant", 
    nextStep: "ask_to_accountant"
  },

  //Запрос шаблонов
  "get_contract_template": {
    action: "set_variable",
    variable: "need_template.type",
    value: "contract", 
    nextStep: "handle_get_template"
  },

  "get_act_template": {
    action: "set_variable",
    variable: "need_template.type",
    value: "act", 
    nextStep: "handle_get_template"
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
  



  // Глобальные действия
  "restart_bot": {
    action: "start_flow",
    flowName: "start_registration"
  },


  

} as const;


// Legacy callbacks удалены - теперь используется только callbackActions

// Типы для TypeScript
export type CommandHandler = keyof typeof commands;
export type CallbackActionType = 'start_flow' | 'go_to_step' | 'go_to_flow' | 'set_variable';

export interface CallbackActionConfig {
  action: CallbackActionType;
  flowName?: string;    // Для start_flow
  stepId?: string;      // Для go_to_step
  variable?: string;    // Для set_variable
  value?: any;          // Для set_variable
  nextFlow?: string;    // Для перехода к следующему флоу после действия
  nextStep?: string;    // Для перехода к следующему шагу после действия
}
