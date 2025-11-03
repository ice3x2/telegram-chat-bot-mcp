import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { sendTelegramText } from './tools/sendTelegramText';
import { sendTelegramMarkdown } from './tools/sendTelegramMarkdown';
import { startLogCleanupScheduler } from './utils/logCleaner.js';
import { logger } from './utils/logger.js';

/**
 * Validate Telegram Bot Token format
 */
function validateTelegramBotToken(token: string): { valid: boolean; error?: string } {
  try {
    // Telegram Bot Token format: digits:alphanumeric_with_dash_underscore
    // Example: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz-_
    if (!/^\d+:[A-Za-z0-9_-]{25,}$/.test(token)) {
      return { valid: false, error: 'Invalid Telegram Bot Token format' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid token format' };
  }
}

/**
 * Validate Telegram Chat ID format
 */
function validateTelegramChatId(chatId: string): { valid: boolean; error?: string } {
  try {
    // Chat ID can be:
    // - Personal: positive number (123456789)
    // - Group: negative number (-123456789 or -100123456789)
    const parsed = parseInt(chatId, 10);
    if (isNaN(parsed)) {
      return { valid: false, error: 'Chat ID must be a valid number' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid chat ID format' };
  }
}

export async function startServer() {
  // Get Telegram configuration
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  let validationError: string | undefined;

  // Validate Telegram configuration
  if (!telegramBotToken || !telegramChatId) {
    validationError = 'TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set';
  } else {
    // Validate Telegram Bot Token
    const tokenValidation = validateTelegramBotToken(telegramBotToken);
    if (!tokenValidation.valid) {
      validationError = `Invalid TELEGRAM_BOT_TOKEN - ${tokenValidation.error}`;
    }

    // Validate Telegram Chat ID
    if (!validationError) {
      const chatIdValidation = validateTelegramChatId(telegramChatId);
      if (!chatIdValidation.valid) {
        validationError = `Invalid TELEGRAM_CHAT_ID - ${chatIdValidation.error}`;
      }
    }
  }

  if (validationError) {
    logger.error('server', 'server_start_failed', { error: validationError });
    console.error(`❌ Error: ${validationError}`);
    console.error('');
    console.error('For Telegram Bot:');
    console.error('  1. Create a bot with @BotFather');
    console.error('  2. Set TELEGRAM_BOT_TOKEN=<your_token>');
    console.error('  3. Set TELEGRAM_CHAT_ID=<your_chat_id>');
    console.error('');
    console.error('Example:');
    console.error('  export TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
    console.error('  export TELEGRAM_CHAT_ID=123456789');
    process.exit(1);
  }

  logger.info('server', 'server_starting', { chatId: telegramChatId });

  // Start log cleanup scheduler (runs every 24 hours)
  startLogCleanupScheduler(24);

  const server = new McpServer({ 
    name: 'telegram-bot-mcp', 
    version: '1.0.0' 
  });

  // Register Telegram tools
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendTextHandler = (async ({ text }: { text: string }) => {
    try {
      if (!telegramBotToken || !telegramChatId) {
        return { content: [{ type: 'text', text: 'Bot token and chat ID are not configured' }], isError: true };
      }
      const result = await sendTelegramText({ text }, telegramBotToken, telegramChatId);
      const out = { success: true, messageId: result.message_id };
      return { content: [{ type: 'text', text: JSON.stringify(out) }], structuredContent: out };
    } catch (err: unknown) {
      const e = err as Error;
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }) as any;

  server.registerTool(
    'send_telegram_text',
    {
      title: 'Send Telegram Text',
      description: 'Send a plain text message to configured Telegram chat',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inputSchema: (z.object({ text: z.string() }) as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      outputSchema: (z.object({ success: z.boolean(), messageId: z.number().optional() }) as any)
    },
    sendTextHandler
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMarkdownHandler = (async ({ markdown, fallbackToText }: { markdown: string; fallbackToText?: boolean }) => {
    try {
      if (!telegramBotToken || !telegramChatId) {
        return { content: [{ type: 'text', text: 'Bot token and chat ID are not configured' }], isError: true };
      }
      const result = await sendTelegramMarkdown(
        { markdown, fallbackToText },
        telegramBotToken,
        telegramChatId
      );
      return { content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
    } catch (err: unknown) {
      const e = err as Error;
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  }) as any;

  server.registerTool(
    'send_telegram_markdown',
    {
      title: 'Send Telegram Markdown',
      description: 'Convert Markdown to Telegram HTML and send. Falls back to plain text on failure.',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inputSchema: (z.object({ markdown: z.string(), fallbackToText: z.boolean().optional() }) as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      outputSchema: (z.object({ success: z.boolean(), messageId: z.number().optional(), usedFallback: z.boolean().optional() }) as any)
    },
    sendMarkdownHandler
  );

  // Use stdio transport for stdin/stdout integration
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Keep process alive by resuming stdin
  process.stdin.resume();
  
  console.error('MCP stdio server connected. Listening on stdin/stdout.');
}
