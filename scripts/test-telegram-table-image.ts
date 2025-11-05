import { sendTelegramMarkdown } from '../src/tools/sendTelegramMarkdown.js';
import { sendTelegramPhoto } from '../src/tools/sendTelegramPhoto.js';

async function test() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  const tableMarkdown = `# Table Test

| Name | Age | City |
|------|-----:|------|
| Alice | 30 | Seoul |
| Bob | 25 | Busan |
`;

  console.log('🧪 Testing Telegram Markdown table conversion...');
  try {
    const result = await sendTelegramMarkdown({ markdown: tableMarkdown, fallbackToText: true }, botToken, chatId);
    console.log('✅ Table send result:', JSON.stringify(result));
  } catch (err) {
    console.error('❌ Table send failed:', err);
  }

  // Image test: use a public image URL
  const imageUrl = 'https://via.placeholder.com/600x200.png?text=Telegram+Image+Test';
  console.log('🧪 Testing Telegram photo send...');
  try {
    const photoResult = await sendTelegramPhoto({ photo: imageUrl, caption: 'Image test' }, botToken, chatId);
    console.log('✅ Photo send result:', JSON.stringify(photoResult));
  } catch (err) {
    console.error('❌ Photo send failed:', err);
  }
}

test();
