import { ModelMessageDTO } from "./model-message-dto";

export interface ListChatHistoryDto {
  sessionId: string;
  tag: number;
  userId: string;
  content: string;
  updateTime: string;
  createTime: string;
}
