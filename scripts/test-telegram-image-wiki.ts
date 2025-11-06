import { sendTelegramPhoto } from '../src/tools/sendTelegramPhoto.js';
import { getTestCredentials, runTest } from './test-helpers.js';

async function test() {
  const { botToken, chatId } = getTestCredentials();
  const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png';

  await runTest('Telegram photo send (Wikimedia URL)', async () => {
    const result = await sendTelegramPhoto(
      { photo: imageUrl, caption: 'Image test (Wikimedia)' },
      botToken,
      chatId
    );

    console.log('Photo send result:', JSON.stringify(result));
    return result;
  });
}

test();
