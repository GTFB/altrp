import type { BotFlow } from '../../core/flow-types';

export const editCompanyNameFlow: BotFlow = {
  name: 'edit_company_name',
  description: 'Company name change',
  steps: [
    {
      type: 'wait_input',
      id: 'edit_company_name',
      prompt: 'companyName',
      saveToVariable: 'company.name',
      nextStepId: 'edit_company_name_handler'
    },
    {
      type: 'handler',
      id: 'edit_company_name_handler',
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
