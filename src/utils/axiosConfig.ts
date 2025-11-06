import axios, { AxiosInstance } from 'axios';
import https from 'https';
import http from 'http';

/**
 * Create configured axios instance for Telegram API
 * Optimized for WSL and cross-platform compatibility
 */
export function createTelegramAxios(): AxiosInstance {
  return axios.create({
    // Force IPv4 to avoid WSL IPv6 timeout issues
    httpAgent: new http.Agent({ family: 4 }),
    httpsAgent: new https.Agent({
      family: 4,
      keepAlive: true,
      keepAliveMsecs: 30000
    }),
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

/**
 * Singleton instance for reuse
 */
export const telegramAxios = createTelegramAxios();
