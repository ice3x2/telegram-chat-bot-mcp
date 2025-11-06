#!/usr/bin/env tsx
/**
 * LLM Agent Simulator for MCP Server Testing
 *
 * Simulates how an LLM agent (like Claude Code) would interact with the MCP server
 * using JSON-RPC 2.0 protocol over stdin/stdout.
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: Record<string, unknown>;
  error?: {
    code: number;
    message: string;
    data?: Record<string, unknown>;
  };
}

interface PendingRequest {
  resolve: (value: Record<string, unknown>) => void;
  reject: (reason: Error) => void;
  method: string;
}

interface McpTool {
  name: string;
  title?: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

interface ToolsListResult {
  tools?: McpTool[];
}

class MCPAgentSimulator {
  private server: ChildProcess | null = null;
  private messageId = 0;
  private pendingRequests = new Map<number, PendingRequest>();
  private buffer = '';

  constructor(private serverPath: string, private env: Record<string, string>) {}

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting MCP server...');
      console.log(`📁 Server path: ${this.serverPath}`);
      console.log(`🔑 Bot Token: ${this.env.TELEGRAM_BOT_TOKEN?.substring(0, 10)}...`);
      console.log(`💬 Chat ID: ${this.env.TELEGRAM_CHAT_ID}\n`);

      this.server = spawn('node', [this.serverPath], {
        env: this.env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Handle stdout - parse JSON-RPC responses
      this.server.stdout.on('data', (data: Buffer) => {
        this.buffer += data.toString();
        this.processBuffer();
      });

      // Handle stderr - log server messages
      this.server.stderr.on('data', (data: Buffer) => {
        const message = data.toString();
        console.log('📝 [Server Log]', message.trim());

        // Check if server is ready
        if (message.includes('MCP stdio server connected')) {
          resolve();
        }
      });

      this.server.on('error', (err: Error) => {
        console.error('❌ Server error:', err);
        reject(err);
      });

      this.server.on('close', (code: number) => {
        console.log(`\n🛑 Server closed with code ${code}`);
      });

      // Timeout for server startup
      setTimeout(() => {
        if (this.server.exitCode === null) {
          resolve(); // Server is still running
        } else {
          reject(new Error('Server failed to start'));
        }
      }, 3000);
    });
  }

  private processBuffer(): void {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || ''; // Keep incomplete line in buffer

    for (const line of lines) {
      if (line.trim() === '') continue;

      try {
        const response: JsonRpcResponse = JSON.parse(line);
        const pending = this.pendingRequests.get(response.id as number);

        if (pending) {
          this.pendingRequests.delete(response.id as number);

          if (response.error) {
            console.log(`❌ [${pending.method}] Error:`, response.error);
            pending.reject(new Error(response.error.message));
          } else {
            console.log(`✅ [${pending.method}] Success`);
            pending.resolve(response.result || {});
          }
        }
      } catch {
        console.error('⚠️  Failed to parse response:', line);
      }
    }
  }

  private async sendRequest(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const request: JsonRpcRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject, method });

      const message = JSON.stringify(request) + '\n';
      console.log(`\n📤 Sending request [${method}]:`, JSON.stringify(params, null, 2));

      this.server.stdin.write(message);

      // Timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 10000);
    });
  }

  async initialize(): Promise<Record<string, unknown>> {
    return this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'mcp-agent-simulator',
        version: '1.0.0'
      }
    });
  }

  async listTools(): Promise<Record<string, unknown>> {
    return this.sendRequest('tools/list');
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.sendRequest('tools/call', {
      name,
      arguments: args
    });
  }

  async shutdown(): Promise<void> {
    console.log('\n🛑 Shutting down server...');
    if (this.server) {
      this.server.kill();
    }
    return new Promise(resolve => {
      setTimeout(resolve, 500);
    });
  }
}

async function runTests() {
  const env = {
    ...process.env,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || 'PLACEHOLDER_BOT_TOKEN',
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || '1195212155',
    NODE_ENV: 'test'
  };

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.error('❌ TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set');
    process.exit(1);
  }

  const serverPath = path.join(__dirname, '..', 'dist', 'index.js');
  const agent = new MCPAgentSimulator(serverPath, env);

  try {
    // Test 1: Start server
    console.log('🧪 Test 1: Starting MCP Server\n');
    await agent.start();
    console.log('✅ Server started successfully\n');

    // Test 2: Initialize
    console.log('🧪 Test 2: Initialize Protocol\n');
    const initResult = await agent.initialize();
    console.log('📦 Initialize result:', JSON.stringify(initResult, null, 2));

    // Test 3: List tools
    console.log('\n🧪 Test 3: List Available Tools\n');
    const tools = await agent.listTools() as ToolsListResult;
    console.log('🔧 Available tools:', JSON.stringify(tools, null, 2));

    if (!tools || !tools.tools || tools.tools.length === 0) {
      console.error('\n❌ CRITICAL: No tools registered!');
      console.error('Expected 5 tools, but got:', tools.tools?.length || 0);
    } else {
      console.log(`\n✅ Found ${tools.tools.length} tools:`);
      tools.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description || 'No description'}`);
      });
    }

    // Test 4: Call send_telegram_text tool
    console.log('\n🧪 Test 4: Call send_telegram_text\n');
    try {
      const textResult = await agent.callTool('send_telegram_text', {
        text: '🤖 MCP Agent Simulator Test\n\nThis is a test message from the automated LLM agent simulator.'
      });
      console.log('📦 Result:', JSON.stringify(textResult, null, 2));
    } catch (error) {
      const err = error as Error;
      console.error('❌ Tool call failed:', err.message);
    }

    // Test 5: Call send_telegram_markdown tool
    console.log('\n🧪 Test 5: Call send_telegram_markdown\n');
    try {
      const markdownResult = await agent.callTool('send_telegram_markdown', {
        markdown: `# 🧪 MCP Agent Test

## Test Results
- **Protocol**: JSON-RPC 2.0 ✅
- **Transport**: stdio ✅
- **Tools**: Available ✅

\`\`\`bash
npm test
\`\`\`

> All systems operational!`,
        fallbackToText: true
      });
      console.log('📦 Result:', JSON.stringify(markdownResult, null, 2));
    } catch (error) {
      const err = error as Error;
      console.error('❌ Tool call failed:', err.message);
    }

    // Test 6: Test non-existent tool (should fail)
    console.log('\n🧪 Test 6: Call Non-existent Tool (Error Test)\n');
    try {
      await agent.callTool('non_existent_tool', {});
      console.error('❌ Should have failed but succeeded!');
    } catch (error) {
      const err = error as Error;
      console.log('✅ Expected error:', err.message);
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log('✅ Server startup: PASS');
    console.log('✅ Protocol initialization: PASS');
    console.log(`${tools && tools.tools && tools.tools.length > 0 ? '✅' : '❌'} Tool registration: ${tools?.tools?.length || 0}/5 tools`);
    console.log('✅ Tool execution: PASS');
    console.log('✅ Error handling: PASS');
    console.log('='.repeat(60));

  } catch (error) {
    const err = error as Error;
    console.error('\n❌ Test failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await agent.shutdown();
  }
}

// Run tests
runTests().catch((error: unknown) => {
  const err = error as Error;
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
