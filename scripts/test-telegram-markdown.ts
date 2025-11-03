import { sendTelegramMarkdown } from '../src/tools/sendTelegramMarkdown.js';

async function test() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  const testMarkdown = `# 🚀 Telegram Markdown Test

## Features
- **Markdown** support
- *Italic* text
- \`Code\` blocks

\`\`\`bash
npm run build
\`\`\`

[GitHub Repo](https://github.com/example/repo)

> This is a blockquote

### Nested Lists
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
`;

  console.log('🧪 Testing Telegram Markdown conversion...\n');

  try {
    const result = await sendTelegramMarkdown(
      { markdown: testMarkdown, fallbackToText: true },
      botToken,
      chatId
    );

    console.log('✅ Success!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

test();
