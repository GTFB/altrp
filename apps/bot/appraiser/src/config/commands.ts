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
    description: "Initialize and create topics"
  },
  {
    name: "/enable_ai",
    handlerName: "handleEnableAICommand",
    description: "Enable AI assistent"
  },
  {
    name: "/disable_ai",
    handlerName: "handleDisableAICommand",
    description: "Disable AI assistent"
  },
  {
    name: "/set_status",
    handlerName: "handleSetStatusCommand",
    description: "Set status"
  },
  {
    name: "/menu",
    handlerName: "handleMenuCommand",
    description: "Open menu"
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
