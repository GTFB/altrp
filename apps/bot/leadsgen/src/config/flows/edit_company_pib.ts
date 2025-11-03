import type { BotFlow } from '../../core/flow-types';

export const editCompanyPibFlow: BotFlow = {
  name: 'edit_company_pib',
  description: 'Company PIB change',
  steps: [
    {
      type: 'wait_input',
      id: 'edit_company_pib',
      prompt: 'pib',
      saveToVariable: 'company.pib',
      nextStepId: 'edit_company_pib_handler'
    },
    {
      type: 'handler',
      id: 'edit_company_pib_handler',
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
