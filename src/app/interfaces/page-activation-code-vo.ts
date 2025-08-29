import { PageableObject } from "./pageable-object";
import { SortObject } from "./sort-object";
import { ActivationCodeVo } from "./activation-code-vo";

export interface PageActivationCodeVo {
  content: Array<ActivationCodeVo>;
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
