import * as fs from 'fs';
import * as path from 'path';
import { LogLevel, LogEntry, LogConfig, LogEvent } from '../types/log.js';

/**
 * 간단한 파일 기반 로거
 * - 일별 로그 파일 생성
 * - 30일 자동 정리
 * - JSON 형식 로그
 */
export class Logger {
  private config: LogConfig;
  private logLevelPriority: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  constructor(config?: Partial<LogConfig>) {
    this.config = {
      level: (process.env.LOG_LEVEL as LogLevel) || 'INFO',
      dir: process.env.LOG_DIR || './logs',
      retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '30', 10),
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      ...config,
    };

    this.ensureLogDir();
  }

  /**
   * 로그 디렉토리 생성
   */
  private ensureLogDir(): void {
    if (!fs.existsSync(this.config.dir)) {
      fs.mkdirSync(this.config.dir, { recursive: true });
    }
  }

  /**
   * 현재 날짜 기반 로그 파일명 생성
   */
  private getLogFilename(isError: boolean = false): string {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const prefix = isError ? 'errors' : 'app';
    return path.join(this.config.dir, `${prefix}-${date}.log`);
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
   * 로그 엔트리 작성
   */
  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const logLine = JSON.stringify(entry) + '\n';

    // 일반 로그 파일에 작성
    fs.appendFileSync(this.getLogFilename(false), logLine, 'utf-8');

    // 에러 로그는 별도 파일에도 작성
    if (entry.level === 'ERROR') {
      fs.appendFileSync(this.getLogFilename(true), logLine, 'utf-8');
    }

    // 콘솔 출력
    if (this.config.enableConsole) {
      const timestamp = new Date(entry.timestamp).toISOString();
      const color = this.getLogColor(entry.level);
      console.log(
        `${color}[${timestamp}] [${entry.level}] [${entry.module}] ${entry.event}${this.resetColor()}`,
        entry
      );
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
   * 오래된 로그 파일 정리
   */
  public cleanOldLogs(): void {
    try {
      const files = fs.readdirSync(this.config.dir);
      const now = Date.now();
      const maxAge = this.config.retentionDays * 24 * 60 * 60 * 1000; // 밀리초

      let deletedCount = 0;

      files.forEach((file) => {
        if (file.endsWith('.log')) {
          const filePath = path.join(this.config.dir, file);
          const stats = fs.statSync(filePath);
          const age = now - stats.mtimeMs;

          if (age > maxAge) {
            fs.unlinkSync(filePath);
            deletedCount++;
          }
        }
      });

      if (deletedCount > 0) {
        this.info('logCleaner', 'message_sent' as LogEvent, {
          deletedFiles: deletedCount,
          retentionDays: this.config.retentionDays,
        });
      }
    } catch (error) {
      this.error('logCleaner', 'send_failed' as LogEvent, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

// 싱글톤 인스턴스
export const logger = new Logger();
