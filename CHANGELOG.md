# Changelog

All notable changes to this project are tracked in the repository's Git history.

This file has been intentionally simplified to remove legacy, duplicated, or out-of-date manual entries.

If you need a historical, detailed changelog, inspect the Git history or create a release anchored to a commit.

## Migration Guide

### Google Chat → Telegram

```bash
# 환경 변수 변경
unset GOOGLE_CHAT_WEBHOOK_URL
export TELEGRAM_BOT_TOKEN="<YOUR_BOT_TOKEN>"
export TELEGRAM_CHAT_ID="<YOUR_CHAT_ID>"

# 도구 이름 변경 (claude 스크립트에서)
# send_google_chat_text → send_telegram_text
# send_google_chat_markdown → send_telegram_markdown
```

### npm 패키지 설치

```bash
npm install -g telegram-bot-mcp
```

---

[1.0.0]: https://github.com/yourusername/telegram-bot-mcp/releases/tag/v1.0.0
