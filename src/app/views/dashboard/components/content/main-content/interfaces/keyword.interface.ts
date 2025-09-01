// KeywordData is now just an alias for GridItem since no additional properties are needed
export type KeywordData = import("./grid.interface").GridItem;

export interface KeywordsGridConfig {
  gap: number;
  animationDuration: number;
}

export interface ExpandableState {
  isExpanded: boolean;
  contentType:
    | "keywords"
    | "assignment"
    | "arguments"
    | "references"
    | "casestudies"
    | string
    | null;
  animating?: boolean;
}
