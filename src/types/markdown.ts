export interface SendMarkdownOptions {
  markdown: string;
  cardTitle?: string;
  fallbackToText?: boolean;
}

export interface SendMarkdownResult {
  success: boolean;
  messageId?: string;
  usedFallback?: boolean;
  fallbackReason?: string;
  error?: string;
}
