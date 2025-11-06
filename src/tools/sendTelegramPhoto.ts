import { telegramAxios } from '../utils/axiosConfig.js';
import { validateImageUrl } from '../utils/imageValidator.js';
import { logger } from '../utils/logger.js';

export interface SendTelegramPhotoParams {
  photo: string;  // URL or file_id
  caption?: string;
  chatId?: string;
  parseMode?: 'HTML' | 'MarkdownV2';
  disableNotification?: boolean;
}

/**
 * Send photo/image to Telegram
 * Supports both URL and file_id
 */
export async function sendTelegramPhoto(
  params: SendTelegramPhotoParams,
  botToken: string,
  defaultChatId: string
): Promise<any> {
  const { photo, caption, chatId = defaultChatId, parseMode = 'HTML', disableNotification } = params;

  if (!photo || photo.trim() === '') {
    throw new Error('Photo URL or file_id is required');
  }

  if (!botToken || !chatId) {
    throw new Error('Bot token and chat ID are required');
  }

  // Validate image URL (only for URLs, not file_ids)
  if (photo.startsWith('http://') || photo.startsWith('https://')) {
    const validation = await validateImageUrl(photo);
    if (!validation.valid) {
      logger.error('sendTelegramPhoto', 'send_failed', {
        error: `Invalid image URL: ${validation.error}`,
        chatId,
        url: photo
      });
      throw new Error(`Invalid image URL: ${validation.error}`);
    }
  }

  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
  const payload: any = {
    chat_id: chatId,
    photo: photo
  };

  if (caption) {
    payload.caption = caption;
    if (parseMode) {
      payload.parse_mode = parseMode;
    }
  }

  if (disableNotification !== undefined) {
    payload.disable_notification = disableNotification;
  }

  logger.info('sendTelegramPhoto', 'sending_message', {
    chatId,
    photoLength: photo.length,
    captionLength: caption?.length || 0
  });

  try {
    const response = await telegramAxios.post(url, payload, {
      timeout: 15000  // Longer timeout for photo upload
    });

    if (!response.data.ok) {
      throw new Error(`Telegram API error: ${response.data.description}`);
    }

    logger.info('sendTelegramPhoto', 'message_sent', {
      messageId: response.data.result.message_id,
      chatId
    });

    return response.data.result;
  } catch (error: any) {
    const errorMessage = error.message || error.toString();
    const errorCode = error.code;
    const responseData = error.response?.data;

    logger.error('sendTelegramPhoto', 'send_failed', {
      error: errorMessage,
      errorCode,
      chatId,
      responseData,
      stack: error.stack?.split('\n')[0]
    });

    // Re-throw with more context
    if (errorCode === 'ETIMEDOUT' || errorCode === 'ECONNABORTED') {
      throw new Error(`Photo upload timeout: ${errorMessage}`);
    } else if (responseData) {
      throw new Error(`Telegram API error: ${responseData.description || errorMessage}`);
    } else {
      throw new Error(`Photo send failed: ${errorMessage} (code: ${errorCode || 'unknown'})`);
    }
  }
}
