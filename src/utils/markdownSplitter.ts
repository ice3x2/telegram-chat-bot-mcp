import { markdownToTelegramHTML } from '../tools/markdownToTelegram';

/**
 * Markdown Splitter Utility
 * Splits large markdown documents into chunks to avoid Telegram API length limits
 *
 * Strategy:
 * 1. Convert markdown to actual HTML to get real size
 * 2. If >= 4000 chars (Telegram's 4096 limit - 96 safety margin), split the markdown
 * 3. Find split points (---, #-headers, or newlines)
 * 4. Add page numbers (1/5, 2/5, etc.)
 */

export interface SplitMarkdownResult {
  chunks: string[];
  isSplit: boolean;
  originalLength: number;
  actualHtmlLength: number;
  chunkCount: number;
}

/**
 * Measure actual HTML size after markdown conversion
 * This is more accurate than estimation because it accounts for:
 * - HTML tag overhead (<b>, <i>, <a>, <code>, etc.)
 * - Special character escaping (&amp;, &lt;, &gt;, &quot;, &#39;)
 */
function measureActualHtmlSize(markdown: string): number {
  try {
    const html = markdownToTelegramHTML(markdown);
    return html.length;
  } catch (error) {
    // If conversion fails, use conservative estimate
    return markdown.length * 3;
  }
}

/**
 * Find the best split point around the middle position
 * Tries to find: --- > # header > newline
 * Search range: middle ± 30% of the chunk
 */
function findSplitPoint(
  text: string,
  startPos: number,
  endPos: number
): number | null {
  const middle = Math.floor((startPos + endPos) / 2);
  // Use flexible search range (30%) to find natural split points
  const searchRange = Math.floor((endPos - startPos) * 0.3);

  const searchStart = Math.max(startPos, middle - searchRange);
  const searchEnd = Math.min(endPos, middle + searchRange);

  // Try to find --- (horizontal rule)
  for (let i = searchStart; i <= searchEnd; i++) {
    if (text.substring(i, i + 3) === '---' &&
        (i === 0 || text[i - 1] === '\n') &&
        (i + 3 >= text.length || text[i + 3] === '\n')) {
      // Found a horizontal rule, split before it
      return i;
    }
  }

  // Try to find # (header)
  for (let i = searchStart; i <= searchEnd; i++) {
    if (text[i] === '#' && (i === 0 || text[i - 1] === '\n')) {
      // Found a header, split before it
      return i;
    }
  }

  // Try to find newline
  for (let i = searchStart; i <= searchEnd; i++) {
    if (text[i] === '\n') {
      return i + 1; // Split after the newline
    }
  }

  return null;
}

/**
 * Split markdown into chunks considering actual HTML conversion size
 * @param markdown Original markdown text
 * @returns Split result with chunks and metadata
 */
export function splitMarkdown(markdown: string): SplitMarkdownResult {
  const originalLength = markdown.length;

  // Measure actual HTML size after conversion
  // This accounts for tag overhead and special character escaping
  const actualHtmlLength = measureActualHtmlSize(markdown);

  // Use Telegram's 4096 limit with 46-character safety margin
  // Actual threshold: 4050 characters of HTML
  // Balanced for chunk size and message count
  const SPLIT_THRESHOLD = 4050;

  if (actualHtmlLength < SPLIT_THRESHOLD) {
    return {
      chunks: [markdown],
      isSplit: false,
      originalLength,
      actualHtmlLength,
      chunkCount: 1
    };
  }

  // Split the markdown into chunks
  const chunks: string[] = [];
  let currentPos = 0;

  while (currentPos < markdown.length) {
    // Try increasingly larger chunks until we find one that fits
    let chunkEndPos = currentPos + 1000; // Start with 1000 char chunks
    let bestSplitPoint: number | null = null;

    // Keep growing the chunk until HTML size exceeds threshold
    while (chunkEndPos < markdown.length && chunkEndPos <= currentPos + 5000) {
      const testChunk = markdown.substring(currentPos, chunkEndPos);
      const testHtmlLength = measureActualHtmlSize(testChunk);

      if (testHtmlLength > SPLIT_THRESHOLD) {
        // We've exceeded the threshold, try to find a split point before this
        bestSplitPoint = findSplitPoint(markdown, currentPos, chunkEndPos);
        break;
      }

      chunkEndPos += 200; // Grow by 200 chars at a time
    }

    // Handle end of document
    if (chunkEndPos >= markdown.length) {
      const chunk = markdown.substring(currentPos).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      break;
    }

    // If we found a good split point, use it
    if (bestSplitPoint && bestSplitPoint > currentPos) {
      const chunk = markdown.substring(currentPos, bestSplitPoint).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      currentPos = bestSplitPoint;
    } else {
      // No good split point found, just split at the maximum we can fit
      let splitPos = chunkEndPos;

      // Try to find a newline near the split point
      const newlinePos = markdown.lastIndexOf('\n', chunkEndPos);
      if (newlinePos > currentPos) {
        splitPos = newlinePos;
      }

      const chunk = markdown.substring(currentPos, splitPos).trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      currentPos = splitPos + 1;
    }
  }

  // If no chunks were created, return original
  if (chunks.length === 0) {
    chunks.push(markdown);
  }

  return {
    chunks,
    isSplit: chunks.length > 1,
    originalLength,
    actualHtmlLength,
    chunkCount: chunks.length
  };
}

/**
 * Add page numbers to chunks
 * e.g., "Content here\n\n---\n**(1/5)**"
 */
export function addPageNumbers(chunks: string[]): string[] {
  return chunks.map((chunk, index) => {
    const pageNumber = `${index + 1}/${chunks.length}`;
    const pageFooter = `\n\n---\n**[${pageNumber}]**`;
    return chunk + pageFooter;
  });
}

/**
 * Prepare markdown chunks for sequential sending
 * Includes splitting, page numbering, and validation
 */
export function prepareMarkdownChunks(markdown: string): string[] {
  const splitResult = splitMarkdown(markdown);

  if (!splitResult.isSplit) {
    // Single chunk, no page number needed
    return splitResult.chunks;
  }

  // Add page numbers for split chunks
  return addPageNumbers(splitResult.chunks);
}

/**
 * Calculate delay for sending (in milliseconds)
 * Telegram rate limiting: avoid sending too fast
 */
export function getSequentialSendDelay(): number {
  return 1000; // 1 second between messages
}
