import axios from 'axios';
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
    const response = await axios.post(url, payload, {
      timeout: 5000,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
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
    logger.error('sendTelegramText', 'send_failed', {
      error: error.message,
      chatId,
      responseData: error.response?.data
    });
    throw error;
  }
}
