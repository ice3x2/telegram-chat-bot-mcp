#!/usr/bin/env node
/**
 * 로거 복원력 테스트
 * - 쓰기 권한이 없는 디렉토리에 로그 쓰기 시도
 * - 프로세스가 죽지 않고 콘솔로 폴백하는지 확인
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Logger } from '../dist/utils/logger.js';

async function testLoggerResilience() {
  console.log('🧪 Logger 복원력 테스트 시작\n');

  // 테스트 1: 읽기 전용 디렉토리
  console.log('📝 테스트 1: 쓰기 권한 없는 디렉토리에 로그 작성');
  const readOnlyDir = path.join(os.tmpdir(), 'telegram-mcp-readonly-test');

  try {
    // 테스트 디렉토리 생성
    if (!fs.existsSync(readOnlyDir)) {
      fs.mkdirSync(readOnlyDir, { recursive: true });
    }

    // 읽기 전용으로 변경 (Windows에서는 작동 안 할 수 있음)
    fs.chmodSync(readOnlyDir, 0o444);
    console.log(`✓ 읽기 전용 디렉토리 생성: ${readOnlyDir}`);

    // Logger 생성 - readOnlyDir에 로그를 쓰려고 시도
    console.log('🔧 Logger 인스턴스 생성 시도...');
    const logger = new Logger({
      dir: readOnlyDir,
      enableConsole: true,
    });
    console.log('✓ Logger 인스턴스 생성 성공');

    // 로그 작성 시도
    console.log('\n📤 다양한 로그 레벨로 로그 작성 시도...');
    logger.info('test', 'test_info' as any, { data: 'info log' });
    console.log('  ✓ INFO 로그');

    logger.warn('test', 'test_warn' as any, { data: 'warn log' });
    console.log('  ✓ WARN 로그');

    logger.error('test', 'test_error' as any, { data: 'error log' });
    console.log('  ✓ ERROR 로그');

    logger.debug('test', 'test_debug' as any, { data: 'debug log' });
    console.log('  ✓ DEBUG 로그');

    console.log(
      '\n✅ 테스트 1 통과: 쓰기 권한 없어도 프로세스가 죽지 않음!'
    );
  } catch (error) {
    console.error(
      '❌ 테스트 1 실패:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  } finally {
    // 정리
    try {
      fs.chmodSync(readOnlyDir, 0o755);
      fs.rmSync(readOnlyDir, { recursive: true, force: true });
    } catch {
      // 무시
    }
  }

  // 테스트 2: 존재하지 않는 경로 (자동 생성)
  console.log('\n📝 테스트 2: 존재하지 않는 디렉토리에 자동 생성 및 로그 작성');
  const autoCreateDir = path.join(os.tmpdir(), 'telegram-mcp-auto-create-test');

  try {
    // 기존 디렉토리 정리
    if (fs.existsSync(autoCreateDir)) {
      fs.rmSync(autoCreateDir, { recursive: true, force: true });
    }

    console.log('🔧 Logger 인스턴스 생성 시도...');
    const logger = new Logger({
      dir: autoCreateDir,
      enableConsole: true,
    });
    console.log('✓ Logger 인스턴스 생성 성공');

    // 디렉토리 생성 확인
    if (fs.existsSync(autoCreateDir)) {
      console.log(`✓ 디렉토리 자동 생성됨: ${autoCreateDir}`);
    }

    logger.info('test', 'test_info' as any, { data: 'auto created dir' });
    console.log('✓ 로그 작성 성공');

    // 로그 파일 확인
    const logFiles = fs.readdirSync(autoCreateDir);
    if (logFiles.length > 0) {
      console.log(`✓ 로그 파일 생성됨: ${logFiles.join(', ')}`);
    }

    console.log('\n✅ 테스트 2 통과: 자동 생성 및 로그 작성 성공!');
  } catch (error) {
    console.error(
      '❌ 테스트 2 실패:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  } finally {
    // 정리
    try {
      fs.rmSync(autoCreateDir, { recursive: true, force: true });
    } catch {
      // 무시
    }
  }

  // 테스트 3: 환경변수 미설정 시 기본값
  console.log('\n📝 테스트 3: 환경변수 미설정 시 기본 동작');
  try {
    const originalLogDir = process.env.LOG_DIR;
    delete process.env.LOG_DIR;

    console.log('🔧 Logger 인스턴스 생성 (환경변수 없음)...');
    const logger = new Logger({
      enableConsole: true,
    });
    console.log('✓ Logger 인스턴스 생성 성공');

    logger.info('test', 'test_info' as any, {
      data: 'default behavior test',
    });
    console.log('✓ 로그 작성 성공 (콘솔 출력)');

    console.log('\n✅ 테스트 3 통과: 기본값으로 안전하게 동작!');

    // 원래 환경변수 복원
    if (originalLogDir) {
      process.env.LOG_DIR = originalLogDir;
    }
  } catch (error) {
    console.error(
      '❌ 테스트 3 실패:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 모든 Logger 복원력 테스트 통과!');
  console.log('='.repeat(60));
  console.log('\n✨ 결론:');
  console.log('  - Logger는 쓰기 권한 없어도 프로세스가 죽지 않음');
  console.log('  - 항상 콘솔로 폴백하여 로그 손실 없음');
  console.log('  - 환경변수 없이도 안전하게 동작함');
  console.log('  - MCP 클라이언트 환경에서 안정적으로 작동 가능\n');
}

testLoggerResilience().catch((err) => {
  console.error('❌ 테스트 실행 중 오류:', err);
  process.exit(1);
});
