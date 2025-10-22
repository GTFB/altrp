import type { BotFlow } from '../../core/flow-types';

export const testDynamicCallbackFlow: BotFlow = {
  name: 'test_dynamic_callback',
  description: 'Test dynamic callback functionality',
  steps: [
    {
      type: 'message',
      id: 'welcome',
      messageKey: 'welcome_message',
      nextStepId: 'select_course'
    },
    {
      type: 'dynamic_callback',
      id: 'select_course',
      handler: 'generateCourseButtons',
      saveToVariable: 'selected.course_id',
      nextStepId: 'show_course_details'
    },
    {
      type: 'dynamic',
      id: 'show_course_details',
      handler: 'showSelectedCourse',
      nextStepId: 'select_service'
    },
    {
      type: 'dynamic_callback',
      id: 'select_service',
      handler: 'generateServiceButtons',
      saveToVariable: 'selected.service_id',
      nextStepId: 'show_final_selection'
    },
    {
      type: 'dynamic',
      id: 'show_final_selection',
      handler: 'showFinalSelection',
      nextStepId: ''
    }
  ]
};
