import { ModelMessageDTO } from "./model-message-dto";

export interface ModelRequestDto {
  tag: 0 | 1 | 2; // 0:economicQA, 1:economicTheses, 2:rewrite
  messages: Array<ModelMessageDTO>;
}
