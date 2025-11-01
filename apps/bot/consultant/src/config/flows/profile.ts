import type { BotFlow } from '../../core/flow-types';

export const profileFlow: BotFlow = {
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
};
