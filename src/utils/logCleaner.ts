import { logger } from './logger.js';

/**
 * 로그 정리 유틸리티
 * - 주기적으로 오래된 로그 파일 삭제
 * - 서버 시작 시 자동 실행
 */

/**
 * 로그 정리 스케줄러 시작
 * @param intervalHours 정리 주기 (시간 단위, 기본 24시간)
 */
export function startLogCleanupScheduler(intervalHours: number = 24): void {
  // 즉시 한 번 실행
  logger.cleanOldLogs();

  // 주기적으로 실행
  const intervalMs = intervalHours * 60 * 60 * 1000;
  setInterval(() => {
    logger.cleanOldLogs();
  }, intervalMs);

  logger.info('logCleaner', 'message_sent' as any, {
    message: 'Log cleanup scheduler started',
    intervalHours,
  });
}

/**
 * 수동 로그 정리 실행
 */
export function cleanLogsNow(): void {
  logger.cleanOldLogs();
}
