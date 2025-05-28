import { ModelMessageDTO } from './model-message-dto';

export interface ListChatHistoryDto {
  sessionId: string;
  tag: number;
  userId: string;
  messages: ModelMessageDTO[];
  updateTime: string;
  createTime: string;
}
