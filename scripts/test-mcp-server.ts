#!/usr/bin/env tsx
/**
 * Test MCP server startup with environment variables
 */

import { spawn } from 'child_process';
import path from 'path';

async function testMCPServer() {
  console.log('🧪 Testing MCP server startup...\n');

  const env = {
    ...process.env,
    TELEGRAM_BOT_TOKEN: '8470728899:AAEfbP84B5106jrMsan4SMn1a2O_5yHBXUk',
    TELEGRAM_CHAT_ID: '1195212155',
    DEBUG_MCP: '1'
  };

  // Try to start the server
  const serverPath = path.join(process.cwd(), 'dist', 'index.js');
  
  console.log('Starting MCP server...');
  console.log(`Server path: ${serverPath}`);
  console.log(`Environment variables:`);
  console.log(`  TELEGRAM_BOT_TOKEN: ${env.TELEGRAM_BOT_TOKEN?.substring(0, 10)}...`);
  console.log(`  TELEGRAM_CHAT_ID: ${env.TELEGRAM_CHAT_ID}`);
  console.log('');

  const server = spawn('node', [serverPath], {
    env,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Collect output
  let stdoutData = '';
  let stderrData = '';

  server.stdout?.on('data', (data) => {
    stdoutData += data.toString();
    console.log('[STDOUT]', data.toString());
  });

  server.stderr?.on('data', (data) => {
    stderrData += data.toString();
    console.log('[STDERR]', data.toString());
  });

  // Wait 2 seconds then terminate
  setTimeout(() => {
    console.log('\n✅ Server started successfully!');
    server.kill();
    process.exit(0);
  }, 2000);

  // Handle errors
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
    process.exit(1);
  });

  server.on('close', (code) => {
    if (code !== null && code !== 0 && code !== 143) { // 143 is SIGTERM
      console.error(`❌ Server exited with code ${code}`);
      console.error('STDERR:', stderrData);
      process.exit(1);
    }
  });
}

testMCPServer().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
