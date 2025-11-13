#!/usr/bin/env node
import { startServer } from './server.js';
import { destroyAxiosAgents } from './utils/axiosConfig.js';

async function main() {
  await startServer();
}

// Graceful shutdown helper
function gracefulShutdown(signal: string, exitCode: number = 0) {
  console.log(`${signal} received, shutting down gracefully...`);
  destroyAxiosAgents();
  process.exit(exitCode);
}

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM', 0);
});

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT', 0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  destroyAxiosAgents();
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  destroyAxiosAgents();
  process.exit(1);
});

main().catch((err) => {
  console.error('Fatal error starting server:', err);
  destroyAxiosAgents();
  process.exit(1);
});
