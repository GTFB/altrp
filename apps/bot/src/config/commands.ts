// Commands configuration
// This file contains all bot commands and their handlers

export interface BotCommand {
  name: string;
  handlerName: string;
  description?: string;
}

// All bot commands configuration
export const commands: BotCommand[] = [
  {
    name: "/start",
    handlerName: "handleStartCommandFlow",
    description: "Start working with bot"
  },
  {
    name: "/menu", 
    handlerName: "handleMenuCommandFlow",
    description: "Show main menu"
  },
  {
    name: "/help",
    handlerName: "handleHelpCommand",
    description: "Show help information"
  },
  {
    name: "/confirmed",
    handlerName: "handleConfirmedCommand", 
    description: "Confirm user subscription (admin only)"
  },
  {
    name: "/not_confirmed",
    handlerName: "handleNotConfirmedCommand",
    description: "Reject user subscription (admin only)"
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
