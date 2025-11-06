# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
