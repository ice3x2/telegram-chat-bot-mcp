import { getTelegramAxios, TELEGRAM_TEXT_TIMEOUT } from '../utils/axiosConfig.js';
import { logger } from '../utils/logger.js';

export interface SendTelegramTextParams {
  text: string;
  chatId?: string;  // Optional override
}

/**
 * Send a plain text message to Telegram
 */
export async function sendTelegramText(
  params: SendTelegramTextParams,
  botToken: string,
  defaultChatId: string
): Promise<any> {
  const { text, chatId = defaultChatId } = params;

  if (!text || text.trim() === '') {
    throw new Error('Text cannot be empty');
  }

  if (!botToken || !chatId) {
    throw new Error('Bot token and chat ID are required');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text
  };

  logger.info('sendTelegramText', 'sending_message', {
    chatId,
    textLength: text.length
  });

  try {
    const telegramAxios = getTelegramAxios();
    const response = await telegramAxios.post(url, payload, {
      timeout: TELEGRAM_TEXT_TIMEOUT
    });

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    logger.info('sendTelegramText', 'message_sent', {
      messageId: response.data.result.message_id,
      chatId
    });

    return response.data.result;
  } catch (error: any) {
    const errorMessage = error.message || error.toString();
    const errorCode = error.code;
    const responseData = error.response?.data;

    logger.error('sendTelegramText', 'send_failed', {
      error: errorMessage,
      errorCode,
      chatId,
      responseData,
      stack: error.stack?.split('\n')[0] // First line of stack for debugging
    });

    // Re-throw with more context
    if (errorCode === 'ETIMEDOUT' || errorCode === 'ECONNABORTED') {
      throw new Error(`Network timeout: ${errorMessage}`);
    } else if (responseData) {
      throw new Error(`Telegram API error: ${responseData.description || errorMessage}`);
    } else {
      throw new Error(`Send failed: ${errorMessage} (code: ${errorCode || 'unknown'})`);
    }
  }
}
