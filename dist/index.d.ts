declare enum AlertLevel {
    ERROR = "ERROR",
    WARNING = "WARNING",
    LOG = "LOG"
}
interface BotConfig {
    chatId: string;
    projectId: number;
    projectName: string;
}
declare class TelegramAlertBot {
    private bot;
    private config;
    private projectTag;
    private constructor();
    private validateConfig;
    private createProjectTag;
    private getEmoji;
    private escapeHtml;
    private formatMessage;
    private sendAlert;
    error(message: string, metadata?: Record<string, any>): Promise<void>;
    warning(message: string, metadata?: Record<string, any>): Promise<void>;
    log(message: string, metadata?: Record<string, any>): Promise<void>;
    static Builder: {
        new (token: string): {
            token: string;
            config?: BotConfig;
            setConfig(config: BotConfig): any;
            build(): TelegramAlertBot;
        };
    };
}
export { TelegramAlertBot, AlertLevel };
