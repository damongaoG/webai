import { isTerminalCase } from "./sse-util";
import type { ModelCaseVO } from "../interfaces/model-case.interface";

describe("isTerminalCase", () => {
  it("returns false for undefined/null", () => {
    expect(isTerminalCase(undefined)).toBeFalse();
    expect(isTerminalCase(null as unknown as ModelCaseVO)).toBeFalse();
  });

  it("returns false when index is not -1", () => {
    const vo: ModelCaseVO = { index: 0, state: "DONE" };
    expect(isTerminalCase(vo)).toBeFalse();
  });

  it("returns false when state not DONE", () => {
    const vo: ModelCaseVO = { index: -1, state: "running" };
    expect(isTerminalCase(vo)).toBeFalse();
  });

  it("returns true for index -1 and state DONE (case-insensitive)", () => {
    const vo1: ModelCaseVO = { index: -1, state: "DONE" };
    const vo2: ModelCaseVO = { index: -1, state: "done" as any };
    expect(isTerminalCase(vo1)).toBeTrue();
    expect(isTerminalCase(vo2)).toBeTrue();
  });
});
