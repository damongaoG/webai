export interface ListChatHistoryDto {
  id: string;
  userId: string;
  role: string;
  sessionId: string;
  content: string;
  tag: number;
  createTime: string;
}
