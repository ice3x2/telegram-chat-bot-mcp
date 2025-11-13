import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { sendTelegramText } from './tools/sendTelegramText.js';
import { sendTelegramMarkdown } from './tools/sendTelegramMarkdown.js';
import { sendTelegramWithButtons } from './tools/sendTelegramWithButtons.js';
import { sendTelegramPhoto } from './tools/sendTelegramPhoto.js';
import { markdownToTelegramHTML } from './tools/markdownToTelegram.js';
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
  // Get Telegram configuration from environment variables
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  // Log environment for debugging (sanitized)
  const tokenPresent = !!telegramBotToken;
  const chatIdPresent = !!telegramChatId;
  logger.info('server', 'env_check', { tokenPresent, chatIdPresent });
  
  // If debugging, show sanitized token info
  if (process.env.DEBUG_MCP) {
    console.error(`[DEBUG] Token present: ${tokenPresent}`);
    console.error(`[DEBUG] Chat ID present: ${chatIdPresent}`);
    if (telegramBotToken) {
      console.error(`[DEBUG] Token format: ${telegramBotToken.substring(0, 10)}...`);
    }
  }

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
    console.error('Environment variable check:');
    console.error(`  TELEGRAM_BOT_TOKEN is set: ${tokenPresent}`);
    console.error(`  TELEGRAM_CHAT_ID is set: ${chatIdPresent}`);
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

  const server = new McpServer({
    name: 'telegram-bot-mcp',
    version: '1.0.0'
  });

  // Register Telegram tools
  // Note: MCP SDK handler interface is complex with additional metadata fields
  // Using 'as any' for type compatibility with MCP SDK requirements
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendTextHandler: any = async ({ text }: { text: string }) => {
    try {
      if (!telegramBotToken || !telegramChatId) {
        logger.error('server', 'send_failed', { error: 'Bot token and chat ID not configured' });
        return {
          content: [{ type: 'text', text: 'Error: Bot token and chat ID are not configured' }],
          isError: true
        };
      }
      const result = await sendTelegramText({ text }, telegramBotToken, telegramChatId);
      const out = { success: true, messageId: result.message_id };
      return {
        content: [{ type: 'text', text: JSON.stringify(out, null, 2) }]
      };
    } catch (err: unknown) {
      const e = err as Error;
      logger.error('server', 'send_failed', { error: e.message });
      return {
        content: [{ type: 'text', text: `Error: ${e.message}` }],
        isError: true
      };
    }
  };

  server.registerTool(
    'send_telegram_text',
    {
      title: 'Send Telegram Text',
      description: 'Send a plain text message to configured Telegram chat',
      inputSchema: {
        text: z.string().describe('Text message to send')
      }
    },
    sendTextHandler
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMarkdownHandler: any = async ({ markdown, fallbackToText }: { markdown: string; fallbackToText?: boolean }) => {
    try {
      if (!telegramBotToken || !telegramChatId) {
        logger.error('server', 'send_failed', { error: 'Bot token and chat ID not configured' });
        return {
          content: [{ type: 'text', text: 'Error: Bot token and chat ID are not configured' }],
          isError: true
        };
      }
      const result = await sendTelegramMarkdown(
        { markdown, fallbackToText },
        telegramBotToken,
        telegramChatId
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (err: unknown) {
      const e = err as Error;
      logger.error('server', 'send_failed', { error: e.message });
      return {
        content: [{ type: 'text', text: `Error: ${e.message}` }],
        isError: true
      };
    }
  };

  server.registerTool(
    'send_telegram_markdown',
    {
      title: 'Send Telegram Markdown',
      description: 'Convert Markdown to Telegram HTML and send. Falls back to plain text on failure.',
      inputSchema: {
        markdown: z.string().describe('Markdown content to convert and send'),
        fallbackToText: z.boolean().optional().describe('Fall back to plain text if Markdown conversion fails')
      }
    },
    sendMarkdownHandler
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendButtonsHandler: any = async ({ text, buttons, parseMode }: {
    text: string;
    buttons: Record<string, any>[][];
    parseMode?: 'HTML' | 'MarkdownV2';
  }) => {
    try {
      if (!telegramBotToken || !telegramChatId) {
        logger.error('server', 'send_failed', { error: 'Bot token and chat ID not configured' });
        return {
          content: [{ type: 'text', text: 'Error: Bot token and chat ID are not configured' }],
          isError: true
        };
      }
      const result = await sendTelegramWithButtons(
        { text, buttons: buttons as any, parseMode },
        telegramBotToken,
        telegramChatId
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (err: unknown) {
      const e = err as Error;
      logger.error('server', 'send_failed', { error: e.message });
      return {
        content: [{ type: 'text', text: `Error: ${e.message}` }],
        isError: true
      };
    }
  };

  server.registerTool(
    'send_telegram_with_buttons',
    {
      title: 'Send Telegram with Buttons',
      description: 'Send a message with inline keyboard buttons to Telegram',
      inputSchema: {
        text: z.string().describe('Message text to send'),
        buttons: z.array(z.array(z.object({
          text: z.string().describe('Button text'),
          url: z.string().optional().describe('Button URL (for URL buttons)'),
          callback_data: z.string().optional().describe('Callback data (for callback buttons)'),
          switch_inline_query: z.string().optional().describe('Inline query to switch to')
        }))).describe('2D array of inline keyboard buttons'),
        parseMode: z.enum(['HTML', 'MarkdownV2']).optional().describe('Parse mode for text formatting')
      }
    },
    sendButtonsHandler
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendPhotoHandler: any = async ({ photo, caption, parseMode }: {
    photo: string;
    caption?: string;
    parseMode?: 'HTML' | 'MarkdownV2';
  }) => {
    try {
      if (!telegramBotToken || !telegramChatId) {
        logger.error('server', 'send_failed', { error: 'Bot token and chat ID not configured' });
        return {
          content: [{ type: 'text', text: 'Error: Bot token and chat ID are not configured' }],
          isError: true
        };
      }
      const result = await sendTelegramPhoto(
        { photo, caption, parseMode },
        telegramBotToken,
        telegramChatId
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (err: unknown) {
      const e = err as Error;
      logger.error('server', 'send_failed', { error: e.message });
      return {
        content: [{ type: 'text', text: `Error: ${e.message}` }],
        isError: true
      };
    }
  };

  server.registerTool(
    'send_telegram_photo',
    {
      title: 'Send Telegram Photo',
      description: 'Send a photo/image to Telegram (supports URL or file_id)',
      inputSchema: {
        photo: z.string().describe('Photo URL (https://) or Telegram file_id'),
        caption: z.string().optional().describe('Optional caption for the photo'),
        parseMode: z.enum(['HTML', 'MarkdownV2']).optional().describe('Parse mode for caption formatting')
      }
    },
    sendPhotoHandler
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markdownConverter: any = async ({ markdown }: { markdown: string }) => {
    try {
      const html = markdownToTelegramHTML(markdown);
      return {
        content: [{ type: 'text', text: html }]
      };
    } catch (err: unknown) {
      const e = err as Error;
      logger.error('server', 'conversion_failed', { error: e.message });
      return {
        content: [{ type: 'text', text: `Error: ${e.message}` }],
        isError: true
      };
    }
  };

  server.registerTool(
    'markdown_to_telegram_html',
    {
      title: 'Convert Markdown to Telegram HTML',
      description: 'Convert Markdown text to Telegram-compatible HTML format',
      inputSchema: {
        markdown: z.string().describe('Markdown content to convert')
      }
    },
    markdownConverter
  );

  // Use stdio transport for stdin/stdout integration
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Keep process alive by resuming stdin
  process.stdin.resume();
  
  console.error('MCP stdio server connected. Listening on stdin/stdout.');
}
