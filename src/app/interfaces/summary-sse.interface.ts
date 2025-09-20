export const SseSummaryEventName = "summary" as const;

export interface SummarySseItem {
  index: number;
  status?: string;
  result?: string;
  statusCode?: number;
  error?: string | null;
  elapsedMs?: number;
}
