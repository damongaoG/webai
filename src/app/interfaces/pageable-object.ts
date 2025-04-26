import {SortObject} from "./sort-object";

export interface PageableObject {
  pageNumber: number;
  pageSize: number;
  sort: SortObject;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}
