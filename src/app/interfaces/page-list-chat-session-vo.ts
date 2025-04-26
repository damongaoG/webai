import { ListChatSessionVo } from "./list-chat-session-vo";
import { PageableObject } from "./pageable-object";
import { SortObject } from "./sort-object";

export interface PageListChatSessionVo {
  content: Array<ListChatSessionVo>;
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
