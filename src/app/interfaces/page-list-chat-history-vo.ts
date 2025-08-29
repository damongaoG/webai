import { ListChatHistoryDto } from "./list-chat-history-dto";
import { PageableObject } from "./pageable-object";
import { SortObject } from "./sort-object";

export interface PageListChatHistoryVo {
  content: ListChatHistoryDto[];
  pageable: PageableObject;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: SortObject;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
