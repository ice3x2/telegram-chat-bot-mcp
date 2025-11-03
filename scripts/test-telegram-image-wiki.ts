import { sendTelegramPhoto } from '../src/tools/sendTelegramPhoto.js';

async function test() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  // Wikimedia Commons demo PNG (publicly accessible)
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';

  console.log('🧪 Testing Telegram photo send (Wikimedia URL)...');
  try {
    const photoResult = await sendTelegramPhoto({ photo: imageUrl, caption: 'Image test (Wikimedia)' }, botToken, chatId);
    console.log('✅ Photo send result:', JSON.stringify(photoResult));
  } catch (err) {
    console.error('❌ Photo send failed:', err);
    process.exit(1);
  }
}

test();
