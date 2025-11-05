import { sendTelegramMarkdown } from '../src/tools/sendTelegramMarkdown.js';

async function test() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  const tableMarkdown = `# Table Test\n\n| Name | Age | City |\n|------|-----:|------|\n| Alice | 30 | Seoul |\n| Bob | 25 | Busan |\n`;

  console.log('🧪 Testing Telegram Markdown table conversion (table-only)...');
  try {
    const result = await sendTelegramMarkdown({ markdown: tableMarkdown, fallbackToText: true }, botToken, chatId);
    console.log('✅ Table send result:', JSON.stringify(result));
  } catch (err) {
    console.error('❌ Table send failed:', err);
    process.exit(1);
  }
}

test();
