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
 */
function processInlineMarkdown(text: string): string {
  // **bold** → <b>bold</b>
  text = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

  // *italic* → <i>italic</i>
  text = text.replace(/\*([^*]+)\*/g, '<i>$1</i>');

  // `code` → <code>code</code>
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // [link](url) → <a href="url">link</a>
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // ![alt](url) → 🖼️ <a href="url">alt</a>
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '🖼️ <a href="$2">$1</a>');

  return text;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
