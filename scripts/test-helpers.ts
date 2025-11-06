/**
 * Common test helper functions for Telegram Bot MCP tests
 */

export interface TestCredentials {
  botToken: string;
  chatId: string;
}

/**
 * Get test credentials from environment variables
 * Exits with error if credentials are not set
 */
export function getTestCredentials(): TestCredentials {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  return { botToken, chatId };
}

/**
 * Run a test with consistent error handling and logging
 */
export async function runTest<T>(
  name: string,
  testFn: () => Promise<T>
): Promise<T> {
  console.log(`🧪 Testing ${name}...\n`);

  try {
    const result = await testFn();
    console.log('✅ Success!');
    return result;
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

/**
 * Log test result details
 */
export function logResult(result: any): void {
  if (result.message_id) {
    console.log('Message ID:', result.message_id);
  }
  if (result.messageId) {
    console.log('Message ID:', result.messageId);
  }
  if (result.chat?.id) {
    console.log('Chat ID:', result.chat.id);
  }
  if (result.usedFallback !== undefined) {
    console.log('Used fallback:', result.usedFallback);
  }
}
