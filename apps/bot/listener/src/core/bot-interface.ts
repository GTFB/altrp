// Общий интерфейс для обеих версий бота (Worker и Node.js)
export interface BotInterface {
  d1Storage: any;
  flowEngine: any;
  env: any;
  messageService: any;
  topicService: any;
}

