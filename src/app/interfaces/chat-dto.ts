import { SafeHtml } from "@angular/platform-browser";

export interface ChatMessage {
  role: string;
  content: string;
  isUser: boolean;
  tag?: number;
  parsedContent?: any;
  isFromHistory?: boolean;
  isError?: boolean; // Added optional property for error handling
}

export interface ChatData {
  messages: ChatMessage[];
  tag: number;
  sessionId?: string;
}
