import { SseCaseEventName, type ModelCaseVO } from "./model-case.interface";

describe("ModelCaseVO types", () => {
  it("should allow minimal valid payload", () => {
    const payload: ModelCaseVO = { index: 0 };
    expect(payload.index).toBe(0);
  });

  it("should support results array with typed items", () => {
    const payload: ModelCaseVO = {
      index: 1,
      total: 10,
      results: [
        {
          title: "Latest World Official Gold Reserves",
          timePeriod: "Data as of 30 June, 2025",
          background:
            "Compilation of official gold holdings from central banks worldwide.",
          methodology:
            "Data sourced from IMF IFS, World Bank, World Gold Council; holdings measured in tonnes, US$ value and % of total reserves.",
          findings: "Not specified",
        },
      ],
      status: "OK",
      linkStatusCode: 200,
      error: null,
      elapsedMs: 1000,
      state: "RUNNING",
    };
    expect(payload.results?.[0].title).toContain("Gold");
  });

  it("should expose constant event name", () => {
    expect(SseCaseEventName).toBe("case");
  });

  it("should accept DONE terminal example shape", () => {
    const terminal: ModelCaseVO = {
      index: -1,
      state: "DONE",
      status: "OK",
    };
    expect(terminal.index).toBe(-1);
    expect(terminal.state).toBe("DONE");
  });
});
