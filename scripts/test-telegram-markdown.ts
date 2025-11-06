import { sendTelegramMarkdown } from '../src/tools/sendTelegramMarkdown.js';
import { getTestCredentials, runTest } from './test-helpers.js';

const testMarkdown = `# 🚀 Telegram Markdown Test

## Features
- **Markdown** support
- *Italic* text
- \`Code\` blocks

\`\`\`bash
npm run build
\`\`\`

[GitHub Repo](https://github.com/example/repo)

> This is a blockquote

### Nested Lists
- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
`;

async function test() {
  const { botToken, chatId } = getTestCredentials();

  await runTest('Telegram Markdown conversion', async () => {
    const result = await sendTelegramMarkdown(
      { markdown: testMarkdown, fallbackToText: true },
      botToken,
      chatId
    );

    console.log(JSON.stringify(result, null, 2));
    return result;
  });
}

test();
