import type { ModelCaseVO } from "../interfaces/model-case.interface";

/** Terminal condition for ModelCaseVO in SSE stream */
export function isTerminalCase(vo: ModelCaseVO | undefined | null): boolean {
  if (!vo) return false;
  if (vo.index !== -1) return false;
  return vo.status === "DONE";
}
