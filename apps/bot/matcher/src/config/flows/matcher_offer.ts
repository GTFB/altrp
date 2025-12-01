import type { BotFlow } from '../../core/flow-types';

export const matcherOfferFlow: BotFlow = {
  name: 'matcher_offer',
  description: 'Collect offer details from user',
  steps: [
    {
      type: 'wait_input',
      id: 'matcher_offer_title',
      text: 'Укажите название',
      saveToVariable: 'matcher.offer.title',
      nextStepId: 'matcher_offer_description'
    },
    {
      type: 'wait_input',
      id: 'matcher_offer_description',
      text: 'Опишите предложение подробнее:',
      saveToVariable: 'matcher.offer.description',
      nextStepId: 'matcher_offer_price'
    },
    {
      type: 'wait_input',
      id: 'matcher_offer_price',
      text: 'Укажите стоимость:',
      saveToVariable: 'matcher.offer.price',
      validation: {
        type: 'number',
        errorMessage: 'Цена должна быть числом'
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


