import { SortObject } from "./sort-object";

export interface PageableObject {
  sort: SortObject;
  offset: number;
  pageSize: number;
  pageNumber: number;
  paged: boolean;
  unpaged: boolean;
}
