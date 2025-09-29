export const SseCaseEventName = "case" as const;

export interface ModelCaseResultItem {
  id?: string;
  title: string;
  timePeriod?: string;
  background?: string;
  methodology?: string;
  findings?: string;
}

export interface ModelCaseVO {
  id?: string;
  index: number;
  total?: number;
  link?: string;
  results?: ReadonlyArray<ModelCaseResultItem>;
  status?: string;
  linkStatusCode?: number;
  error?: string | null;
  elapsedMs?: number;
}
