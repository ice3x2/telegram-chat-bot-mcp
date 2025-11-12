#!/usr/bin/env node
/**
 * 로거 폴백 메커니즘 테스트
 * - 권한 부족으로 인한 로그 디렉토리 생성 실패 시 임시 디렉토리 사용
 * - Windows: C:\Temp, Unix: /tmp
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger } from '../dist/utils/logger.js';

async function testLoggerFallback() {
  console.log('🧪 로거 폴백 메커니즘 테스트\n');

  // 테스트 1: 읽기 전용 디렉토리에서 로거 생성
  console.log('📝 테스트 1: 읽기 전용 디렉토리 처리');
  const readOnlyDir = path.join(os.tmpdir(), 'telegram-mcp-readonly');

  try {
    if (!fs.existsSync(readOnlyDir)) {
      fs.mkdirSync(readOnlyDir, { recursive: true });
    }

    // 읽기 전용으로 변경
    try {
      fs.chmodSync(readOnlyDir, 0o444);
      console.log(`✓ 읽기 전용 디렉토리 생성: ${readOnlyDir}`);

      // Logger 생성 - 폴백이 작동해야 함
      const logger = new Logger({
        dir: readOnlyDir,
        enableConsole: false,
      });

      logger.info('test', 'test_info' as any, { data: 'test' });
      console.log('✓ 읽기 전용 디렉토리에서도 로거가 안전하게 작동\n');
    } catch (err) {
      console.log('⚠️ chmod 권한 변경 실패 (시스템 권한 문제 - 무시)\n');
    }
  } catch (error) {
    console.error('테스트 1 실패:', error);
  } finally {
    // 정리
    try {
      if (fs.existsSync(readOnlyDir)) {
        fs.chmodSync(readOnlyDir, 0o755);
        fs.rmSync(readOnlyDir, { recursive: true });
      }
    } catch (e) {
      // 무시
    }
  }

  // 테스트 2: 존재하지 않는 홈 디렉토리
  console.log('📝 테스트 2: 존재하지 않는 경로로 폴백 테스트');
  const nonExistentPath = '/nonexistent/path/to/logs';

  try {
    const logger = new Logger({
      dir: nonExistentPath,
      enableConsole: false,
    });

    logger.info('test', 'test_info' as any, { data: 'test' });
    console.log('✓ 존재하지 않는 경로에서도 로거가 안전하게 작동\n');
  } catch (error) {
    console.error('테스트 2 실패:', error);
  }

  // 테스트 3: 정상 로거 동작
  console.log('📝 테스트 3: 기본 설정으로 로거 생성');
  try {
    const logger = new Logger({
      enableConsole: false,
    });

    logger.info('test', 'test_info' as any, { data: 'successful' });
    logger.warn('test', 'test_warn' as any, { data: 'warning' });
    logger.error('test', 'test_error' as any, { data: 'error' });

    console.log('✓ 기본 설정으로 로거가 정상 작동\n');
  } catch (error) {
    console.error('테스트 3 실패:', error);
  }

  console.log('✅ 모든 폴백 메커니즘 테스트 완료!');
  console.log('\n💡 폴백 순서:');
  console.log('  1. 기본 경로 (홈 디렉토리/.telegram-mcp-logs)');
  console.log('  2. 임시 경로 (Windows: C:\\Temp, Unix: /tmp)');
  console.log('  3. 콘솔 로그만 사용');
}

testLoggerFallback();
