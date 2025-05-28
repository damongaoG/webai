import { ModelMessageDTO } from './model-message-dto';

export interface SaveChatHistoryDto {
  userId: string;
  sessionId?: string;
  messages: Array<ModelMessageDTO>;
  tag: number;
}
