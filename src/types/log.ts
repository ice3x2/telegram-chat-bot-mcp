/**
 * 로그 레벨 타입
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * 로그 이벤트 타입
 */
export type LogEvent =
  | 'message_sent'
  | 'fallback_used'
  | 'image_validation_failed'
  | 'send_failed'
  | 'conversion_failed'
  | 'validation_failed'
  | 'server_start_failed'
  | 'invalid_webhook_url'
  | 'server_starting'
  | 'sending_message'
  | 'markdown_parse_failed'
  | 'env_check';

/**
 * 로그 엔트리 기본 구조
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  event: LogEvent;
  [key: string]: any;
}

/**
 * 메시지 전송 성공 로그
 */
export interface MessageSentLog extends LogEntry {
  event: 'message_sent';
  messageId: string;
  elapsed: number;
  usedFallback: boolean;
  cardTitle?: string;
}

/**
 * 폴백 사용 로그
 */
export interface FallbackUsedLog extends LogEntry {
  event: 'fallback_used';
  messageId: string;
  reason: string;
  elapsed: number;
}

/**
 * 이미지 검증 실패 로그
 */
export interface ImageValidationFailedLog extends LogEntry {
  event: 'image_validation_failed';
  url: string;
  error: string;
}

/**
 * 전송 실패 로그
 */
export interface SendFailedLog extends LogEntry {
  event: 'send_failed';
  error: string;
  cardTitle?: string;
  markdown?: string;
}

/**
 * 변환 실패 로그
 */
export interface ConversionFailedLog extends LogEntry {
  event: 'conversion_failed';
  error: string;
  markdown?: string;
}

/**
 * 검증 실패 로그
 */
export interface ValidationFailedLog extends LogEntry {
  event: 'validation_failed';
  error: string;
}

/**
 * 로그 설정
 */
export interface LogConfig {
  level: LogLevel;
  dir: string;
  retentionDays: number;
  enableConsole: boolean;
}
