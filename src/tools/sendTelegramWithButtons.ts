import { telegramAxios } from '../utils/axiosConfig.js';
import { InlineKeyboardButton, InlineKeyboardMarkup } from '../types/telegram.js';
import { logger } from '../utils/logger.js';

export interface SendTelegramWithButtonsParams {
  text: string;
  buttons: InlineKeyboardButton[][];
  chatId?: string;
  parseMode?: 'HTML' | 'MarkdownV2';
}

/**
 * Send Telegram message with inline keyboard buttons
 */
export async function sendTelegramWithButtons(
  params: SendTelegramWithButtonsParams,
  botToken: string,
  defaultChatId: string
): Promise<any> {
  const { text, buttons, chatId = defaultChatId, parseMode = 'HTML' } = params;

  if (!text || text.trim() === '') {
    throw new Error('Text cannot be empty');
  }

  if (!botToken || !chatId) {
    throw new Error('Bot token and chat ID are required');
  }

  // Validate buttons structure
  if (!Array.isArray(buttons) || buttons.length === 0) {
    throw new Error('Buttons must be a non-empty 2D array');
  }

  for (const row of buttons) {
    if (!Array.isArray(row)) {
      throw new Error('Each button row must be an array');
    }
    for (const button of row) {
      if (!button.text) {
        throw new Error('Each button must have a text property');
      }
      if (!button.url && !button.callback_data && !button.switch_inline_query) {
        throw new Error('Each button must have either url, callback_data, or switch_inline_query');
      }
    }
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const replyMarkup: InlineKeyboardMarkup = {
    inline_keyboard: buttons
  };

  const payload: any = {
    chat_id: chatId,
    text: text
  };

  if (parseMode) {
    payload.parse_mode = parseMode;
  }

  payload.reply_markup = replyMarkup;

  logger.info('sendTelegramWithButtons', 'sending_message', {
    chatId,
    textLength: text.length,
    buttonCount: buttons.length
  });

  try {
    const response = await telegramAxios.post(url, payload);

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    logger.info('sendTelegramWithButtons', 'message_sent', {
      messageId: response.data.result.message_id,
      chatId,
      buttonCount: buttons.length
    });

    return response.data.result;
  } catch (error: any) {
    const errorMessage = error.message || error.toString();
    const errorCode = error.code;
    const responseData = error.response?.data;

    logger.error('sendTelegramWithButtons', 'send_failed', {
      error: errorMessage,
      errorCode,
      chatId,
      responseData,
      stack: error.stack?.split('\n')[0]
    });

    // Re-throw with more context
    if (errorCode === 'ETIMEDOUT' || errorCode === 'ECONNABORTED') {
      throw new Error(`Network timeout: ${errorMessage}`);
    } else if (responseData) {
      throw new Error(`Telegram API error: ${responseData.description || errorMessage}`);
    } else {
      throw new Error(`Send with buttons failed: ${errorMessage} (code: ${errorCode || 'unknown'})`);
    }
  }
}
