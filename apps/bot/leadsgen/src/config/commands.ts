// Commands configuration
// This file contains all bot commands and their handlers

export interface BotCommand {
  name: string;
  handlerName: string;
  description?: string;
}

// All bot commands configuration for consultant bot
export const commands: BotCommand[] = [
  {
    name: "/start",
    handlerName: "handleStartCommand",
    description: "Initialize leadsgen by human and create topics"
  }
];

// Helper function to find command by name
export function findCommand(commandName: string): BotCommand | undefined {
  return commands.find(cmd => cmd.name === commandName);
}

// Helper function to get all command names
export function getAllCommandNames(): string[] {
  return commands.map(cmd => cmd.name);
}
