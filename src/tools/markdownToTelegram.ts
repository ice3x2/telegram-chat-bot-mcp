import { marked } from 'marked';

/**
 * Convert Markdown to Telegram HTML format
 * 
 * @param markdown - Markdown text to convert
 * @returns HTML string suitable for Telegram
 * @throws Error if markdown is empty or parsing fails
 */
export function markdownToTelegramHTML(markdown: string): string {
  if (!markdown || markdown.trim() === '') {
    throw new Error('Markdown content is empty');
  }

  try {
    const tokens = marked.lexer(markdown);
    const htmlParts: string[] = [];

    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          htmlParts.push(headingToHTML(token as any));
          break;
        case 'paragraph':
          htmlParts.push(paragraphToHTML(token as any));
          break;
        case 'table':
          htmlParts.push(tableToHTML(token as any));
          break;
        case 'list':
          htmlParts.push(listToHTML(token as any));
          break;
        case 'code':
          htmlParts.push(codeToHTML(token as any));
          break;
        case 'blockquote':
          htmlParts.push(blockquoteToHTML(token as any));
          break;
        case 'space':
          htmlParts.push('');
          break;
        default:
          // Ignore unknown token types
          break;
      }
    }

    return htmlParts.join('\n').trim();
  } catch (error) {
    throw new Error(`Markdown parsing failed: ${(error as Error).message}`);
  }
}

/**
 * Convert heading token to HTML
 */
function headingToHTML(token: any): string {
  const depth = token.depth || 1;
  const text = escapeHTML(token.text || '');

  if (depth === 1) return `<b>📌 ${text}</b>`;
  if (depth === 2) return `<b>${text}</b>`;
  return `<b><i>${text}</i></b>`;
}

/**
 * Convert paragraph token to HTML
 */
function paragraphToHTML(token: any): string {
  let text = token.text || '';
  text = processInlineMarkdown(text);
  return text;
}

/**
 * Convert list token to HTML
 */
function listToHTML(token: any): string {
  const items = token.items || [];
  const lines: string[] = [];

  items.forEach((item: any, index: number) => {
    let text = item.text || '';
    text = processInlineMarkdown(text);

    const prefix = token.ordered ? `${index + 1}. ` : '• ';
    lines.push(prefix + text);
  });

  return lines.join('\n');
}

/**
 * Convert code token to HTML
 */
function codeToHTML(token: any): string {
  const code = escapeHTML(token.text || '');
  return `<pre>${code}</pre>`;
}

/**
 * Convert blockquote token to HTML
 */
function blockquoteToHTML(token: any): string {
  const text = processInlineMarkdown(token.text || '');
  return `<i>❝ ${text}</i>`;
}

/**
 * Convert table token to HTML (render as preformatted text)
 * Telegram doesn't support HTML tables, so render as a code block to preserve layout
 *
 * Marked parses table cells as objects: { text: string, tokens: [...], align?: string, header?: boolean }
 * We need to extract the text property from each cell object
 */
function tableToHTML(token: any): string {
  // `token` structure from marked table: { header: object[], rows: object[][] }
  const header = token.header || [];
  const rows = token.rows || [];

  // Build lines with pipe separators to preserve table structure
  const lines: string[] = [];
  if (header.length > 0) {
    // Extract text from header cell objects: { text: "Name", tokens: [...], ... }
    const headerTexts = header.map((cell: any) => {
      return typeof cell === 'string' ? cell : (cell.text || '');
    });
    lines.push('| ' + headerTexts.join(' | ') + ' |');
    lines.push('|' + header.map(() => '---').join('|') + '|');
  }

  for (const row of rows) {
    // Extract text from each cell object in the row: { text: "Alice", tokens: [...], ... }
    const rowTexts = row.map((cell: any) => {
      return typeof cell === 'string' ? cell : (cell.text || '');
    });
    lines.push('| ' + rowTexts.join(' | ') + ' |');
  }

  const text = lines.join('\n');
  return `<pre>${escapeHTML(text)}</pre>`;
}

/**
 * Process inline markdown: **bold**, *italic*, `code`, [link](url), ![alt](url)
 * Properly escapes content within each markdown element
 */
function processInlineMarkdown(text: string): string {
  // First escape HTML in raw text (but we'll re-process specific patterns)
  // Instead, process patterns and escape their content

  // `code` → <code>escaped_code</code> (escape first!)
  text = text.replace(/`([^`]+)`/g, (match, code) => {
    return `<code>${escapeHTML(code)}</code>`;
  });

  // **bold** → <b>escaped_text</b> (escape the content)
  text = text.replace(/\*\*([^*]+)\*\*/g, (match, bold) => {
    return `<b>${escapeHTML(bold)}</b>`;
  });

  // *italic* → <i>escaped_text</i> (escape the content)
  text = text.replace(/\*([^*]+)\*/g, (match, italic) => {
    return `<i>${escapeHTML(italic)}</i>`;
  });

  // [link](url) → <a href="url">link</a> (escape link text)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    return `<a href="${escapeHTML(url)}">${escapeHTML(linkText)}</a>`;
  });

  // ![alt](url) → 🖼️ <a href="url">alt</a> (escape alt text and url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    return `🖼️ <a href="${escapeHTML(url)}">${escapeHTML(alt)}</a>`;
  });

  return text;
}

/**
 * Escape HTML special characters for Telegram
 * Handles all special characters that could break HTML parsing
 */
function escapeHTML(text: string): string {
  // Order matters: & must be first to avoid double-escaping
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')  // Double quote
    .replace(/'/g, '&#39;');  // Single quote / apostrophe
}
