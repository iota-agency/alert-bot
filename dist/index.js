"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertLevel = exports.TelegramAlertBot = void 0;
const grammy_1 = require("grammy");
const date_fns_1 = require("date-fns");
var AlertLevel;
(function (AlertLevel) {
    AlertLevel["ERROR"] = "ERROR";
    AlertLevel["WARNING"] = "WARNING";
    AlertLevel["LOG"] = "LOG";
})(AlertLevel || (exports.AlertLevel = AlertLevel = {}));
class TelegramAlertBot {
    constructor(token, config) {
        if (!token || typeof token !== "string") {
            throw new Error("Invalid bot token");
        }
        this.bot = new grammy_1.Bot(token);
        this.config = this.validateConfig(config);
        this.projectTag = this.createProjectTag(config.projectName);
    }
    validateConfig(config) {
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
    createProjectTag(projectName) {
        let tag = projectName
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
        if (tag.length === 0) {
            tag = "unnamed_project";
        }
        else if (/^\d/.test(tag)) {
            tag = "project_" + tag;
        }
        return tag.slice(0, 32);
    }
    getEmoji(level) {
        const emojis = {
            [AlertLevel.ERROR]: "🚨",
            [AlertLevel.WARNING]: "⚠️",
            [AlertLevel.LOG]: "ℹ️",
        };
        return emojis[level];
    }
    escapeHtml(text) {
        const htmlEntities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
    }
    formatMessage(options) {
        const { level, message, metadata } = options;
        const emoji = this.getEmoji(level);
        const timestamp = (0, date_fns_1.format)(new Date(), "yyyy-MM-dd HH:mm:ss");
        const parts = [
            `#${level.toLowerCase()} #${this.projectTag}`,
            `<b>${emoji} ${this.escapeHtml(level)} - ${this.escapeHtml(timestamp)}</b>`,
            `<b>Message:</b>\n<pre>${this.escapeHtml(message)}</pre>`,
        ];
        if (metadata && Object.keys(metadata).length > 0) {
            const metadataStr = this.escapeHtml(JSON.stringify(metadata, null, 2));
            parts.push(`<b>Metadata:</b>\n<pre>${metadataStr}</pre>`);
        }
        return parts.join("\n\n");
    }
    async sendAlert(options) {
        const message = this.formatMessage(options);
        try {
            await this.bot.api.sendMessage(this.config.chatId, message, {
                parse_mode: "HTML",
                message_thread_id: this.config.projectId,
            });
        }
        catch (error) { }
    }
    async error(message, metadata) {
        await this.sendAlert({ level: AlertLevel.ERROR, message, metadata });
    }
    async warning(message, metadata) {
        await this.sendAlert({ level: AlertLevel.WARNING, message, metadata });
    }
    async log(message, metadata) {
        await this.sendAlert({ level: AlertLevel.LOG, message, metadata });
    }
}
exports.TelegramAlertBot = TelegramAlertBot;
TelegramAlertBot.Builder = class {
    constructor(token) {
        this.token = token;
    }
    setConfig(config) {
        this.config = config;
        return this;
    }
    build() {
        if (!this.config) {
            throw new Error("Bot configuration must be set");
        }
        return new TelegramAlertBot(this.token, this.config);
    }
};
