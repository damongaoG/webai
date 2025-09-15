import { parseSseStreamChunk, safeJsonParse } from "./sse-parser";

describe("sse-parser", () => {
  it("parses single case event with one data line", () => {
    const chunk = 'event: case\ndata: {"a":1}\n\n';
    const { events, carry } = parseSseStreamChunk(chunk, "");
    expect(carry).toBe("");
    expect(events.length).toBe(1);
    expect(events[0].event).toBe("case");
    expect(events[0].data).toBe('{"a":1}');
  });

  it("merges multiple data lines", () => {
    const chunk = 'event: case\ndata: {"a":\n\n';
    const first = parseSseStreamChunk(chunk, "");
    // nothing finalized yet due to missing blank line after data
    expect(first.events.length).toBe(0);

    const secondChunk = "event: ignored\n: comment\n";
    const second = parseSseStreamChunk(secondChunk, first.carry);
    expect(second.events.length).toBe(0);

    const thirdChunk = "data: 1}\n\n";
    const third = parseSseStreamChunk(thirdChunk, second.carry);
    expect(third.events.length).toBe(1);
    expect(third.events[0].event).toBe("case");
    expect(third.events[0].data).toBe('{"a":\n1}');
    expect(third.carry).toBe("");
  });

  it("filters out non-case events", () => {
    const chunk = "event: message\ndata: hello\n\n";
    const { events } = parseSseStreamChunk(chunk, "");
    expect(events.length).toBe(0);
  });

  it("ignores comments and heartbeats", () => {
    const chunk = ": keep-alive\n: ping\n";
    const { events, carry } = parseSseStreamChunk(chunk, "");
    expect(events.length).toBe(0);
    // carry keeps partial lines if any, here should be empty
    expect(carry).toBe("");
  });

  it("safeJsonParse returns undefined on invalid JSON", () => {
    expect(safeJsonParse("{")).toBeUndefined();
    expect(safeJsonParse("not-json")).toBeUndefined();
    expect(safeJsonParse('"ok"')).toBe("ok");
  });
});
