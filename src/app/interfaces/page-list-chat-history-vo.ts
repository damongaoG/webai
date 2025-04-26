import { ListChatHistoryDto } from "./list-chat-history-dto";
import { PageableObject } from "./pageable-object";
import { SortObject } from "./sort-object";

export interface PageListChatHistoryVo {
  content: Array<ListChatHistoryDto>;
  pageable: PageableObject;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: SortObject;
  numberOfElements: number;
  empty: boolean;
}
