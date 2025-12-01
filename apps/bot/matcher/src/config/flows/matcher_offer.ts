import type { BotFlow } from '../../core/flow-types';

export const matcherOfferFlow: BotFlow = {
  name: 'matcher_offer',
  description: 'Collect offer details from user',
  steps: [
    {
      type: 'wait_input',
      id: 'matcher_offer_title',
      text: 'Please provide a title',
      saveToVariable: 'matcher.offer.title',
      nextStepId: 'matcher_offer_description'
    },
    {
      type: 'wait_input',
      id: 'matcher_offer_description',
      text: 'Describe your offer in detail:',
      saveToVariable: 'matcher.offer.description',
      nextStepId: 'matcher_offer_price'
    },
    {
      type: 'wait_input',
      id: 'matcher_offer_price',
      text: 'Please provide the price:',
      saveToVariable: 'matcher.offer.price',
      validation: {
        type: 'number',
        errorMessage: 'Price must be a number'
      },
      nextStepId: 'matcher_offer_summary'
    },
    {
      type: 'handler',
      id: 'matcher_offer_summary',
      handlerName: 'matcherShowOfferSummaryHandler'
    }
  ]
};


