export const SseCaseEventName = "case" as const;

export interface ModelCaseResultItem {
  title: string;
  timePeriod?: string;
  background?: string;
  methodology?: string;
  findings?: string;
}

export interface ModelCaseVO {
  index: number;
  total?: number;
  link?: string;
  results?: ReadonlyArray<ModelCaseResultItem>;
  status?: string;
  linkStatusCode?: number;
  error?: string | null;
  elapsedMs?: number;
}
