import { sendTelegramMarkdown } from '../src/tools/sendTelegramMarkdown.js';

const report = process.argv[2] || 'No report content provided';

async function sendReport() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  try {
    const result = await sendTelegramMarkdown(
      { markdown: report, fallbackToText: true },
      botToken,
      chatId
    );
    console.log('✅ 완료 보고서 전송 성공!');
    console.log('메시지 ID:', result.messageId);
  } catch (error) {
    console.error(' 전송 실패:', error);
    process.exit(1);
  }
}

sendReport();
