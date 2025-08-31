export interface KeywordData {
  id: string;
  text: string;
  isSelected?: boolean;
  category?: string;
}

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
