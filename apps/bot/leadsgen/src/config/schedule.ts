// Schedule configuration
// This file contains all the scheduled tasks

export interface BotSchedule {
  cron: string;
  handlerName: string;
  startAt: string;
  //description?: string;
}

// All scheduled tasks configuration
export const schedules: BotSchedule[] = [
  {
    cron: "* * * * *",
    handlerName: "checkDelayedMessages",
    startAt: "now"
  },
];

// Helper function to get all schedules
export function getAllSchedules(): string[] {
  return schedules as any;
}