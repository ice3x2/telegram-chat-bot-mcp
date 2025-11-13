import { getTelegramAxios, TELEGRAM_MARKDOWN_TIMEOUT } from '../utils/axiosConfig.js';
import { markdownToTelegramHTML } from './markdownToTelegram.js';
import { sendTelegramText } from './sendTelegramText.js';
import { logger } from '../utils/logger.js';
import { prepareMarkdownChunks, getSequentialSendDelay } from '../utils/markdownSplitter.js';

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
  isSplit?: boolean;
  totalChunks?: number;
  messageIds?: number[];
}

/**
 * Internal: Send single markdown chunk
 */
async function sendSingleMarkdown(
  markdownChunk: string,
  botToken: string,
  chatId: string,
  fallbackToText: boolean
): Promise<number> {
  // Step 1: Convert Markdown to HTML
  let html: string;
  try {
    html = markdownToTelegramHTML(markdownChunk);
  } catch (error) {
    if (fallbackToText) {
      logger.warn('sendTelegramMarkdown', 'markdown_parse_failed', {
        error: (error as Error).message,
        willUseFallback: true
      });

      // Fallback: Send plain text
      try {
        const result = await sendTelegramText(
          { text: markdownChunk, chatId },
          botToken,
          chatId
        );
        return result.message_id;
      } catch (fallbackError) {
        logger.error('sendTelegramMarkdown', 'fallback_failed', {
          originalError: (error as Error).message,
          fallbackError: (fallbackError as Error).message
        });
        throw fallbackError;
      }
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

    const telegramAxios = getTelegramAxios();
    const response = await telegramAxios.post(url, payload, {
      timeout: TELEGRAM_MARKDOWN_TIMEOUT
    });

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    return response.data.result.message_id;
  } catch (error: any) {
    const errorMessage = error.message || error.toString();

    // Fallback: Send plain text
    if (fallbackToText) {
      logger.warn('sendTelegramMarkdown', 'fallback_used', {
        reason: errorMessage,
        errorCode: error.code
      });

      try {
        const result = await sendTelegramText(
          { text: markdownChunk, chatId },
          botToken,
          chatId
        );
        return result.message_id;
      } catch (fallbackError) {
        logger.error('sendTelegramMarkdown', 'fallback_failed', {
          originalError: errorMessage,
          originalErrorCode: error.code,
          fallbackError: (fallbackError as Error).message
        });
        throw fallbackError;
      }
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

/**
 * Send Markdown message to Telegram with HTML formatting
 * Automatically splits large messages and sends sequentially with 1-second intervals
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

  // Prepare chunks (splits large messages if needed)
  const chunks = prepareMarkdownChunks(markdown);
  const messageIds: number[] = [];
  const delay = getSequentialSendDelay();

  logger.info('sendTelegramMarkdown', 'message_processing', {
    isSplit: chunks.length > 1,
    totalChunks: chunks.length,
    originalLength: markdown.length
  });

  // Send each chunk sequentially with delay
  for (let i = 0; i < chunks.length; i++) {
    try {
      const messageId = await sendSingleMarkdown(
        chunks[i],
        botToken,
        chatId,
        fallbackToText
      );
      messageIds.push(messageId);

      logger.info('sendTelegramMarkdown', 'chunk_sent', {
        chunkNumber: i + 1,
        totalChunks: chunks.length,
        messageId
      });

      // Wait before sending next chunk (except for the last one)
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      logger.error('sendTelegramMarkdown', 'chunk_send_failed', {
        chunkNumber: i + 1,
        totalChunks: chunks.length,
        error: (error as Error).message,
        sentSoFar: messageIds.length
      });
      throw error;
    }
  }

  // Return result
  const result: SendTelegramMarkdownResult = {
    success: true,
    messageIds: messageIds,
    isSplit: chunks.length > 1,
    totalChunks: chunks.length
  };

  // For backward compatibility, add messageId if single chunk
  if (chunks.length === 1) {
    result.messageId = messageIds[0];
  }

  logger.info('sendTelegramMarkdown', 'message_sent', {
    isSplit: result.isSplit,
    totalChunks: result.totalChunks,
    messageCount: result.messageIds?.length,
    messageIds: result.messageIds
  });

  return result;
}
