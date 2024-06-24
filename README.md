# Telegram Alert Bot

A robust and flexible TypeScript library for sending formatted alert messages to Telegram groups.

## Features

- Send error, warning, and log messages to Telegram
- Support for complex metadata objects
- HTML formatting for better readability
- Project-specific tagging for easy message categorization
- Built with TypeScript for type safety

## Installation

Install the package using npm:

```bash
npm install telegram-alert-bot
```


## Usage

*Note: Get the topic ID of your project!*

Here's a basic example of how to use the TelegramAlertBot:

```typescript
import { TelegramAlertBot, AlertLevel } from "telegram-alert-bot";

const bot = new TelegramAlertBot.Builder("YOUR_BOT_TOKEN")
  .setConfig({
    chatId: "YOUR_CHAT_ID", // alert group id
    projectId: 1000, // topicId in the telegram group
    projectName: "AI/ML",
  })
  .build();

// Send an error message
bot.error("An error occurred in the payment system", { orderId: "12345" });

// Send a warning message
bot.warning("Low disk space detected", { availableSpace: "500MB" });

// Send a log message
bot.log("User logged in", { userId: "user123" });
```

## Configuration

The `TelegramAlertBot` constructor takes the following configuration options:

- `chatId` (string): The ID of the Telegram chat (group or channel) where messages will be sent.
- `projectId` (number): An identifier for the project or topic within your Telegram group.
- `projectName` (string): The name of your project, used for tagging messages.

## Message Formatting

Messages are formatted in HTML and include:

- Hashtags for the alert level and project name
- Timestamp
- Alert level with an appropriate emoji
- Message content
- Metadata (if provided)

Example of a formatted message:

```
#error #myproject

🚨 ERROR - 2023-06-25 14:30:45

<b>Message:</b>
<pre>An error occurred in the payment system</pre>

<b>Metadata:</b>
<pre>
{
  "orderId": "12345"
}
</pre>
```

## Best Practices

1. Keep your bot token secret and never commit it to version control.
2. Use environment variables to store sensitive information like the bot token and chat ID.
3. Be mindful of Telegram's rate limits when sending messages.
4. Regularly monitor your bot's performance and adjust as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
