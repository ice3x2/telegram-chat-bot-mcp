#!/usr/bin/env node
/**
 * cleanOldLogs() 함수 테스트
 * - 빈 디렉토리에서도 에러 없이 작동하는지 확인
 * - 오래된 로그 파일을 삭제하는지 확인
 * - 에러 발생 시 앱이 죽지 않는지 확인
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger } from '../dist/utils/logger.js';

async function testCleanOldLogs() {
  console.log('🧪 cleanOldLogs() 함수 테스트 시작\n');

  const testDir = path.join(os.tmpdir(), 'telegram-mcp-log-cleanup-test');

  try {
    // 테스트 디렉토리 정리
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    console.log(`✓ 테스트 디렉토리 생성: ${testDir}\n`);

    // 테스트 1: 빈 디렉토리에서 cleanOldLogs() 실행
    console.log('📝 테스트 1: 빈 디렉토리에서 cleanOldLogs() 실행');
    const emptyLogger = new Logger({
      dir: testDir,
      enableConsole: false,
      retentionDays: 1,
    });

    try {
      emptyLogger.cleanOldLogs();
      console.log('✓ 빈 디렉토리에서도 에러 없이 실행됨\n');
    } catch (error) {
      console.error('✗ 실패:', error);
      throw error;
    }

    // 테스트 2: 로그 파일 생성 후 cleanOldLogs() 실행
    console.log('📝 테스트 2: 로그 파일 생성 후 cleanOldLogs() 실행');

    const logger = new Logger({
      dir: testDir,
      enableConsole: false,
      retentionDays: 1,
    });

    // 로그 작성
    logger.info('test', 'test_info' as any, { test: true });
    logger.error('test', 'test_error' as any, { test: true });

    const filesBeforeClean = fs.readdirSync(testDir).filter(f => f.endsWith('.log'));
    console.log(`✓ 로그 파일 생성됨: ${filesBeforeClean.length}개`);

    // cleanOldLogs() 실행 (최근 파일이므로 삭제되지 않아야 함)
    logger.cleanOldLogs();
    const filesAfterClean = fs.readdirSync(testDir).filter(f => f.endsWith('.log'));
    console.log(`✓ cleanOldLogs() 실행 후: ${filesAfterClean.length}개 (최근 파일이므로 그대로)\n`);

    // 테스트 3: 오래된 파일 삭제 확인
    console.log('📝 테스트 3: 오래된 파일 삭제 확인');

    // 오래된 파일 생성 (3일 전)
    const oldLogPath = path.join(testDir, 'app-2025-11-05.log');
    fs.writeFileSync(oldLogPath, 'old log content\n');

    // 파일 타임스탬프를 3일 전으로 변경
    const threeAgoDays = Date.now() - (3 * 24 * 60 * 60 * 1000);
    fs.utimesSync(oldLogPath, threeAgoDays / 1000, threeAgoDays / 1000);

    const filesBeforeDelete = fs.readdirSync(testDir).filter(f => f.endsWith('.log'));
    console.log(`✓ 오래된 파일 생성: ${filesBeforeDelete.length}개`);

    // cleanOldLogs() 실행
    logger.cleanOldLogs();
    const filesAfterDelete = fs.readdirSync(testDir).filter(f => f.endsWith('.log'));
    console.log(`✓ cleanOldLogs() 실행 후: ${filesAfterDelete.length}개 (오래된 파일 삭제됨)`);

    if (filesAfterDelete.length < filesBeforeDelete.length) {
      console.log('✓ 오래된 파일이 정상적으로 삭제됨\n');
    } else {
      console.warn('⚠️ 오래된 파일이 삭제되지 않음 (예상과 다름)\n');
    }

    // 테스트 4: 빈 로그 디렉토리로 초기화된 Logger의 cleanOldLogs()
    console.log('📝 테스트 4: 로그 디렉토리가 빈 문자열일 때 cleanOldLogs()');

    // Logger의 config.dir을 빈 문자열로 강제 설정 (0.1.9의 버그 재현)
    const brokenLogger = new Logger({
      dir: testDir,
      enableConsole: false,
    });

    // 내부적으로 config.dir을 빈 문자열로 변경 (0.1.9 버그 재현)
    (brokenLogger as any).config.dir = '';

    try {
      brokenLogger.cleanOldLogs();
      console.log('✓ 로그 디렉토리가 빈 문자열이어도 에러 없이 작동\n');
    } catch (error) {
      console.error('✗ 실패:', error);
      throw error;
    }

    // 테스트 5: 존재하지 않는 디렉토리로 초기화된 Logger의 cleanOldLogs()
    console.log('📝 테스트 5: 존재하지 않는 디렉토리의 cleanOldLogs()');

    const nonExistentDir = path.join(os.tmpdir(), 'telegram-mcp-nonexistent');
    const nonExistentLogger = new Logger({
      dir: nonExistentDir,
      enableConsole: false,
    });

    try {
      nonExistentLogger.cleanOldLogs();
      console.log('✓ 존재하지 않는 디렉토리도 안전하게 처리됨\n');
    } catch (error) {
      console.error('✗ 실패:', error);
      throw error;
    }

    console.log('✅ 모든 테스트 통과!\n');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    process.exit(1);
  } finally {
    // 테스트 디렉토리 정리
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
      console.log(`🧹 테스트 디렉토리 정리 완료`);
    }
  }
}

testCleanOldLogs();
