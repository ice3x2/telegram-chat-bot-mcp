import axios from 'axios';
import { logger } from './logger.js';

export interface ImageValidationResult {
  valid: boolean;
  contentType?: string;
  contentLength?: number;
  error?: string;
}

/**
 * Validates an image URL by performing a HEAD request.
 * Checks:
 * - HTTP status is 2xx
 * - Content-Type starts with "image/"
 * - Content-Length is less than 5MB (5242880 bytes)
 * 
 * @param url - The image URL to validate
 * @param timeoutMs - Request timeout in milliseconds (default: 5000)
 * @returns ImageValidationResult with validation details
 */
export async function validateImageUrl(
  url: string,
  timeoutMs: number = 5000
): Promise<ImageValidationResult> {
  try {
    const response = await axios.head(url, {
      timeout: timeoutMs,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    const contentType = response.headers['content-type'] || '';
    const contentLength = parseInt(response.headers['content-length'] || '0', 10);

    // Check content type
    if (!contentType.toLowerCase().startsWith('image/')) {
      const error = `Invalid content type: ${contentType} (expected image/*)`;
      logger.warn('imageValidator', 'image_validation_failed', {
        url,
        error,
        contentType,
        contentLength,
      });
      return {
        valid: false,
        contentType,
        contentLength,
        error,
      };
    }

    // Check content length (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (contentLength > maxSize) {
      const error = `Image too large: ${contentLength} bytes (max ${maxSize} bytes)`;
      logger.warn('imageValidator', 'image_validation_failed', {
        url,
        error,
        contentType,
        contentLength,
      });
      return {
        valid: false,
        contentType,
        contentLength,
        error,
      };
    }

    return {
      valid: true,
      contentType,
      contentLength,
    };
  } catch (error: any) {
    let errorMessage = 'Unknown error';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Request timeout';
      } else if (error.response) {
        errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Network error or URL not reachable';
      } else {
        errorMessage = error.message;
      }
    } else {
      errorMessage = String(error);
    }

    logger.warn('imageValidator', 'image_validation_failed', {
      url,
      error: errorMessage,
    });

    return {
      valid: false,
      error: errorMessage,
    };
  }
}
