import { sendTelegramText } from '../src/tools/sendTelegramText.js';

async function test() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  console.log('🧪 Testing Telegram text message...\n');

  try {
    const result = await sendTelegramText(
      { text: '✅ Hello from Telegram Bot MCP! 🚀' },
      botToken,
      chatId
    );

    console.log('✅ Success!');
    console.log('Message ID:', result.message_id);
    console.log('Chat ID:', result.chat.id);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

test();
