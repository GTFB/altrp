import type { BotFlow } from '../../core/flow-types';

// Импорты всех флоу
import { startRegistrationFlow } from './start_registration';
import { onboardingFlow } from './onboarding';
import { menuFlow } from './menu';
import { createInvoiceFlow } from './create_invoice';
import { consultationFlow } from './consultation';
import { docTemplatesFlow } from './doc_templates';
import { reportsFlow } from './reports';
import { profileFlow } from './profile';
import { editCompanyNameFlow } from './edit_company_name';
import { editCompanyPibFlow } from './edit_company_pib';
import { editCompanyOkvedFlow } from './edit_company_okved';
import { editLanguageFlow } from './edit_language';
import { editServiceFlow } from './edit_service';

// Объект со всеми флоу для совместимости с flow-engine.ts
export const flows: Record<string, BotFlow> = {
  start_registration: startRegistrationFlow,
  onboarding: onboardingFlow,
  menu: menuFlow,
  create_invoice: createInvoiceFlow,
  consultation: consultationFlow,
  doc_templates: docTemplatesFlow,
  reports: reportsFlow,
  profile: profileFlow,
  edit_company_name: editCompanyNameFlow,
  edit_company_pib: editCompanyPibFlow,
  edit_company_okved: editCompanyOkvedFlow,
  edit_language: editLanguageFlow,
  edit_service: editServiceFlow,
};

// Экспорт отдельных флоу для удобства
export {
  startRegistrationFlow,
  onboardingFlow,
  menuFlow,
  createInvoiceFlow,
  consultationFlow,
  docTemplatesFlow,
  reportsFlow,
  profileFlow,
  editCompanyNameFlow,
  editCompanyPibFlow,
  editCompanyOkvedFlow,
  editLanguageFlow,
  editServiceFlow,
};
