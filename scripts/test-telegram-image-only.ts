import { sendTelegramPhoto } from '../src/tools/sendTelegramPhoto.js';

async function test() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  const imageUrl = 'https://i.pinimg.com/originals/d7/7b/0c/d77b0c8130f4d9d515cbfc248c39e904.jpg';
  console.log('🧪 Testing Telegram photo send (user-provided URL)...');
  try {
    const photoResult = await sendTelegramPhoto({ photo: imageUrl, caption: 'Image test (user URL)' }, botToken, chatId);
    console.log('✅ Photo send result:', JSON.stringify(photoResult));
  } catch (err) {
    console.error('❌ Photo send failed:', err);
    process.exit(1);
  }
}

test();
