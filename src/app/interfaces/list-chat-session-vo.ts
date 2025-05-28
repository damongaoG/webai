import { ModelMessageDTO } from './model-message-dto';

export interface ListChatSessionVo {
  id: string;
  userId: string;
  sessionId: string;
  tag: number;
  messages: ModelMessageDTO[];
  createTime: string;
  updateTime: string;
}
