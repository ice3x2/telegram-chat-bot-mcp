# Telegram Bot MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/telegram-chat-bot-mcp.svg)](https://www.npmjs.com/package/telegram-chat-bot-mcp)

An MCP (Model Context Protocol) server for sending messages via Telegram Bot API.

## Key Features

- 🤖 **Telegram Bot API Integration**: Send messages directly to Telegram chats (personal/group)
- 📝 **Markdown → HTML Auto-conversion**: Supports headers, lists, code blocks, tables (monospace), images, etc.
- 🖼️ **Image URL Validation**: Pre-validates HTTP status, Content-Type, file size
- 🔄 **Auto Fallback**: Automatically falls back to plain text when HTML parsing/sending fails
- 📊 **Structured Logging**: JSON format logs with 30-day retention policy
- 🚀 **MCP Protocol Support**: Works with Claude Desktop, Claude Code, VS Code Copilot, Cursor, and more
- ⌨️ **Inline Keyboards**: Support for buttons with URL, callback_data, etc.
- 🖼️ **Photo Sending**: Send photos with captions

## Installation

### Via npm (Global Installation)
```bash
npm install -g telegram-chat-bot-mcp
```

### Via npx (No Installation Required)
```bash
npx telegram-chat-bot-mcp
```

## Telegram Bot Setup

### 1) Create Bot via @BotFather

1. Search for **@BotFather** in Telegram
2. Send the `/newbot` command and follow instructions
3. Set bot name and username (username must end with `bot`)
4. Save the Bot Token (format: `<digits>:<alphanumeric_string>`)

### 2) Get Chat ID

**Methods:**

- **Use @userinfobot or @getidsbot**: Start the bot to see your user ID
- **For groups**: Add bot to group, send a test message, then call:
  ```
  https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
  ```
  Find the `chat.id` value (group IDs are negative, e.g., `-1001234567890`)

## MCP Client Configuration

This MCP server integrates with various AI coding tools. Choose your tool below:

### Claude Desktop

**Configuration file:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Access:** Claude > Settings > Developer > Edit Config

**Example:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### Claude Code (CLI)

**Configuration files (by priority):**
1. **Project** (team-shared): `.mcp.json` (at project root)
2. **User** (global): `~/.config/claude-code/mcp.json`

**Add server via command:**
```bash
# Manual method
nano ~/.config/claude-code/mcp.json

# After changes, reconnect
claude mcp reconnect telegram
```

**Example:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### VS Code (GitHub Copilot)

**Requirements:** VS Code 1.99+ (March 2025), Agent Mode enabled

**Configuration files:**
- **Workspace**: `.vscode/mcp.json` (project-specific)
- **User**: Command Palette > "MCP: Open User Configuration"

**Example (.vscode/mcp.json):**
```json
{
  "servers": {
    "telegram": {
      "type": "stdio",
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### Cursor IDE

**Configuration files:**
- **Global**: `~/.cursor/mcp.json`
- **Project**: `.cursor/mcp.json`

**Access:** Settings > MCP or direct file edit

**Example:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["-y", "telegram-chat-bot-mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### Windsurf IDE (Codeium)

**Configuration file:**
- **macOS**: `~/.codeium/windsurf/mcp_config.json`
- **Windows**: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

**Access:** Cascade toolbar > Hammer icon > Configure

**Example:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["-y", "telegram-chat-bot-mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

## Provided Tools (5)

1. **`send_telegram_text`** — Send plain text messages
2. **`send_telegram_markdown`** — Convert Markdown to Telegram HTML and send (recommended)
3. **`send_telegram_with_buttons`** — Send messages with inline keyboard buttons
4. **`send_telegram_photo`** — Send images/photos (URL or Telegram file_id)
5. **`markdown_to_telegram_html`** — Convert Markdown to Telegram HTML (internal utility)

All tools use the `TELEGRAM_CHAT_ID` from environment variables by default. You can optionally override with individual `chatId` parameter.

## Supported Markdown Syntax

| Syntax | Example | Telegram Rendering |
|--------|---------|-------------------|
| Header | `# H1`, `## H2` | Bold heading/emphasis |
| Bold | `**bold**` | **bold** |
| Italic | `*italic*` | *italic* |
| Inline Code | `` `code` `` | `code` |
| Code Block | ` ```python\ncode\n``` ` | `<pre>` block |
| List | `- item` | • item |
| Table | `\| A \| B \|` | `<pre>` monospace |
| Link | `[text](url)` | Clickable link |
| Image | `![alt](https://...)` | Validated before sending |

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Bot Token from @BotFather |
| `TELEGRAM_CHAT_ID` | Target Chat ID (user or group) |

### Optional (Logging)

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Log level (DEBUG, INFO, WARN, ERROR) | `INFO` |
| `LOG_DIR` | Log directory path | `./logs` |
| `LOG_RETENTION_DAYS` | Days to keep logs | `30` |
| `LOG_ENABLE_CONSOLE` | Enable console output | `true` |

## Testing

### Available Test Scripts

```bash
# Set environment variables first
export TELEGRAM_BOT_TOKEN="<YOUR_BOT_TOKEN>"
export TELEGRAM_CHAT_ID="<YOUR_CHAT_ID>"

# Run tests (requires tsx or built dist/)
npm run build  # Build first

# Plain text message test
npm run test:telegram:text

# Markdown conversion test
npm run test:telegram:markdown

# Table rendering test
npm run test:telegram:table-only

# Image sending test
npm run test:telegram:image-wiki

# MCP protocol test
npm run test:mcp:server
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in dev mode
npm run dev

# Lint code
npm run lint
npm run lint:fix

# Run all tests
npm test
```

## Limitations and Considerations

### Telegram Bot API Constraints

- **HTML Tags**: Only supports `b`, `i`, `u`, `code`, `pre`, `a`, `s`, `del`, `ins` tags
- **Tables**: Converted to `<pre>` monospace text (Telegram doesn't support `<table>`)
- **Images**: HTTPS only, ~10MB file size limit for photos
- **Message Length**: ~4096 character limit (messages must be split if longer)

### Supported HTML Tags

- `<b>`, `<strong>`: Bold
- `<i>`, `<em>`: Italic
- `<u>`, `<ins>`: Underline
- `<s>`, `<strike>`, `<del>`: Strikethrough
- `<code>`: Inline code
- `<pre>`: Code block
- `<a href="">`: Link

## Logging

Logs are stored in JSON format in the `logs/` directory.

**Key Events:**
- `sending_message`: Message send initiated
- `message_sent`: Successfully sent
- `markdown_parse_failed`: Markdown parsing failed, fallback used
- `image_validation_failed`: Image validation failed
- `send_failed`: Send operation failed

Log retention and level can be configured via environment variables.

## Security

⚠️ **Bot Token and Chat ID are sensitive information.**

- Never commit credentials to Git
- Do not expose in public repositories
- Use environment variables for secrets
- If leaked, regenerate token via @BotFather

## License

MIT License - See [LICENSE](LICENSE) file

## Links

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [GitHub Repository](https://github.com/ice3x2/telegram-chat-bot-mcp)
- [npm Package](https://www.npmjs.com/package/telegram-chat-bot-mcp)

---

# 한국어 문서 / Korean Documentation

# Telegram Bot MCP 서버

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/telegram-chat-bot-mcp.svg)](https://www.npmjs.com/package/telegram-chat-bot-mcp)

Telegram Bot API를 통해 메시지를 전송하는 MCP (Model Context Protocol) 서버입니다.

## 주요 기능

- 🤖 **Telegram Bot API 통합**: Telegram 채팅(개인/그룹)에 직접 메시지 전송
- 📝 **Markdown → HTML 자동 변환**: 제목, 리스트, 코드 블록, 표(고정폭), 이미지 등 지원
- 🖼️ **이미지 URL 검증**: HTTP 상태, Content-Type, 파일 크기 사전 검증
- 🔄 **자동 폴백**: HTML 파싱/전송 실패 시 평문으로 자동 전환
- 📊 **구조화된 로깅**: JSON 형식 로그, 30일 보관 정책
- 🚀 **MCP 프로토콜 지원**: Claude Desktop, Claude Code, VS Code Copilot, Cursor 등 지원
- ⌨️ **인라인 키보드**: URL, callback_data 등 다양한 버튼 지원
- 🖼️ **사진 전송**: 캡션 포함 사진 전송

## 설치

### npm을 통한 설치 (전역 설치)
```bash
npm install -g telegram-chat-bot-mcp
```

### npx 사용 (설치 불필요)
```bash
npx telegram-chat-bot-mcp
```

## Telegram 봇 설정

### 1) @BotFather로 봇 생성

1. Telegram에서 **@BotFather** 검색
2. `/newbot` 명령어 전송 후 안내 따르기
3. 봇 이름과 사용자명 설정 (사용자명은 `bot`으로 끝나야 함)
4. Bot Token 안전하게 저장 (형식: `<숫자>:<영숫자>`)

### 2) Chat ID 얻기

**방법:**

- **@userinfobot 또는 @getidsbot 사용**: 봇 시작하면 사용자 ID 표시
- **그룹의 경우**: 봇을 그룹에 추가하고 테스트 메시지 전송 후:
  ```
  https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
  ```
  `chat.id` 값 확인 (그룹 ID는 음수, 예: `-1001234567890`)

## MCP 클라이언트 설정

다양한 AI 코딩 도구와 통합 가능합니다. 사용하는 도구를 선택하세요:

### Claude Desktop

**설정 파일:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**접근 방법:** Claude > Settings > Developer > Edit Config

**예시:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### Claude Code (CLI)

**설정 파일 (우선순위 순):**
1. **프로젝트**: `.mcp.json` (팀 공유용)
2. **사용자**: `~/.config/claude-code/mcp.json` (개인 전역 설정)

**명령어로 추가:**
```bash
# 설정 파일 편집
nano ~/.config/claude-code/mcp.json

# 변경 후 재연결
claude mcp reconnect telegram
```

**예시:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### VS Code (GitHub Copilot)

**요구사항:** VS Code 1.99 이상 (2025년 3월), Agent Mode 활성화

**설정 파일:**
- **워크스페이스**: `.vscode/mcp.json` (프로젝트별)
- **사용자**: Command Palette > "MCP: Open User Configuration"

**예시 (.vscode/mcp.json):**
```json
{
  "servers": {
    "telegram": {
      "type": "stdio",
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### Cursor IDE

**설정 파일:**
- **전역**: `~/.cursor/mcp.json`
- **프로젝트**: `.cursor/mcp.json`

**접근 방법:** Settings > MCP 또는 파일 직접 편집

**예시:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["-y", "telegram-chat-bot-mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### Windsurf IDE (Codeium)

**설정 파일:**
- **macOS**: `~/.codeium/windsurf/mcp_config.json`
- **Windows**: `%USERPROFILE%\.codeium\windsurf\mcp_config.json`

**접근 방법:** Cascade 툴바 > Hammer 아이콘 > Configure

**예시:**
```json
{
  "mcpServers": {
    "telegram": {
      "command": "npx",
      "args": ["-y", "telegram-chat-bot-mcp"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

## 제공 도구 (5개)

1. **`send_telegram_text`** — 평문 메시지 전송
2. **`send_telegram_markdown`** — Markdown을 Telegram HTML로 변환해 전송 (권장)
3. **`send_telegram_with_buttons`** — 인라인 키보드 버튼 포함 메시지 전송
4. **`send_telegram_photo`** — 이미지/사진 전송 (URL 또는 Telegram file_id)
5. **`markdown_to_telegram_html`** — Markdown을 Telegram HTML로 변환 (내부 유틸리티)

모든 도구는 기본적으로 환경변수의 `TELEGRAM_CHAT_ID`를 사용합니다. 개별 `chatId` 파라미터로 선택적 재정의 가능합니다.

## 지원하는 Markdown 문법

| 문법 | 예시 | Telegram 렌더링 |
|------|------|----------------|
| 헤더 | `# H1`, `## H2` | 굵은 제목/강조 |
| 굵게 | `**bold**` | **bold** |
| 기울임 | `*italic*` | *italic* |
| 인라인 코드 | `` `code` `` | `code` |
| 코드 블록 | ` ```python\ncode\n``` ` | `<pre>` 블록 |
| 리스트 | `- item` | • item |
| 표 | `\| A \| B \|` | `<pre>` 고정폭 |
| 링크 | `[text](url)` | 클릭 가능한 링크 |
| 이미지 | `![alt](https://...)` | 전송 전 검증 후 표시 |

## 환경 변수

### 필수

| 변수 | 설명 |
|------|------|
| `TELEGRAM_BOT_TOKEN` | @BotFather에서 받은 Bot Token |
| `TELEGRAM_CHAT_ID` | 대상 Chat ID (사용자 또는 그룹) |

### 선택 (로깅 관련)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `LOG_LEVEL` | 로그 레벨 (DEBUG, INFO, WARN, ERROR) | `INFO` |
| `LOG_DIR` | 로그 디렉토리 경로 | `./logs` |
| `LOG_RETENTION_DAYS` | 로그 보관 일수 | `30` |
| `LOG_ENABLE_CONSOLE` | 콘솔 출력 활성화 | `true` |

## 테스트

### 제공 테스트 스크립트

```bash
# 먼저 환경변수 설정
export TELEGRAM_BOT_TOKEN="<YOUR_BOT_TOKEN>"
export TELEGRAM_CHAT_ID="<YOUR_CHAT_ID>"

# 프로젝트 빌드
npm run build

# 테스트 실행
npm run test:telegram:text         # 평문 메시지 테스트
npm run test:telegram:markdown     # Markdown 테스트
npm run test:telegram:table-only   # 표 렌더링 테스트
npm run test:telegram:image-wiki   # 이미지 전송 테스트
npm run test:mcp:server            # MCP 프로토콜 테스트
```

## 개발

```bash
# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# 개발 모드 실행
npm run dev

# 코드 린트
npm run lint
npm run lint:fix

# 모든 테스트 실행
npm test
```

## 제한사항 및 고려사항

### Telegram Bot API 제약

- **HTML 태그**: `b`, `i`, `u`, `code`, `pre`, `a`, `s`, `del`, `ins` 태그만 지원
- **표**: `<pre>` 고정폭 텍스트로 변환 (Telegram은 `<table>`을 지원하지 않음)
- **이미지**: HTTPS만 허용, 사진 기준 약 10MB 파일 크기 제한
- **메시지 길이**: 약 4096자 제한 (초과 시 메시지 분할 필요)

### 지원 HTML 태그

- `<b>`, `<strong>`: 굵은 글씨
- `<i>`, `<em>`: 기울임
- `<u>`, `<ins>`: 밑줄
- `<s>`, `<strike>`, `<del>`: 취소선
- `<code>`: 인라인 코드
- `<pre>`: 코드 블록
- `<a href="">`: 링크

## 로깅

로그는 `logs/` 디렉토리에 JSON 형식으로 저장됩니다.

**주요 이벤트:**
- `sending_message`: 메시지 전송 시작
- `message_sent`: 전송 성공
- `markdown_parse_failed`: Markdown 파싱 실패, 폴백 사용
- `image_validation_failed`: 이미지 검증 실패
- `send_failed`: 전송 작업 실패

로그 보관 기간과 레벨은 환경변수로 설정 가능합니다.

## 보안

⚠️ **Bot Token과 Chat ID는 민감 정보입니다.**

- Git에 절대 커밋하지 마세요
- 공개 저장소에 노출하지 마세요
- 비밀 정보는 환경변수 사용
- 유출 의심 시 @BotFather를 통해 토큰 재발급

## 문제 해결

### 일반적인 문제

**MCP 서버가 연결되지 않음:**
- `telegram-chat-bot-mcp`가 전역 설치되었거나 npx로 접근 가능한지 확인
- 환경변수가 올바르게 설정되었는지 확인
- 설정 변경 후 AI 도구 재시작

**타임아웃 에러 (WSL 사용자):**
- 이 패키지는 WSL IPv6 타임아웃 문제를 방지하기 위해 IPv4 강제를 포함합니다
- 타임아웃이 지속되면 api.telegram.org에 대한 네트워크 연결 확인

**도구가 표시되지 않음:**
- 사용하는 도구에 맞는 올바른 위치에 설정 파일이 있는지 확인
- JSON 문법이 유효한지 확인
- MCP 서버 재시작 또는 재연결

## 라이선스

MIT License - [LICENSE](LICENSE) 파일 참조

## 링크

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [GitHub Repository](https://github.com/ice3x2/telegram-chat-bot-mcp)
- [npm Package](https://www.npmjs.com/package/telegram-chat-bot-mcp)
- [Issues](https://github.com/ice3x2/telegram-chat-bot-mcp/issues)
