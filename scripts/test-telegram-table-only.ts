import { sendTelegramMarkdown } from '../src/tools/sendTelegramMarkdown.js';
import { getTestCredentials, runTest } from './test-helpers.js';

const tableMarkdown = `# Table Test

| Name | Age | City |
|------|-----:|------|
| Alice | 30 | Seoul |
| Bob | 25 | Busan |
`;

async function test() {
  const { botToken, chatId } = getTestCredentials();

  await runTest('Telegram Markdown table conversion (table-only)', async () => {
    const result = await sendTelegramMarkdown(
      { markdown: tableMarkdown, fallbackToText: true },
      botToken,
      chatId
    );

    console.log('Table send result:', JSON.stringify(result));
    return result;
  });
}

test();
