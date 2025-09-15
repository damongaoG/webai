export interface ParsedSseEvent {
  event: string;
  data: string;
}

/**
 * Parse a chunk of SSE text with a carry string from previous incomplete parse.
 * Returns parsed events (filtered to event === 'case') and the new carry string to keep for the next call.
 */
export function parseSseStreamChunk(
  buffer: string,
  carry: string,
): { events: ReadonlyArray<ParsedSseEvent>; carry: string } {
  const combined = (carry ?? "") + (buffer ?? "");

  // Fast bail for empty input
  if (combined.length === 0) {
    return { events: [], carry: "" };
  }

  const events: ParsedSseEvent[] = [];

  let currentEventName: string | undefined;
  let currentDataLines: string[] = [];

  // Track how many characters are fully processed (up to the end of the last finalized event)
  let processedIndex = 0;

  // Manual line scanner to retain precise processedIndex
  let i = 0;
  let lineStart = 0;
  while (i < combined.length) {
    const ch = combined.charCodeAt(i);
    if (ch === 10 /* \n */) {
      // Extract a line without the trailing \n; remove optional trailing \r
      let line = combined.slice(lineStart, i);
      if (line.endsWith("\r")) {
        line = line.slice(0, -1);
      }

      // Empty line signals dispatch
      if (line === "") {
        // Only emit when there is some accumulated data or event name
        const data =
          currentDataLines.length > 0 ? currentDataLines.join("\n") : "";
        const eventName = currentEventName ?? "message";
        if (eventName === "case") {
          events.push({ event: eventName, data });
        }
        // Reset state
        currentEventName = undefined;
        currentDataLines = [];
        // All characters up to and including this newline are now processed
        processedIndex = i + 1;
      } else {
        // Process field line: `event:` or `data:` or comment starting with `:`
        if (line.startsWith(":")) {
          // Comment/heartbeat: ignore content
        } else if (line.startsWith("event:")) {
          currentEventName = line.slice(6).trimStart();
        } else if (line.startsWith("data:")) {
          const value = line.slice(5).trimStart();
          currentDataLines.push(value);
        }
      }

      // Next line
      i += 1;
      lineStart = i;
      continue;
    }

    i += 1;
  }

  // If we reach here, there may be a partial line and/or a non-finalized event
  // Keep everything since the last fully processed boundary as carry
  const newCarry = combined.slice(processedIndex);
  return { events, carry: newCarry };
}

/** Safe JSON parse that never throws. */
export function safeJsonParse<T>(text: string): T | undefined {
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined;
  }
}
