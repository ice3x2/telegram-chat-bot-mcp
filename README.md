# Telegram Bot MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/telegram-chat-bot-mcp.svg)](https://www.npmjs.com/package/telegram-chat-bot-mcp)

An MCP (Model Context Protocol) server for sending messages via Telegram Bot API.

## Key Features

- 🤖 **Telegram Bot API Integration**: Send messages directly to Telegram chats (personal/group)
- 📝 **Simple Markdown → HTML Auto-conversion**: Supports headers, lists, code blocks, tables (monospace), images, etc.
- 🖼️ **Image URL Validation**: Pre-validates HTTP status, Content-Type, file size, etc.
- 🔄 **Auto Fallback**: Automatically falls back to plaintext when HTML parsing/sending fails
- 📊 **Structured Logging**: JSON format logs with default 30-day retention policy
- 🚀 **MCP Protocol Support**: Integrates with Claude Code, GitHub Copilot, and other MCP clients
- ⌨️ **Inline Keyboards (Buttons)**: Supports various button types including URL, callback_data, etc.
- 🖼️ **Photo Sending**: Send photos with captions (multiple resolutions) support

## Telegram Bot Setup

### 1) Create Bot (@BotFather)

1. Search for **@BotFather** in Telegram.
2. Send the `/newbot` command and follow the instructions.
3. Set the bot name and username (username must end with `bot`).
4. Safely copy and store the issued Bot Token (format: `<digits>:<alphanumeric_string>`).

### 2) Get Chat ID

Methods:

- **Use @userinfobot or @getidsbot**: When you start the bot, it will display your user ID (or group ID).
- **For groups**: Add the bot to the group, send a test message, then call `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` to find the chat.id value (group IDs are negative, e.g., `-1001234567890`).

## MCP Client Configuration

This project can be integrated with Claude Code, GitHub Copilot, etc. through MCP (Model Context Protocol). Below are configuration examples.

### Claude Code Example (.claude.json)

```json
{
  "mcpServers": {
    "telegram-bot": {
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### GitHub Copilot (VS Code) Example

Add the following to `.vscode/settings.json` or user settings:

```json
{
  "github.copilot.chat.mcp.servers": {
    "telegram-bot": {
      "command": "telegram-chat-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

## Usage

This repository provides the following main MCP tools. When you call tools from Claude Code, etc., messages are automatically sent to Telegram.

### Provided Tools (5)

1. `send_telegram_text` — Send plain text messages
2. `send_telegram_markdown` — Convert Markdown to Telegram HTML and send (recommended)
3. `send_telegram_with_buttons` — Send messages with inline keyboard (buttons)
4. `send_telegram_photo` — Send images/photos (URL or Telegram file_id)
5. `markdown_to_telegram_html` — Internal: Markdown → Telegram HTML conversion

Parameter examples for each tool are the same as in the Korean section, and by default use the `TELEGRAM_CHAT_ID` set in environment variables (you can optionally pass individual `chatId`).

## Supported Markdown Syntax (Summary)

| Syntax | Example | Telegram Rendering |
|--------|---------|-------------------|
| Header | `# H1`, `## H2` | Bold heading/emphasis |
| Bold | `**bold**` | **bold** |
| Italic | `*italic*` | *italic* |
| Inline Code | `` `code` `` | `code` |
| Code Block | ``` ```python\ncode\n``` ``` | `<pre>` block |
| List | `- item` | • item |
| Table | `| A | B |` | `<pre>` monospace text |
| Image | `![alt](https://...)` | Validated before sending |

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Bot Token received from @BotFather |
| `TELEGRAM_CHAT_ID` | Default target Chat ID (user or group) |

### Optional (Logging Related)

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Log level | `INFO` |
| `LOG_DIR` | Log directory | `./logs` |
| `LOG_RETENTION_DAYS` | Log retention days | `30` |
| `LOG_ENABLE_CONSOLE` | Console output enabled | `true` |

## Testing

### Provided Test Scripts

Several test scripts are included in the project root `scripts/`. For example:

```bash
# Plain text message test
npx tsx scripts/test-telegram-text.ts

# Markdown conversion test
npx tsx scripts/test-telegram-markdown.ts

# Table rendering test
npx tsx scripts/test-telegram-table-only.ts

# Public image sending test (Wikimedia, etc.)
npx tsx scripts/test-telegram-image-wiki.ts
```

You must set environment variables (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) in the current session when running tests.

## Development

```bash
npm install
npm run build
npm run dev
npm run lint
npm run lint:fix
```

## Limitations and Considerations

### Telegram Bot API Constraints

- HTML Tags: Telegram only supports allowed tags (`b,i,u,code,pre,a`, etc.). `<table>` is not supported.
- Tables: Tables are converted to `<pre>` monospace text before sending.
- Images: HTTPS only, file size limit (approx. 10MB for photos)
- Message Length: Messages exceeding Telegram limit (approx. 4096 characters) must be split.

### Supported HTML Tags

- `<b>`, `<strong>`: Bold text
- `<i>`, `<em>`: Italic
- `<u>`, `<ins>`: Underline
- `<s>`, `<strike>`, `<del>`: Strikethrough
- `<code>`: Inline code
- `<pre>`: Code/monospace block
- `<a href="">`: Link

## Logging

Logs are stored in JSON format in the `logs/` folder, with key events as follows:

- `sending_message`: Sending started
- `message_sent`: Sending succeeded
- `markdown_parse_failed`: Markdown → HTML conversion failed and fallback used
- `image_validation_failed`: Image validation failed
- `send_failed`: Sending failed

Log retention period and level can be adjusted via environment variables.

## Security

⚠️ **Bot Token and Chat ID are sensitive information.**

- Never commit to Git.
- Do not expose in public repositories.
- If suspected leaked, regenerate token (@BotFather) is recommended.

## License

MIT License - [LICENSE](LICENSE)

## Useful Links

- Telegram Bot API: https://core.telegram.org/bots/api
- Model Context Protocol: https://github.com/modelcontextprotocol

---

## Korean / 한국어
Telegram Bot MCP 서버는 Telegram Bot API를 통해 메시지를 전송하는 MCP (Model Context Protocol) 서버.

## 주요 기능

- 🤖 Telegram Bot API 통합: Telegram 채팅(개인/그룹)에 직접 메시지 전송
- 📝 간단한 Markdown → HTML 자동 변환: 제목, 리스트, 코드 블록, 표(고정폭), 이미지 등 지원
- 🖼️ 이미지 URL 검증: HTTP 상태, Content-Type, 파일 크기 등 사전 검증
- 🔄 자동 폴백: HTML 파싱/전송 실패 시 평문으로 자동 전송
- 📊 구조화된 로깅: JSON 형식 로그, 기본 30일 보관 정책
- 🚀 MCP 프로토콜 지원: Claude Code, GitHub Copilot 등 MCP 클라이언트와 통합 가능
- ⌨️ 인라인 키보드(버튼): URL, callback_data 등 다양한 버튼 지원
- 🖼️ 사진 전송: 캡션 포함 사진(여러 해상도) 전송 지원

## 설치


## Telegram 봇 설정

### 1) Bot 생성 (@BotFather)

1. Telegram에서 **@BotFather**를 검색합니다.
2. `/newbot` 명령을 전송하고 지시에 따릅니다.
3. 봇 이름과 사용자명을 설정합니다(사용자명은 반드시 `bot`으로 끝나야 함).
4. 발급된 Bot Token을 안전하게 복사해 보관합니다(형식: `<digits>:<alphanumeric_string>`).

### 2) Chat ID 얻기

방법:

- **@userinfobot** 또는 **@getidsbot**을 사용: 봇을 시작하면 사용자 ID(또는 그룹 ID)가 표시됩니다.
- **그룹의 경우**: 봇을 그룹에 추가하고 테스트 메시지를 보낸 뒤 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates` 호출로 chat.id 값을 확인합니다(그룹 ID는 음수, 예: `-1001234567890`).

## MCP 클라이언트 설정

이 프로젝트는 MCP(모델 컨텍스트 프로토콜)를 통해 Claude Code, GitHub Copilot 등과 통합할 수 있습니다. 아래는 설정 예시입니다.

### Claude Code 예시 (.claude.json)

```json
{
  "mcpServers": {
    "telegram-bot": {
      "command": "telegram-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

### GitHub Copilot (VS Code) 예시

`.vscode/settings.json` 또는 사용자 설정에 다음을 추가합니다:

```json
{
  "github.copilot.chat.mcp.servers": {
    "telegram-bot": {
      "command": "telegram-bot-mcp",
      "env": {
        "TELEGRAM_BOT_TOKEN": "<YOUR_BOT_TOKEN>",
        "TELEGRAM_CHAT_ID": "<YOUR_CHAT_ID>"
      }
    }
  }
}
```

## 사용법

이 저장소는 다음 주요 MCP 도구들을 제공합니다. Claude Code 등에서 도구를 호출하면 자동으로 Telegram으로 메시지가 전송됩니다.

### 제공 도구 (5개)

1. `send_telegram_text` — 평문(plain text) 메시지 전송
2. `send_telegram_markdown` — Markdown을 Telegram HTML로 변환해 전송 (권장)
3. `send_telegram_with_buttons` — 인라인 키보드(버튼) 포함 메시지 전송
4. `send_telegram_photo` — 이미지/사진 전송 (URL 또는 Telegram file_id)
5. `markdown_to_telegram_html` — 내부용: Markdown → Telegram HTML 변환

각 도구의 파라미터 예시는 영어 본문과 동일하며, 기본적으로 환경변수로 설정된 `TELEGRAM_CHAT_ID`를 사용합니다(옵션으로 개별 `chatId` 전달 가능).

## 지원하는 Markdown 문법(요약)

| 문법 | 예시 | Telegram 렌더링 |
|------|------|----------------|
| 헤더 | `# H1`, `## H2` | 굵은 제목/강조 |
| 굵게 | `**bold**` | **bold** |
| 기울임 | `*italic*` | *italic* |
| 인라인 코드 | `` `code` `` | `code` |
| 코드 블록 | ``` ```python\ncode\n``` | `<pre>` 블록 |
| 리스트 | `- item` | • item |
| 표 | `| A | B |` | `<pre>` 고정폭 텍스트 |
| 이미지 | `![alt](https://...)` | 전송 전 검증 후 표시 |

## 환경 변수

### 필수

| 변수 | 설명 |
|------|------|
| `TELEGRAM_BOT_TOKEN` | @BotFather에서 받은 Bot Token |
| `TELEGRAM_CHAT_ID`  | 기본 대상 Chat ID (사용자 또는 그룹) |

### 선택 (로깅 관련)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `LOG_LEVEL` | 로그 레벨 | `INFO` |
| `LOG_DIR` | 로그 디렉토리 | `./logs` |
| `LOG_RETENTION_DAYS` | 로그 보관일수 | `30` |
| `LOG_ENABLE_CONSOLE` | 콘솔 출력 사용 여부 | `true` |

## 테스트

### 제공 테스트 스크립트

프로젝트 루트의 `scripts/`에 여러 테스트 스크립트가 포함되어 있습니다. 예:

```bash
# 평문 메시지 테스트
npx tsx scripts/test-telegram-text.ts

# Markdown 변환 테스트
npx tsx scripts/test-telegram-markdown.ts

# 표 렌더링 테스트
npx tsx scripts/test-telegram-table-only.ts

# 공개 이미지 전송 테스트 (Wikimedia 등)
npx tsx scripts/test-telegram-image-wiki.ts
```

테스트 실행시 환경변수(`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`)를 현재 세션에 설정해야 합니다.

## 개발

```bash
npm install
npm run build
npm run dev
npm run lint
npm run lint:fix
```

## 제한사항 및 고려사항

### Telegram Bot API 제약

- HTML 태그: Telegram은 허용된 태그만 지원(`b,i,u,code,pre,a` 등). `<table>` 등은 지원하지 않습니다.
- 표: 표는 `<pre>` 고정폭 텍스트로 변환되어 전송됩니다.
- 이미지: HTTPS만 허용, 파일 크기 제한(사진 기준 약 10MB 등)
- 메시지 길이: Telegram 제한(약 4096자)을 초과하면 메시지를 분할해야 합니다.

### 지원 HTML 태그

- `<b>`, `<strong>`: 굵은 글씨
- `<i>`, `<em>`: 기울임
- `<u>`, `<ins>`: 밑줄
- `<s>`, `<strike>`, `<del>`: 취소선
- `<code>`: 인라인 코드
- `<pre>`: 코드/고정폭 블록
- `<a href=">`: 링크

## 로깅

로그는 `logs/` 폴더에 JSON 포맷으로 저장되며, 주요 이벤트는 다음과 같습니다:

- `sending_message`: 전송 시작
- `message_sent`: 전송 성공
- `markdown_parse_failed`: Markdown → HTML 변환 실패 및 폴백 사용
- `image_validation_failed`: 이미지 검증 실패
- `send_failed`: 전송 실패

로그 보관 기간과 레벨은 환경변수로 조정 가능합니다.

## 보안

⚠️ **Bot Token과 Chat ID는 민감 정보입니다.**

- 절대 Git에 커밋하지 마세요.
- 공개 저장소에 노출하지 마세요.
- 유출 의심 시 토큰 재발급(@BotFather)을 권장합니다.

## 라이선스

MIT License - [LICENSE](LICENSE)

## 유용한 링크

- Telegram Bot API: https://core.telegram.org/bots/api
- Model Context Protocol: https://github.com/modelcontextprotocol

