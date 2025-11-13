/**
 * 로그 레벨 타입
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

/**
 * 로그 이벤트 타입 - 실제 코드에서 사용되는 모든 이벤트 타입을 포함
 */
export type LogEvent =
  | 'env_check'                      // 환경 변수 검사
  | 'server_starting'                // MCP 서버 시작
  | 'server_start_failed'            // 서버 시작 실패
  | 'sending_message'                // 메시지 전송 중
  | 'message_sent'                   // 메시지 전송 성공
  | 'send_failed'                    // 메시지 전송 실패
  | 'fallback_used'                  // 폴백 기능 사용
  | 'fallback_failed'                // 폴백 실패 (원본 및 폴백 모두 실패)
  | 'markdown_parse_failed'          // 마크다운 파싱 실패
  | 'conversion_failed'              // 형식 변환 실패
  | 'image_validation_failed'        // 이미지 검증 실패
  | 'validation_failed'              // 일반 검증 실패
  | 'invalid_webhook_url'            // 유효하지 않은 웹훅 URL
  | 'message_processing'             // 큰 메시지 분할 처리
  | 'chunk_sent'                     // 분할된 청크 전송 완료
  | 'chunk_send_failed'              // 분할된 청크 전송 실패

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
