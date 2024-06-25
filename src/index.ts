import { Bot } from "grammy";
import { format } from "date-fns";

enum AlertLevel {
  ERROR = "ERROR",
  WARNING = "WARNING",
  LOG = "LOG",
}

interface AlertOptions {
  level: AlertLevel;
  message: string;
  metadata?: Record<string, any>;
}

interface BotConfig {
  chatId: string;
  projectId: number;
  projectName: string;
}

class TelegramAlertBot {
  private bot: Bot;
  private config: BotConfig;
  private projectTag: string;

  private constructor(token: string, config: BotConfig) {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid bot token");
    }
    this.bot = new Bot(token);
    this.config = this.validateConfig(config);
    this.projectTag = this.createProjectTag(config.projectName);
  }

  private validateConfig(config: BotConfig): BotConfig {
    if (!config.chatId || typeof config.chatId !== "string") {
      throw new Error("Invalid chatId");
    }
    if (!Number.isInteger(config.projectId) || config.projectId <= 0) {
      throw new Error("Invalid projectId");
    }
    if (!config.projectName || typeof config.projectName !== "string") {
      throw new Error("Invalid projectName");
    }
    return config;
  }

  private createProjectTag(projectName: string): string {
    let tag = projectName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

    if (tag.length === 0) {
      tag = "unnamed_project";
    } else if (/^\d/.test(tag)) {
      tag = "project_" + tag;
    }

    return tag.slice(0, 32);
  }

  private getEmoji(level: AlertLevel): string {
    const emojis: { [key in AlertLevel]: string } = {
      [AlertLevel.ERROR]: "🚨",
      [AlertLevel.WARNING]: "⚠️",
      [AlertLevel.LOG]: "ℹ️",
    };
    return emojis[level];
  }

  private escapeHtml(text: string): string {
    const htmlEntities: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
  }

  private formatMessage(options: AlertOptions): string {
    const { level, message, metadata } = options;
    const emoji = this.getEmoji(level);
    const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

    const parts = [
      `#${level.toLowerCase()} #${this.projectTag}`,
      `<b>${emoji} ${this.escapeHtml(level)} - ${this.escapeHtml(
        timestamp
      )}</b>`,
      `<b>Message:</b>\n<pre>${this.escapeHtml(message)}</pre>`,
    ];

    if (metadata && Object.keys(metadata).length > 0) {
      const metadataStr = this.escapeHtml(JSON.stringify(metadata, null, 2));
      parts.push(`<b>Metadata:</b>\n<pre>${metadataStr}</pre>`);
    }

    return parts.join("\n\n");
  }

  private async sendAlert(options: AlertOptions): Promise<void> {
    const message = this.formatMessage(options);
    try {
      await this.bot.api.sendMessage(this.config.chatId, message, {
        parse_mode: "HTML",
        message_thread_id: this.config.projectId,
      });
    } catch (error) {}
  }

  async error(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.sendAlert({ level: AlertLevel.ERROR, message, metadata });
  }

  async warning(
    message: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.sendAlert({ level: AlertLevel.WARNING, message, metadata });
  }

  async log(message: string, metadata?: Record<string, any>): Promise<void> {
    await this.sendAlert({ level: AlertLevel.LOG, message, metadata });
  }

  static Builder = class {
    token: string;
    config?: BotConfig;

    constructor(token: string) {
      this.token = token;
    }

    setConfig(config: BotConfig): this {
      this.config = config;
      return this;
    }

    build(): TelegramAlertBot {
      if (!this.config) {
        throw new Error("Bot configuration must be set");
      }
      return new TelegramAlertBot(this.token, this.config);
    }
  };
}

export { TelegramAlertBot, AlertLevel };
