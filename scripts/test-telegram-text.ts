import { sendTelegramText } from '../src/tools/sendTelegramText.js';
import { getTestCredentials, runTest, logResult } from './test-helpers.js';

async function test() {
  const { botToken, chatId } = getTestCredentials();

  await runTest('Telegram text message', async () => {
    const result = await sendTelegramText(
      { text: '✅ Hello from Telegram Bot MCP! 🚀' },
      botToken,
      chatId
    );

    logResult(result);
    return result;
  });
}

test();
