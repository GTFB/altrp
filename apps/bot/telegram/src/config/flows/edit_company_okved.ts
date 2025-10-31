import type { BotFlow } from '../../core/flow-types';

export const editCompanyOkvedFlow: BotFlow = {
  name: 'edit_company_okved',
  description: 'Company OKVED change',
  steps: [
    {
      type: 'wait_input',
      id: 'edit_company_okved',
      prompt: 'okved',
      saveToVariable: 'company.okved',
      nextStepId: 'edit_company_okved_handler'
    },
    {
      type: 'handler',
      id: 'edit_company_okved_handler',
      handlerName: 'updateCompany',
      nextStepId: 'redirect_to_profile'
    },
    {
      type: 'flow',
      id: 'redirect_to_profile',
      flowName: 'profile',
    }
  ]
};
