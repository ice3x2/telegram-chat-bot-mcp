import { sendTelegramMarkdown } from '../src/tools/sendTelegramMarkdown.js';
import { sendTelegramPhoto } from '../src/tools/sendTelegramPhoto.js';
import { getTestCredentials, runTest } from './test-helpers.js';

const tableMarkdown = `# Table Test

| Name | Age | City |
|------|-----:|------|
| Alice | 30 | Seoul |
| Bob | 25 | Busan |
`;

async function test() {
  const { botToken, chatId } = getTestCredentials();

  // Test 1: Table
  await runTest('Telegram Markdown table conversion', async () => {
    const result = await sendTelegramMarkdown(
      { markdown: tableMarkdown, fallbackToText: true },
      botToken,
      chatId
    );
    console.log('Table send result:', JSON.stringify(result));
    return result;
  });

  // Test 2: Image
  const imageUrl = 'https://via.placeholder.com/600x200.png?text=Telegram+Image+Test';
  await runTest('Telegram photo send', async () => {
    const result = await sendTelegramPhoto(
      { photo: imageUrl, caption: 'Image test' },
      botToken,
      chatId
    );
    console.log('Photo send result:', JSON.stringify(result));
    return result;
  });
}

test();
