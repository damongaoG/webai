import { ListChatSessionVo } from "./list-chat-session-vo";
import { PageableObject } from "./pageable-object";
import { SortObject } from "./sort-object";

export interface PageListChatSessionVo {
  content: ListChatSessionVo[];
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
