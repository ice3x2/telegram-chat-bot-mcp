import { logger } from './logger.js';

/**
 * 로그 정리 유틸리티 (더 이상 사용 안 함)
 * 파일 로그가 제거되었으므로 정리할 것이 없음
 * 콘솔 로그만 사용하므로 No-op
 */

/**
 * 로그 정리 스케줄러 시작 (No-op)
 * @deprecated 파일 로그가 제거되었으므로 더 이상 사용하지 않음
 */
export function startLogCleanupScheduler(intervalHours: number = 24): void {
  // No-op: 파일 로그가 없으므로 정리할 것이 없음
  logger.info('logCleaner', 'message_sent' as any, {
    message: 'Log cleanup scheduler disabled (console logging only)',
  });
}

/**
 * 로그 정리 스케줄러 중지 (No-op)
 * @deprecated 파일 로그가 제거되었으므로 더 이상 사용하지 않음
 */
export function stopLogCleanupScheduler(): void {
  // No-op: 실행할 리소스가 없음
}

/**
 * 수동 로그 정리 실행 (No-op)
 * @deprecated 파일 로그가 제거되었으므로 더 이상 사용하지 않음
 */
export function cleanLogsNow(): void {
  // No-op: 파일 로그가 없음
}
