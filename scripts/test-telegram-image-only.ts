import { sendTelegramPhoto } from '../src/tools/sendTelegramPhoto.js';
import { getTestCredentials, runTest } from './test-helpers.js';

async function test() {
  const { botToken, chatId } = getTestCredentials();
  const imageUrl = 'https://i.pinimg.com/originals/d7/7b/0c/d77b0c8130f4d9d515cbfc248c39e904.jpg';

  await runTest('Telegram photo send (user-provided URL)', async () => {
    const result = await sendTelegramPhoto(
      { photo: imageUrl, caption: 'Image test (user URL)' },
      botToken,
      chatId
    );

    console.log('Photo send result:', JSON.stringify(result));
    return result;
  });
}

test();
