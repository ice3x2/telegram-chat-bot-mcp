# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.15] - 2025-11-13

### Fixed
- **Windows MCP platform compatibility issue**: Removed @esbuild/linux-x64 from dependencies
  - Root cause: Linux-only binary package (@esbuild/linux-x64) was required in all environments
  - Issue: npm EBADPLATFORM error when installing on Windows systems
  - Impact: MCP server initialization failed in Windows-based IDEs (VS Code, Cursor, Copilot)
  - Solution: Removed platform-specific dependency, allowing esbuild to handle platform detection
  - Result: npm install now works seamlessly on both Windows and Linux environments
  - Verification: Build successful (tsc), 314 packages audited, 0 vulnerabilities

### 수정됨
- **Windows MCP 플랫폼 호환성 문제 해결**: @esbuild/linux-x64를 dependencies에서 제거
  - 근본 원인: Linux 전용 바이너리 패키지(@esbuild/linux-x64)가 모든 환경에서 필수로 설정됨
  - 문제: Windows 시스템에서 설치 시 npm EBADPLATFORM 에러 발생
  - 영향: Windows 기반 IDE(VS Code, Cursor, Copilot)에서 MCP 서버 초기화 실패
  - 해결: 플랫폼별 의존성 제거, esbuild가 플랫폼 감지를 자동 처리하도록 개선
  - 결과: Windows 및 Linux 환경에서 npm install 정상 작동
  - 검증: 빌드 성공(tsc), 314개 패키지 감사, 취약점 0개

## [0.1.14] - 2025-11-13

### Added
- **Markdown auto-splitting feature**: Intelligent document splitting for Telegram message size limits
  - New utility: `src/utils/markdownSplitter.ts` with core splitting logic
  - Measures actual HTML size after markdown-to-HTML conversion (accounts for entity escaping overhead)
  - Smart split-point detection: prefer `---` (horizontal rules) → `#` (headers) → `\n` (newlines)
  - Configurable search range (±30% of midpoint) to find natural semantic boundaries
  - Automatic page numbering for split chunks (format: `[1/5]`, `[2/5]`, etc.)
  - Sequential message sending with 1-second delays between chunks to respect Telegram rate limiting
- **HTML escaping enhancements**: Proper handling of special characters in markdown content
  - Escape `&`, `<`, `>`, `"`, `'` characters before wrapping in HTML tags
  - Fixes "Unmatched end tag" errors when markdown contains special characters in code blocks
  - Applied in `markdownToTelegram.ts` using callback-based regex replacements
- **Enhanced message processing logs**: New LogEvent types for tracking markdown splitting
  - `message_processing`: When large markdown splitting begins
  - `chunk_sent`: Individual chunk sent successfully
  - `chunk_send_failed`: Individual chunk failed
  - `fallback_to_text`: When HTML parsing fails and plain text is used

### Fixed
- **Over-splitting issue**: Documents under Telegram's 4096 character limit were unnecessarily split into many chunks
  - Root cause: Using estimated HTML size (markdown × 2) was inaccurate due to entity escaping (2x-3x overhead)
  - Solution: Measure actual HTML size by converting markdown to HTML first via `measureActualHtmlSize()`
  - Result: 21KB document reduced from 44 chunks → 17 chunks (reasonable split ratio)
  - Threshold: 4050 characters (4096 - 46 safety margin)
- **HTML parsing failures**: Improved error handling when markdown-to-HTML conversion fails
  - Try-catch fallback to plain text conversion
  - Graceful degradation instead of message send failure

### Changed
- **Logging system consolidation**: All logging now consolidated to console output
  - Part of v0.1.13 migration (file → console logging)
  - Updated all tools to use console-based output format
  - Removed all file I/O operations in logging calls

### Removed
- Deleted unnecessary markdown report files: ANALYSIS_REPORT.md, QUICK_FIX_SUMMARY.md, REMAINING_RISKS.md
- Deleted unnecessary test scripts: 9 integration/markdown/test files
- Cleaned up temporary log and test data

### 추가됨
- **마크다운 자동 분할 기능**: Telegram 메시지 크기 제한을 위한 지능형 문서 분할
  - 새로운 유틸리티: `src/utils/markdownSplitter.ts` (핵심 분할 로직)
  - 마크다운-HTML 변환 후 실제 HTML 크기 측정 (엔터티 이스케이프 오버헤드 고려)
  - 스마트 분할 지점 감지: `---` (수평선) → `#` (헤더) → `\n` (줄바꿈)
  - 자연스러운 시맨틱 경계를 찾기 위한 구성 가능한 검색 범위 (±30%)
  - 분할된 청크에 자동 페이지 번호 표시 (`[1/5]`, `[2/5]` 등)
  - 청크 간 1초 지연을 통한 순차 메시지 전송으로 Telegram 요청 제한 준수
- **HTML 이스케이프 개선**: 마크다운 콘텐츠의 특수 문자 처리
  - HTML 태그로 감싸기 전에 `&`, `<`, `>`, `"`, `'` 문자 이스케이프
  - 마크다운에 코드 블록의 특수 문자가 포함될 때 "Unmatched end tag" 에러 수정
  - `markdownToTelegram.ts`에서 콜백 기반 정규식 교체로 적용
- **향상된 메시지 처리 로그**: 마크다운 분할 추적을 위한 새로운 LogEvent 타입
  - `message_processing`: 큰 마크다운 분할이 시작될 때
  - `chunk_sent`: 개별 청크 전송 성공
  - `chunk_send_failed`: 개별 청크 전송 실패
  - `fallback_to_text`: HTML 파싱 실패 시 일반 텍스트 사용

### 수정됨
- **과다 분할 이슈**: Telegram의 4096 문자 제한 미만의 문서가 불필요하게 여러 청크로 분할됨
  - 원인: 추정 HTML 크기(마크다운 × 2) 부정확 (엔터티 이스케이프로 인해 2배-3배 오버헤드)
  - 해결: `measureActualHtmlSize()`를 통해 마크다운을 HTML로 변환하여 실제 크기 측정
  - 결과: 21KB 문서가 44개 청크 → 17개 청크로 감소 (합리적인 분할 비율)
  - 임계값: 4050 문자 (4096 - 46 안전 마진)
- **HTML 파싱 실패**: 마크다운-HTML 변환 실패 시 에러 처리 개선
  - Try-catch 폴백으로 일반 텍스트 변환
  - 메시지 전송 실패 대신 우아한 성능 저하

### 변경됨
- **로깅 시스템 통합**: 모든 로깅이 콘솔 출력으로 통합됨
  - v0.1.13 마이그레이션의 일부 (파일 → 콘솔 로깅)
  - 콘솔 기반 출력 형식을 사용하도록 모든 도구 업데이트
  - 로깅 호출에서 모든 파일 I/O 작업 제거

### 제거됨
- 불필요한 마크다운 보고서 파일 삭제: ANALYSIS_REPORT.md, QUICK_FIX_SUMMARY.md, REMAINING_RISKS.md
- 불필요한 테스트 스크립트 삭제: 9개 통합/마크다운/테스트 파일
- 임시 로그 및 테스트 데이터 정리

## [0.1.13] - 2025-11-13

### Changed
- **Logging architecture refactor**: Removed file-based logging entirely in favor of console-only output
  - Eliminates race conditions from multiple `setInterval` calls on reconnect
  - Fixes "works once, fails once" pattern in CLI reconnect operations
  - Improves compatibility with restricted environments (IDE, Docker, serverless)
  - Logger now outputs only to console/stderr (captured by IDE and container runtimes)

### Removed
- File logging system (`logger.ts` now console-only)
- Log cleanup scheduler (`logCleaner.ts` converted to no-op functions)
- All file I/O operations in logger (fs.mkdirSync, fs.appendFileSync)
- Fallback directory creation logic (no longer needed)

### Added
- Graceful shutdown handlers in `index.ts` for SIGTERM, SIGINT, uncaughtException, unhandledRejection

## [0.1.12] - 2025-11-13

### Fixed
- **Logger directory permission handling**: Improved fallback mechanism for restricted environments (IDE, Docker, etc.)
  - First attempt: HOME/.telegram-mcp-logs or LOG_DIR environment variable
  - First fallback: Windows C:\Temp or Unix /tmp
  - Second fallback: Console logging only (no process crash)
  - Fixes EPERM errors in restricted environments like IntelliJ IDEA, PyCharm, Docker containers

### Added
- New test script:
  - `test-logger-fallback.ts`: Test logger fallback mechanisms for permission-restricted directories
- npm test script:
  - `npm run test:logger:fallback`: Run logger fallback mechanism tests

### 수정됨
- **로거 디렉토리 권한 처리 개선**: 제한된 환경(IDE, Docker 등)에서의 폴백 메커니즘 개선
  - 첫 번째 시도: HOME/.telegram-mcp-logs 또는 LOG_DIR 환경변수
  - 첫 번째 폴백: Windows C:\Temp 또는 Unix /tmp
  - 두 번째 폴백: 콘솔 로깅만 사용 (프로세스 크래시 없음)
  - IntelliJ IDEA, PyCharm, Docker 컨테이너 등의 제한된 환경에서 EPERM 에러 해결

### 추가됨
- 새로운 테스트 스크립트:
  - `test-logger-fallback.ts`: 권한 제한 디렉토리에서의 로거 폴백 메커니즘 테스트
- npm 테스트 스크립트:
  - `npm run test:logger:fallback`: 로거 폴백 메커니즘 테스트 실행

## [0.1.11] - 2025-11-08

### Fixed
- **Markdown table rendering bug fix**: Fixed `[object object]` appearing in table cells
  - Root cause: Marked library parses cells as objects { text, tokens, align, header }
  - Extract text property from each cell object
  - Support both string and object cell formats for forward compatibility
- **Logger directory permission handling**: Improved fallback mechanism for restricted environments (IDE, Docker, etc.)
  - First attempt: HOME/.telegram-mcp-logs or LOG_DIR environment variable
  - First fallback: Windows C:\Temp or Unix /tmp
  - Second fallback: Console logging only (no process crash)
  - Fixes EPERM errors in restricted environments like IntelliJ IDEA, PyCharm, Docker containers

### Added
- New test scripts:
  - `test-marked-table-debug.ts`: Debug script to analyze Marked library table parsing
  - `test-table-conversion.ts`: Comprehensive table markdown-to-HTML conversion tests
    - Basic tables, tables with headings, multi-column tables, special characters
  - `test-logger-fallback.ts`: Test logger fallback mechanisms for permission-restricted directories
- npm test scripts:
  - `npm run test:table`: Run table conversion tests
  - `npm run test:logger:fallback`: Run logger fallback mechanism tests

### 수정됨
- **마크다운 테이블 렌더링 버그 수정**: 테이블 셀에 `[object object]`가 나오는 문제 수정
  - 원인: Marked 라이브러리가 셀을 { text, tokens, align, header } 객체로 파싱
  - 각 셀 객체에서 text 속성 추출
  - 문자열 및 객체 셀 형식 모두 지원 (향후 호환성)
- **로거 디렉토리 권한 처리 개선**: 제한된 환경(IDE, Docker 등)에서의 폴백 메커니즘 개선
  - 첫 번째 시도: HOME/.telegram-mcp-logs 또는 LOG_DIR 환경변수
  - 첫 번째 폴백: Windows C:\Temp 또는 Unix /tmp
  - 두 번째 폴백: 콘솔 로깅만 사용 (프로세스 크래시 없음)
  - IntelliJ IDEA, PyCharm, Docker 컨테이너 등의 제한된 환경에서 EPERM 에러 해결

### 추가됨
- 새로운 테스트 스크립트:
  - `test-marked-table-debug.ts`: Marked 라이브러리 테이블 파싱 분석 스크립트
  - `test-table-conversion.ts`: 종합 마크다운-HTML 변환 테스트
    - 기본 테이블, 제목 있는 테이블, 다중 열 테이블, 특수문자 포함
  - `test-logger-fallback.ts`: 권한 제한 디렉토리에서의 로거 폴백 메커니즘 테스트
- npm 테스트 스크립트:
  - `npm run test:table`: 테이블 변환 테스트 실행
  - `npm run test:logger:fallback`: 로거 폴백 메커니즘 테스트 실행

## [0.1.10] - 2025-11-08

### Fixed
- **Logger cleanOldLogs() bug fix**: Fixed ENOENT error when log directory is empty string
  - Add fallback to use home directory path when logDir is empty
  - Check if directory exists before attempting to read files
  - Improve error handling to prevent app crash on log cleanup failure
  - Only log errors to console, allow app to continue operation

### Added
- New test scripts:
  - `test-clean-old-logs.ts`: Test cleanOldLogs() with various edge cases
- npm test scripts:
  - `npm run test:clean:logs`: Run log cleanup tests

### 수정됨
- **Logger cleanOldLogs() 버그 수정**: 로그 디렉토리가 빈 문자열일 때 ENOENT 에러 수정
  - logDir이 비어있을 때 홈 디렉토리 경로 사용
  - 파일을 읽기 전에 디렉토리 존재 여부 확인
  - 로그 정리 실패 시 앱이 죽지 않도록 에러 처리 개선
  - 에러는 콘솔에만 로깅하고 앱은 계속 실행

### 추가됨
- 새로운 테스트 스크립트:
  - `test-clean-old-logs.ts`: 다양한 엣지 케이스에서 cleanOldLogs() 테스트
- npm 테스트 스크립트:
  - `npm run test:clean:logs`: 로그 정리 테스트 실행

## [0.1.9] - 2025-11-08

### Added
- Comprehensive logger resilience test (`test-logger-resilience.ts`)
  - Verify logger doesn't crash with read-only directories
  - Verify automatic directory creation for log paths
  - Verify safe operation with missing environment variables

### Fixed
- **Logger Error Handling**: Improved robustness in production environments
  - Implement try-catch in `ensureLogDir()` for safe directory creation
  - Use user home directory as fallback location (~/.telegram-mcp-logs)
  - Add console fallback when file writing fails (no process crash)
  - Handle missing LOG_DIR environment variable gracefully
  - Ensure no log loss with multi-layer error recovery
- **Security**: Remove all hardcoded credentials from git history
  - Use git-filter-repo to remove exposed bot token from all 31 commits
  - Replace with PLACEHOLDER_BOT_TOKEN in historical commits
  - Strengthen .gitignore to prevent future credential leaks

### Changed
- **Documentation**: Enhanced security best practices
  - Add environment variable setup instructions for safe deployment
  - Document .env file usage for local development

### 추가됨
- 종합 로거 복원력 테스트 (`test-logger-resilience.ts`)
  - 읽기 전용 디렉토리에서 로거가 크래시하지 않는지 확인
  - 로그 경로 자동 생성 확인
  - 환경변수 누락 상태에서 안전한 동작 확인

### 수정됨
- **Logger 에러 처리**: 프로덕션 환경에서의 견고성 개선
  - `ensureLogDir()`에 try-catch 추가로 안전한 디렉토리 생성
  - 사용자 홈 디렉토리를 폴백 위치로 사용 (~/.telegram-mcp-logs)
  - 파일 쓰기 실패 시 콘솔로 폴백 (프로세스 크래시 없음)
  - LOG_DIR 환경변수 누락 상태 안전하게 처리
  - 다중 레이어 에러 복구로 로그 손실 없음
- **보안**: git 히스토리에서 모든 하드코딩된 자격증명 제거
  - git-filter-repo를 사용하여 모든 31개 커밋에서 노출된 봇 토큰 제거
  - 히스토리 커밋에서 PLACEHOLDER_BOT_TOKEN으로 대체
  - .gitignore 강화로 향후 자격증명 누출 방지

### 변경됨
- **문서화**: 향상된 보안 모범 사례
  - 안전한 배포를 위한 환경변수 설정 지침 추가
  - 로컬 개발을 위한 .env 파일 사용 문서화

---

## [0.1.8] - 2025-11-06

### Changed
- **Documentation**: Comprehensive README.md overhaul
  - Added Installation section with npm and npx instructions
  - Added detailed MCP client configuration for 5 major AI tools:
    - Claude Desktop (with correct config file paths)
    - Claude Code (CLI) with priority order and reconnect commands
    - VS Code (GitHub Copilot) with workspace and user settings
    - Cursor IDE with global and project configs
    - Windsurf IDE (Codeium) with platform-specific paths
  - Added Troubleshooting section for common issues
  - Fixed incorrect file path references (.claude.json → mcp.json)
  - Ensured perfect English-Korean content parity
- **Code Quality**: Removed all TypeScript lint warnings from test scripts
  - Added proper type definitions (TelegramResult, McpTool, etc.)
  - Replaced all `any` types with specific types in scripts/
  - Fixed unused variable warnings

### 변경됨
- **문서화**: README.md 대대적 개선
  - npm 및 npx 설치 방법이 포함된 Installation 섹션 추가
  - 5개 주요 AI 도구에 대한 상세한 MCP 클라이언트 설정 추가:
    - Claude Desktop (정확한 설정 파일 경로)
    - Claude Code (CLI) 우선순위 및 재연결 명령어 포함
    - VS Code (GitHub Copilot) 워크스페이스 및 사용자 설정
    - Cursor IDE 전역 및 프로젝트 설정
    - Windsurf IDE (Codeium) 플랫폼별 경로
  - 일반적인 문제에 대한 Troubleshooting 섹션 추가
  - 잘못된 파일 경로 참조 수정 (.claude.json → mcp.json)
  - 영어-한글 내용 완벽 일치 보장
- **코드 품질**: 테스트 스크립트의 모든 TypeScript lint 경고 제거
  - 적절한 타입 정의 추가 (TelegramResult, McpTool 등)
  - scripts/의 모든 `any` 타입을 특정 타입으로 교체
  - 사용되지 않는 변수 경고 수정

---

## [0.1.7] - 2025-11-06

### Added
- Centralized axios configuration with IPv4 enforcement for WSL compatibility
- Test helper functions (`test-helpers.ts`) to reduce code duplication
- Enhanced error logging with error codes and stack traces
- MCP agent simulator test script for protocol validation
- All 5 MCP tools now properly registered and functional:
  - `send_telegram_text`
  - `send_telegram_markdown`
  - `send_telegram_with_buttons` (newly registered)
  - `send_telegram_photo` (newly registered)
  - `markdown_to_telegram_html` (newly registered)

### Fixed
- **Critical**: Fixed MCP protocol integration - inputSchema type casting issue
  - Changed from `z.object() as any` to proper `ZodRawShape` format
  - All tools now properly expose their schemas to MCP clients
- **Critical**: WSL IPv6 timeout issues resolved (ETIMEDOUT errors)
  - Force IPv4 connections to Telegram API
  - Increased timeouts for slow networks (10-15 seconds)
- GitHub Actions CI/CD pipeline failures
  - Added `package-lock.json` for reproducible builds
  - Added `test` script to package.json

### Changed
- Refactored all test scripts to use common helper functions
  - Reduced code duplication by ~26 lines
  - Improved test readability and maintainability
- Improved error messages with detailed context (error codes, response data)
- Increased network timeouts for better reliability

### Removed
- Unused Cards V2 test code and snapshots (13 files, 667 lines)
- Empty `src/test/` directory
- Legacy Google Chat integration artifacts from `dist/`

---

## [0.1.7] - 2025-11-06

### 추가됨
- WSL 호환성을 위한 IPv4 강제 설정의 중앙화된 axios 구성
- 코드 중복을 줄이기 위한 테스트 헬퍼 함수 (`test-helpers.ts`)
- 에러 코드 및 스택 트레이스를 포함한 향상된 에러 로깅
- 프로토콜 검증을 위한 MCP 에이전트 시뮬레이터 테스트 스크립트
- 5개 MCP 도구 모두 정상 등록 및 작동:
  - `send_telegram_text`
  - `send_telegram_markdown`
  - `send_telegram_with_buttons` (새로 등록)
  - `send_telegram_photo` (새로 등록)
  - `markdown_to_telegram_html` (새로 등록)

### 수정됨
- **치명적**: MCP 프로토콜 통합 수정 - inputSchema 타입 캐스팅 문제
  - `z.object() as any`에서 올바른 `ZodRawShape` 형식으로 변경
  - 모든 도구가 MCP 클라이언트에 스키마를 제대로 노출
- **치명적**: WSL IPv6 타임아웃 문제 해결 (ETIMEDOUT 에러)
  - Telegram API에 IPv4 연결 강제
  - 느린 네트워크를 위해 타임아웃 증가 (10-15초)
- GitHub Actions CI/CD 파이프라인 실패 해결
  - 재현 가능한 빌드를 위한 `package-lock.json` 추가
  - package.json에 `test` 스크립트 추가

### 변경됨
- 공통 헬퍼 함수를 사용하도록 모든 테스트 스크립트 리팩토링
  - 약 26줄의 코드 중복 감소
  - 테스트 가독성 및 유지보수성 개선
- 상세 컨텍스트(에러 코드, 응답 데이터)를 포함한 에러 메시지 개선
- 더 나은 안정성을 위해 네트워크 타임아웃 증가

### 제거됨
- 사용되지 않는 Cards V2 테스트 코드 및 스냅샷 (13개 파일, 667줄)
- 빈 `src/test/` 디렉토리
- `dist/`의 레거시 Google Chat 통합 잔해

---

[0.1.7]: https://github.com/ice3x2/telegram-chat-bot-mcp/compare/v0.1.6...v0.1.7
