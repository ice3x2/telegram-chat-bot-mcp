# Telegram Bot MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/telegram-bot-mcp.svg)](https://www.npmjs.com/package/telegram-bot-mcp)

An MCP (Model Context Protocol) server that enables Claude Code, GitHub Copilot, and other MCP clients to send messages to Telegram. Automatically converts Markdown to Telegram HTML format with image validation, structured logging, and fallback handling.

## Quick Start

```bash
# 1. Install globally
npm install -g telegram-bot-mcp

# 2. Set environment variables
export TELEGRAM_BOT_TOKEN="your_token_from_botfather"
export TELEGRAM_CHAT_ID="your_chat_id"

# 3. Configure your MCP client (Claude Code / GitHub Copilot)
# See MCP Client Configuration section below

# 4. Start using! Ask Claude or Copilot to send a message to Telegram
```

## Features

- 🤖 **Telegram Bot API Integration**: Send messages directly to Telegram chats via npm package
- 📝 **Markdown → HTML Auto-conversion**: Supports headers, lists, code blocks, tables, images
- 🖼️ **Image URL Validation**: Validates images before sending (HTTP status, Content-Type, size)
- 🔄 **Auto Fallback**: Automatically falls back to plaintext when HTML parsing fails
- 📊 **Structured Logging**: JSON format with 30-day retention
- 🚀 **MCP Protocol Support**: Works with Claude Code, GitHub Copilot, and other MCP clients
- ⌨️ **Inline Keyboards**: Send interactive buttons with callback data or URLs
- 🖼️ **Photo Sending**: Send images with captions and formatting

## Installation

### Using npm (Recommended)

Install the `telegram-bot-mcp` package globally or locally:

```bash
# Global installation (recommended for MCP usage)
npm install -g telegram-bot-mcp

# Or local installation
npm install telegram-bot-mcp
```

### From Source (Development)

If you want to modify the source code:

```bash
git clone https://github.com/ice3x2/telegram-chat-bot-mcp.git
cd telegram-chat-bot-mcp
npm install
npm run build
npm run dev  # or 'node dist/index.js' to run
```

## Telegram Bot Setup

Before configuring the MCP server, you need to create a Telegram Bot and get your credentials:

### 1. Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send the `/newbot` command
3. Follow the prompts:
   - Choose a name for your bot (e.g., "My Assistant Bot")
   - Choose a username (must end with 'bot', e.g., "my_assistant_bot")
4. **Copy the Bot Token** (format: `<YOUR_BOT_TOKEN>` - digits:alphanumeric string)

### 2. Get Your Chat ID

**Method 1: Using @userinfobot**
1. Search for **@userinfobot** in Telegram
2. Start the bot - it will display your Chat ID

**Method 2: Using @getidsbot**
1. Search for **@getidsbot** in Telegram
2. Start the bot - it will show your user ID

**Method 3: For Group Chats**
1. Add your bot to the group
2. Send a test message in the group
3. Visit: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. Look for `"chat":{"id":-1001234567890,...}` in the response

**Note**: Group chat IDs are negative numbers (e.g., `-1001234567890`)

## MCP Client Configuration

### Prerequisites

Before configuring your MCP client, ensure:
1. ✅ `telegram-bot-mcp` is installed globally: `npm install -g telegram-bot-mcp`
2. ✅ You have `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` environment variables ready

### Claude Code

#### Config File Location

- **Windows**: `%USERPROFILE%\.claude.json`
- **macOS/Linux**: `~/.claude.json`

#### Setup Instructions

1. Open your Claude configuration file (create if it doesn't exist)
2. Add the following configuration:

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

3. Save and restart Claude Code

### GitHub Copilot (VS Code)

#### Setup Instructions

1. Open VS Code settings (`.vscode/settings.json` in your workspace or global settings)
2. Add the following configuration:

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

3. Reload the VS Code window (Ctrl+Shift+P → Developer: Reload Window)

### Environment Variables

Set your Telegram credentials before running:

#### Windows (PowerShell)
```powershell
$env:TELEGRAM_BOT_TOKEN = "your_bot_token_here"
$env:TELEGRAM_CHAT_ID = "your_chat_id_here"
```

#### Windows (Command Prompt)
```cmd
set TELEGRAM_BOT_TOKEN=your_bot_token_here
set TELEGRAM_CHAT_ID=your_chat_id_here
```

#### macOS/Linux (Bash/Zsh)
```bash
export TELEGRAM_BOT_TOKEN="your_bot_token_here"
export TELEGRAM_CHAT_ID="your_chat_id_here"
```

Or create a `.env` file in your working directory:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

## Usage

### Quick Start

Once configured in your MCP client (Claude Code or GitHub Copilot), you can use the tools directly:

1. **In Claude Code**: Ask Claude to send a message to Telegram
2. **In GitHub Copilot**: Use the Telegram Bot tools in your chat

### Available MCP Tools (5 Tools)

#### 1. `send_telegram_text`
Send simple plaintext messages to Telegram

**Usage in Claude/Copilot:**
```
"Send 'Hello from Claude!' to my Telegram chat"
```

**Tool Parameters:**
- `text` (required): Message text
- `chatId` (optional): Target chat ID (uses env var if not provided)

#### 2. `send_telegram_markdown` ⭐ **Recommended**
Convert Markdown to Telegram HTML format and send automatically

**Usage in Claude/Copilot:**
```
"Send this markdown to Telegram:
# Project Update
- Task 1: ✅ Completed
- Task 2: 🚧 In Progress
**Note**: Deadline is tomorrow"
```

**Tool Parameters:**
- `markdown` (required): Markdown formatted text
- `fallbackToText` (optional): Automatically fallback to plaintext if HTML parsing fails
- `chatId` (optional): Target chat ID

#### 3. `send_telegram_with_buttons`
Send messages with interactive inline keyboard buttons

**Tool Parameters:**
- `text` (required): Message text
- `buttons` (required): Array of button rows
  - Each button: `{"text": "Button Text", "url": "https://..." }` or `{"text": "Button", "callback_data": "action"}`
- `chatId` (optional): Target chat ID

#### 4. `send_telegram_photo`
Send images/photos with captions to Telegram

**Tool Parameters:**
- `photo` (required): HTTPS URL to image
- `caption` (optional): Photo caption (supports Markdown)
- `chatId` (optional): Target chat ID

#### 5. `markdown_to_telegram_html` (Internal)
Converts Markdown to Telegram HTML format (automatically called by `send_telegram_markdown`)

### Supported Markdown Syntax

| Syntax | Markdown Example | Telegram Rendering |
|--------|------------------|-------------------|
| **Headers** | `# H1`, `## H2`, `### H3` | **📌 H1**, **H2**, **_H3_** |
| **Bold** | `**bold**` | **bold** |
| **Italic** | `*italic*` | *italic* |
| **Inline Code** | `` `code` `` | `code` |
| **Code Block** | ` ```python\ncode\n``` ` | <pre>code</pre> |
| **Ordered List** | `1. First\n2. Second` | 1. First<br>2. Second |
| **Unordered List** | `- Item` | • Item |
| **Table** | `\| A \| B \|\n\|--\|--\|` | <pre>table</pre> (monospace) |
| **Image** | `![alt](https://...)` | 🖼️ [alt](url) |
| **Link** | `[text](https://...)` | Clickable link |
| **Blockquote** | `> quote` | *❝ quote* |

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Bot Token from @BotFather | `<digits>:<alphanumeric_string>` |
| `TELEGRAM_CHAT_ID` | Target chat ID | `123456789` or `-1001234567890` |

### Optional (Logging)

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Log level | `INFO` |
| `LOG_DIR` | Log directory | `./logs` |
| `LOG_RETENTION_DAYS` | Days to keep logs | `30` |
| `LOG_ENABLE_CONSOLE` | Console output | `true` |

## Testing

### Using the CLI

Once installed via npm, you can test the MCP server directly:

```bash
# Set environment variables first
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_CHAT_ID="your_chat_id"

# Run the MCP server (for testing)
telegram-bot-mcp
```

### Testing with MCP Clients

After configuring in your MCP client:

1. **Claude Code**: Open Claude and ask it to send a test message
2. **GitHub Copilot**: Use the Telegram tools in VS Code chat

**Test Examples:**
```
"Send a test message: Hello, I'm testing the Telegram MCP!"
"Send a markdown message with headers and lists to Telegram"
"Send an image to my Telegram chat"
```

### Development Testing (From Source)

If you cloned the repository:

```bash
# Set environment variables
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_CHAT_ID="your_chat_id"

# Run test scripts
npm run test:telegram:text        # Test plaintext message
npm run test:telegram:markdown    # Test markdown conversion
```

## Development

If you want to modify the source code:

```bash
# Clone and install
git clone https://github.com/ice3x2/telegram-chat-bot-mcp.git
cd telegram-chat-bot-mcp
npm install

# Development commands
npm run build        # Build TypeScript to dist/
npm run dev          # Development mode with tsx
npm run lint         # Lint check
npm run lint:fix     # Auto-fix linting issues

# Run the server locally
npm run start        # Run compiled version
# or
npm run dev          # Run with tsx (TypeScript directly)
```

## Limitations

### Telegram Bot API Constraints

- **HTML Tags**: Limited subset only (no tables, only basic formatting)
- **Tables**: Rendered as `<pre>` monospace text
- **Image Protocol**: HTTPS only
- **Image Size**: Max 10MB for photos
- **Message Length**: 4096 characters max

### Supported HTML Tags

Telegram supports only these tags:
- `<b>`, `<strong>`: Bold
- `<i>`, `<em>`: Italic
- `<u>`, `<ins>`: Underline
- `<code>`: Inline code
- `<pre>`: Code block
- `<a href="...">`: Link

## FAQ

### Q: How do I install `telegram-bot-mcp`?
**A**: Use npm:
```bash
npm install -g telegram-bot-mcp
```
Once installed globally, you can reference it in your MCP client configuration.

### Q: "MCP server not found" or "command not found" error
**A**: Check:
1. ✅ Package is installed: `npm list -g telegram-bot-mcp`
2. ✅ Global npm bin is in PATH: Check your shell profile
3. ✅ Try running with full path: Find it with `npm config get prefix`

### Q: Messages not sending
**A**: Check:
1. ✅ `TELEGRAM_BOT_TOKEN` is set and valid (from @BotFather)
2. ✅ `TELEGRAM_CHAT_ID` is set and correct (use @userinfobot)
3. ✅ Bot is added to group (for group chats)
4. ✅ Environment variables are properly passed to MCP client

### Q: MCP configuration isn't working
**A**: Verify:
1. ✅ Config file location:
   - Claude Code: `~/.claude.json` or `%USERPROFILE%\.claude.json`
   - GitHub Copilot: `.vscode/settings.json`
2. ✅ JSON syntax is valid (use a JSON validator)
3. ✅ Restart your MCP client after configuration changes

### Q: Images not displaying
**A**: Images must be:
- ✅ HTTPS URLs (HTTP not supported by Telegram)
- ✅ Under 10MB in size
- ✅ Publicly accessible (no authentication)
- ✅ Valid Content-Type: `image/*`

### Q: HTML/Markdown formatting issues
**A**: Tips:
- ✅ Use `send_telegram_markdown` tool (automatic conversion)
- ✅ Use `fallbackToText: true` for automatic plaintext fallback
- ✅ Remember: Telegram only supports basic HTML tags
- ✅ Tables are rendered as `<pre>` monospace text

### Q: Can I use this without an MCP client?
**A**: Yes, if you install from source:
```bash
git clone https://github.com/ice3x2/telegram-chat-bot-mcp.git
cd telegram-chat-bot-mcp
npm install
npm run dev
```
But the package is primarily designed for MCP integration.

## Logging

### Log File Structure

```
logs/
├── app-2025-11-04.log          # Daily log (all levels)
├── errors-2025-11-04.log       # Errors only
└── ...                         # Auto-deleted after 30 days
```

### Log Format (JSON)

```json
{
  "timestamp": "2025-11-04T06:17:51.378Z",
  "level": "INFO",
  "module": "sendTelegramText",
  "event": "message_sent",
  "messageId": 106,
  "chatId": "123456789"
}
```

## Security

⚠️ **Bot Token and Chat ID are sensitive:**
- Never commit to Git
- Don't expose in public repositories
- Use environment variables or .env files
- Regenerate token if leaked (@BotFather → /revoke)

## License

MIT License - [LICENSE](LICENSE)

## Links

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Model Context Protocol](https://github.com/modelcontextprotocol)
- [Claude Code](https://claude.ai/desktop)

---

## Korean / 한국어

Telegram Bot MCP 서버는 Telegram Bot API를 통해 메시지를 전송하는 MCP (Model Context Protocol) 서버로, Markdown을 Telegram용 HTML로 자동 변환하고 이미지 검증, 구조화된 로깅, 폴백(fallback) 처리를 제공합니다.

## 주요 기능

- 🤖 Telegram Bot API 통합: Telegram 채팅(개인/그룹)에 직접 메시지 전송
- 📝 Markdown → HTML 자동 변환: 제목, 리스트, 코드 블록, 표(고정폭), 이미지 등 지원
- 🖼️ 이미지 URL 검증: HTTP 상태, Content-Type, 파일 크기 등 사전 검증
- 🔄 자동 폴백: HTML 파싱/전송 실패 시 평문으로 자동 전송
- 📊 구조화된 로깅: JSON 형식 로그, 기본 30일 보관 정책
- 🚀 MCP 프로토콜 지원: Claude Code, GitHub Copilot 등 MCP 클라이언트와 통합 가능
- ⌨️ 인라인 키보드(버튼): URL, callback_data 등 다양한 버튼 지원
- 🖼️ 사진 전송: 캡션 포함 사진(여러 해상도) 전송 지원

## 설치

### npm (권장)

```bash
npm install -g telegram-bot-mcp
```

### 소스에서 빌드 (개발용)

```bash
git clone https://github.com/yourusername/telegram-bot-mcp.git
cd telegram-bot-mcp
npm install
npm run build
```

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
      "command": "npx",
      "args": ["-y", "telegram-bot-mcp"],
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
      "command": "npx",
      "args": ["-y", "telegram-bot-mcp"],
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

