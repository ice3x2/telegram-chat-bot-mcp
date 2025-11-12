import { LogLevel, LogEntry, LogEvent } from '../types/log.js';

/**
 * 간단한 콘솔 로거
 * - 파일 로그 제거 (MCP 서버 환경에서는 불필요)
 * - 콘솔 출력만 사용
 * - IDE의 로그 패널에서 자동 캡처됨
 */
export class Logger {
  private config: {
    level: LogLevel;
    enableConsole: boolean;
  };

  private logLevelPriority: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor(config?: Partial<typeof Logger.prototype.config>) {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'INFO',
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      ...config,
    };
  }

  /**
   * 로그 레벨 체크
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      this.logLevelPriority[level] >= this.logLevelPriority[this.config.level]
    );
  }

  /**
   * 콘솔에 로그 출력
   */
  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    if (this.config.enableConsole) {
      const timestamp = new Date(entry.timestamp).toISOString();
      const color = this.getLogColor(entry.level);
      const logMessage = `${color}[${timestamp}] [${entry.level}] [${entry.module}] ${entry.event}${this.resetColor()}`;

      // 추가 데이터가 있으면 JSON으로 함께 출력
      const { timestamp: _ts, level: _lvl, module: _mod, event: _evt, ...data } = entry;

      if (Object.keys(data).length > 0) {
        console.log(logMessage, JSON.stringify(data));
      } else {
        console.log(logMessage);
      }
    }
  }

  /**
   * 로그 색상 (콘솔 출력용)
   */
  private getLogColor(level: LogLevel): string {
    const colors: Record<LogLevel, string> = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m', // Green
      WARN: '\x1b[33m', // Yellow
      ERROR: '\x1b[31m', // Red
    };
    return colors[level] || '';
  }

  private resetColor(): string {
    return '\x1b[0m';
  }

  /**
   * 범용 로그 메서드
   */
  public log(
    level: LogLevel,
    module: string,
    event: LogEvent,
    data?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      event,
      ...data,
    };
    this.writeLog(entry);
  }

  /**
   * INFO 레벨 로그
   */
  public info(
    module: string,
    event: LogEvent,
    data?: Record<string, any>
  ): void {
    this.log('INFO', module, event, data);
  }

  /**
   * WARN 레벨 로그
   */
  public warn(
    module: string,
    event: LogEvent,
    data?: Record<string, any>
  ): void {
    this.log('WARN', module, event, data);
  }

  /**
   * ERROR 레벨 로그
   */
  public error(
    module: string,
    event: LogEvent,
    data?: Record<string, any>
  ): void {
    this.log('ERROR', module, event, data);
  }

  /**
   * DEBUG 레벨 로그
   */
  public debug(
    module: string,
    event: LogEvent,
    data?: Record<string, any>
  ): void {
    this.log('DEBUG', module, event, data);
  }

  /**
   * 파일 로그 정리 (더 이상 사용 안 함)
   * MCP 서버는 파일 로그를 사용하지 않으므로 No-op
   */
  public cleanOldLogs(): void {
    // No-op: 파일 로그가 없음
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();
