/**
 * Telegram Bot API Types
 * Reference: https://core.telegram.org/bots/api
 */

/**
 * Telegram message object
 */
export interface TelegramMessage {
  chat_id: number | string;
  text: string;
  parse_mode?: 'MarkdownV2' | 'HTML';
  reply_markup?: InlineKeyboardMarkup;
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

/**
 * Telegram photo message object
 */
export interface TelegramPhoto {
  chat_id: number | string;
  photo: string;  // URL or file_id
  caption?: string;
  parse_mode?: 'MarkdownV2' | 'HTML';
  reply_markup?: InlineKeyboardMarkup;
  disable_notification?: boolean;
}

/**
 * Inline keyboard markup
 */
export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

/**
 * Inline keyboard button
 */
export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  switch_inline_query?: string;
  callback_game?: object;
  pay?: boolean;
}

/**
 * Telegram API response
 */
export interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

/**
 * Telegram API update (for webhook/polling)
 */
export interface TelegramUpdate {
  update_id: number;
  message?: TelegramUpdateMessage;
  callback_query?: TelegramCallbackQuery;
}

/**
 * Telegram update message
 */
export interface TelegramUpdateMessage {
  message_id: number;
  date: number;
  chat: TelegramChat;
  text?: string;
  entities?: TelegramMessageEntity[];
}

/**
 * Telegram callback query
 */
export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  chat_instance: string;
  data?: string;
  inline_message_id?: string;
}

/**
 * Telegram chat object
 */
export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Telegram user object
 */
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

/**
 * Telegram message entity (for formatted text)
 */
export interface TelegramMessageEntity {
  type: string;
  offset: number;
  length: number;
}
