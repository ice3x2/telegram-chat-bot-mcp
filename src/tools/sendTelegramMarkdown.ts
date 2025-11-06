import { telegramAxios } from '../utils/axiosConfig.js';
import { markdownToTelegramHTML } from './markdownToTelegram.js';
import { sendTelegramText } from './sendTelegramText.js';
import { logger } from '../utils/logger.js';

export interface SendTelegramMarkdownParams {
  markdown: string;
  chatId?: string;
  fallbackToText?: boolean;
}

export interface SendTelegramMarkdownResult {
  success: boolean;
  messageId?: number;
  usedFallback?: boolean;
  fallbackReason?: string;
}

/**
 * Send Markdown message to Telegram with HTML formatting
 * Falls back to plain text on failure
 */
export async function sendTelegramMarkdown(
  params: SendTelegramMarkdownParams,
  botToken: string,
  defaultChatId: string
): Promise<SendTelegramMarkdownResult> {
  const { markdown, chatId = defaultChatId, fallbackToText = true } = params;

  if (!markdown || markdown.trim() === '') {
    throw new Error('Markdown content is empty');
  }

  // Step 1: Convert Markdown to HTML
  let html: string;
  try {
    html = markdownToTelegramHTML(markdown);
  } catch (error) {
    if (fallbackToText) {
      logger.error('sendTelegramMarkdown', 'markdown_parse_failed', {
        error: (error as Error).message,
        fallbackToText: true
      });

      // Fallback: Send plain text
      const result = await sendTelegramText({ text: markdown, chatId }, botToken, defaultChatId);
      return {
        success: true,
        messageId: result.message_id,
        usedFallback: true,
        fallbackReason: (error as Error).message
      };
    } else {
      throw error;
    }
  }

  // Step 2: Send HTML message
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text: html,
      parse_mode: 'HTML'
    };

    const response = await telegramAxios.post(url, payload);

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    logger.info('sendTelegramMarkdown', 'message_sent', {
      messageId: response.data.result.message_id,
      usedFallback: false
    });

    return {
      success: true,
      messageId: response.data.result.message_id,
      usedFallback: false
    };
  } catch (error: any) {
    const errorMessage = error.message || error.toString();

    // Fallback: Send plain text
    if (fallbackToText) {
      logger.warn('sendTelegramMarkdown', 'fallback_used', {
        reason: errorMessage,
        errorCode: error.code
      });

      const result = await sendTelegramText({ text: markdown, chatId }, botToken, defaultChatId);
      return {
        success: true,
        messageId: result.message_id,
        usedFallback: true,
        fallbackReason: errorMessage
      };
    } else {
      logger.error('sendTelegramMarkdown', 'send_failed', {
        error: errorMessage,
        errorCode: error.code,
        responseData: error.response?.data
      });
      throw new Error(`Markdown send failed: ${errorMessage}`);
    }
  }
}
