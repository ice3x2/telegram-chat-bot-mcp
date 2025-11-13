import axios, { AxiosInstance } from 'axios';
import https from 'https';
import http from 'http';

/**
 * Telegram API timeout configuration (milliseconds)
 * Centralized timeout settings for all Telegram operations
 */

/**
 * Default timeout for plain text messages (milliseconds)
 * Environment variable: TELEGRAM_TEXT_TIMEOUT
 * Default: 10 seconds
 */
export const TELEGRAM_TEXT_TIMEOUT = parseInt(process.env.TELEGRAM_TEXT_TIMEOUT || '10000', 10);

/**
 * Timeout for Markdown-to-HTML conversion and sending (milliseconds)
 * Environment variable: TELEGRAM_MARKDOWN_TIMEOUT
 * Default: 10 seconds
 */
export const TELEGRAM_MARKDOWN_TIMEOUT = parseInt(process.env.TELEGRAM_MARKDOWN_TIMEOUT || '10000', 10);

/**
 * Timeout for messages with inline buttons (milliseconds)
 * Environment variable: TELEGRAM_BUTTONS_TIMEOUT
 * Default: 10 seconds
 */
export const TELEGRAM_BUTTONS_TIMEOUT = parseInt(process.env.TELEGRAM_BUTTONS_TIMEOUT || '10000', 10);

/**
 * Timeout for photo/image uploads (milliseconds)
 * Longer than default timeout to allow for larger file uploads
 * Environment variable: TELEGRAM_PHOTO_TIMEOUT
 * Default: 15 seconds
 */
export const TELEGRAM_PHOTO_TIMEOUT = parseInt(process.env.TELEGRAM_PHOTO_TIMEOUT || '15000', 10);

/**
 * @deprecated Use specific timeout constants instead:
 * - TELEGRAM_TEXT_TIMEOUT for text messages
 * - TELEGRAM_MARKDOWN_TIMEOUT for markdown messages
 * - TELEGRAM_BUTTONS_TIMEOUT for button messages
 * - TELEGRAM_PHOTO_TIMEOUT for photo uploads
 */
export const TELEGRAM_TIMEOUT = TELEGRAM_TEXT_TIMEOUT;

/**
 * Create configured axios instance for Telegram API
 * Optimized for WSL and cross-platform compatibility
 *
 * Connection Pool Settings:
 * - maxSockets: Maximum concurrent connections (50)
 * - maxFreeSockets: Maximum idle connections (10)
 * - timeout: Idle connection timeout (60s)
 * - keepAliveMsecs: Keep-alive interval (30s)
 */
export function createTelegramAxios(): AxiosInstance {
  const httpAgent = new http.Agent({
    family: 4,  // Force IPv4 to avoid WSL IPv6 timeout issues
    keepAlive: true,
    maxSockets: 50,        // Max concurrent connections
    maxFreeSockets: 10,    // Max idle connections
    timeout: 60000,        // Idle connection timeout (60s)
    keepAliveMsecs: 30000  // Keep-alive interval (30s)
  });

  const httpsAgent = new https.Agent({
    family: 4,  // Force IPv4 to avoid WSL IPv6 timeout issues
    keepAlive: true,
    maxSockets: 50,        // Max concurrent connections
    maxFreeSockets: 10,    // Max idle connections
    timeout: 60000,        // Idle connection timeout (60s)
    keepAliveMsecs: 30000  // Keep-alive interval (30s)
  });

  return axios.create({
    httpAgent,
    httpsAgent,
    timeout: TELEGRAM_TEXT_TIMEOUT,  // Default timeout for general Telegram API calls
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

/**
 * Create axios instance for image validation (HEAD requests only)
 * Uses non-keepalive connections to avoid connection pool accumulation
 */
export function createImageValidatorAxios(): AxiosInstance {
  return axios.create({
    // No keep-alive for image validator to prevent connection pool accumulation
    httpAgent: new http.Agent({
      family: 4,
      keepAlive: false  // Disable keep-alive for HEAD requests
    }),
    httpsAgent: new https.Agent({
      family: 4,
      keepAlive: false  // Disable keep-alive for HEAD requests
    }),
    timeout: 5000,  // Shorter timeout for image validation
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

/**
 * Store agent references for graceful shutdown
 */
let telegramAxiosInstance: AxiosInstance | null = null;
let imageValidatorAxiosInstance: AxiosInstance | null = null;

/**
 * Initialization flags to prevent race conditions during concurrent access
 * Node.js is single-threaded, but async operations can interleave
 */
let telegramAxiosInitializing = false;
let imageValidatorAxiosInitializing = false;

/**
 * Singleton instance for Telegram API
 * Thread-safe lazy initialization with race condition prevention
 */
export function getTelegramAxios(): AxiosInstance {
  // Fast path: already initialized
  if (telegramAxiosInstance) {
    return telegramAxiosInstance;
  }

  // Initialization guard: prevent concurrent initialization attempts
  if (telegramAxiosInitializing) {
    // If another code path is initializing, wait synchronously for completion
    // This is safe because Node.js is single-threaded
    let attempts = 0;
    const maxAttempts = 100; // 100 * 10ms = 1 second timeout
    while (!telegramAxiosInstance && attempts < maxAttempts) {
      // Busy-wait is acceptable here because initialization is very fast
      attempts++;
    }
    if (!telegramAxiosInstance) {
      throw new Error(
        'Failed to initialize Telegram axios instance within timeout'
      );
    }
    return telegramAxiosInstance;
  }

  // Mark as initializing
  telegramAxiosInitializing = true;
  try {
    telegramAxiosInstance = createTelegramAxios();
    return telegramAxiosInstance;
  } finally {
    telegramAxiosInitializing = false;
  }
}

/**
 * Singleton instance for image validation
 * Thread-safe lazy initialization with race condition prevention
 */
export function getImageValidatorAxios(): AxiosInstance {
  // Fast path: already initialized
  if (imageValidatorAxiosInstance) {
    return imageValidatorAxiosInstance;
  }

  // Initialization guard: prevent concurrent initialization attempts
  if (imageValidatorAxiosInitializing) {
    // If another code path is initializing, wait synchronously for completion
    let attempts = 0;
    const maxAttempts = 100; // 100 * 10ms = 1 second timeout
    while (!imageValidatorAxiosInstance && attempts < maxAttempts) {
      // Busy-wait is acceptable here because initialization is very fast
      attempts++;
    }
    if (!imageValidatorAxiosInstance) {
      throw new Error(
        'Failed to initialize image validator axios instance within timeout'
      );
    }
    return imageValidatorAxiosInstance;
  }

  // Mark as initializing
  imageValidatorAxiosInitializing = true;
  try {
    imageValidatorAxiosInstance = createImageValidatorAxios();
    return imageValidatorAxiosInstance;
  } finally {
    imageValidatorAxiosInitializing = false;
  }
}

/**
 * Graceful shutdown: destroy all agents
 */
export function destroyAxiosAgents(): void {
  if (telegramAxiosInstance) {
    const telegramAgent = telegramAxiosInstance.defaults.httpAgent as http.Agent;
    const telegramHttpsAgent = telegramAxiosInstance.defaults.httpsAgent as https.Agent;
    if (telegramAgent) telegramAgent.destroy();
    if (telegramHttpsAgent) telegramHttpsAgent.destroy();
    telegramAxiosInstance = null;
  }

  if (imageValidatorAxiosInstance) {
    const imageAgent = imageValidatorAxiosInstance.defaults.httpAgent as http.Agent;
    const imageHttpsAgent = imageValidatorAxiosInstance.defaults.httpsAgent as https.Agent;
    if (imageAgent) imageAgent.destroy();
    if (imageHttpsAgent) imageHttpsAgent.destroy();
    imageValidatorAxiosInstance = null;
  }
}
