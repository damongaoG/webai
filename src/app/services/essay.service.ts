import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environment/environment";
import {
  CreateEssayDto,
  CreateEssayResponse,
  KeywordsResponse,
  ArgumentsResponse,
  ScholarsResponse,
  UndoResponse,
} from "../interfaces/essay-create.interface";
import {
  parseSseStreamChunk,
  parseSseStreamChunkAll,
  safeJsonParse,
} from "../helper/sse-parser";
import { isTerminalCase } from "../helper/sse-util";
import {
  SseCaseEventName,
  type ModelCaseVO,
} from "../interfaces/model-case.interface";
import {
  SseSummaryEventName,
  type SummarySseItem,
} from "../interfaces/summary-sse.interface";

@Injectable({
  providedIn: "root",
})
export class EssayService {
  private readonly http = inject(HttpClient);
  // Note: Using model-processor-service endpoint for essay creation
  private readonly apiUrl = environment.modelProcessorServiceUrl;

  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  /**
   * Create a new essay by sending title to the API
   * @param createEssayDto - Contains the essay title
   * @returns Observable<CreateEssayResponse> - API response with essay data
   */
  createEssay(createEssayDto: CreateEssayDto): Observable<CreateEssayResponse> {
    return this.http.post<CreateEssayResponse>(
      `${this.apiUrl}/anon/paper`,
      createEssayDto,
      { headers: this.headers },
    );
  }

  /**
   * Get keywords for a specific essay
   * @param essayId - The ID of the essay
   * @returns Observable<KeywordsResponse> - API response with keywords data
   */
  getKeywords(essayId: string): Observable<KeywordsResponse> {
    return this.http.get<KeywordsResponse>(
      `${this.apiUrl}/anon/model/paper/action/${essayId}/keywords`,
      { headers: this.headers },
    );
  }

  /**
   * Get arguments for a specific essay with keywords
   * @param essayId - The ID of the essay
   * @param keywords - Comma-separated keywords string
   * @returns Observable<ArgumentsResponse> - API response with arguments data
   */
  getArguments(
    essayId: string,
    keywords: string,
  ): Observable<ArgumentsResponse> {
    return this.http.get<ArgumentsResponse>(
      `${this.apiUrl}/anon/model/paper/action/${essayId}/arguments?keywords=${encodeURIComponent(keywords)}`,
      { headers: this.headers },
    );
  }

  /**
   * Get scholars (references) for a specific essay with selected argument ids
   * @param essayId - The ID of the essay
   * @param selectedArgumentIds - Comma-separated IDs
   */
  getScholars(
    essayId: string,
    selectedArgumentIds: string,
  ): Observable<ScholarsResponse> {
    return this.http.get<ScholarsResponse>(
      `${this.apiUrl}/anon/model/paper/action/${essayId}/scholar?arguments=${encodeURIComponent(selectedArgumentIds)}`,
      { headers: this.headers },
    );
  }

  /**
   * Undo the last action for the essay
   * POST /model-processor-service/api/anon/model/paper/action/${id}/undo
   */
  undoAction(essayId: string): Observable<UndoResponse> {
    return this.http.post<UndoResponse>(
      `${this.apiUrl}/anon/model/paper/action/${essayId}/undo`,
      {},
      { headers: this.headers },
    );
  }

  /**
   * Redo the last undone action for the essay
   * POST /model-processor-service/api/anon/model/paper/action/${id}/redo
   */
  redoAction(essayId: string): Observable<UndoResponse> {
    return this.http.post<UndoResponse>(
      `${this.apiUrl}/anon/model/paper/action/${essayId}/redo`,
      {},
      { headers: this.headers },
    );
  }

  /**
   * Stream ModelCaseVO items via SSE using POST.
   * Endpoint: POST /anon/model/paper/sse/{essayId}/case
   * Emits parsed ModelCaseVO objects for event "case".
   * Auto-completes when a terminal message is received (index === -1 && state === 'DONE').
   */
  streamModelCases(essayId: string): Observable<Readonly<ModelCaseVO>> {
    return new Observable<Readonly<ModelCaseVO>>((subscriber) => {
      if (typeof window === "undefined") {
        subscriber.error(
          new Error("SSE is only supported in browser environment"),
        );
        return undefined;
      }

      const controller = new AbortController();
      const url = `${this.apiUrl}/anon/model/paper/sse/${encodeURIComponent(essayId)}/case`;

      const headers = new Headers({
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
      });

      let carry = "";
      let completed = false;

      (async () => {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `SSE request failed with status ${response.status}`,
            );
          }

          const body = response.body;
          if (!body) {
            throw new Error("SSE response has no body");
          }

          const reader = body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              break;
            }
            const text = decoder.decode(value, { stream: true });
            const parsed = parseSseStreamChunk(text, carry);
            carry = parsed.carry;
            for (const evt of parsed.events) {
              if (evt.event !== SseCaseEventName) {
                continue;
              }
              const vo = safeJsonParse<ModelCaseVO>(evt.data);
              if (!vo) {
                // Skip bad JSON but keep stream going (robustness requirement)
                continue;
              }
              subscriber.next(vo);
              if (isTerminalCase(vo)) {
                completed = true;
                controller.abort();
                subscriber.complete();
                return;
              }
            }
          }

          // If stream finishes without explicit terminal message, complete gracefully
          if (!completed) {
            subscriber.complete();
          }
        } catch (err) {
          if ((err as any)?.name === "AbortError") {
            // normal shutdown
            if (!completed) {
              subscriber.complete();
            }
            return;
          }
          subscriber.error(err);
        }
      })();

      return () => {
        controller.abort();
      };
    });
  }

  /**
   * Stream essay summary via SSE.
   * Endpoint: GET /anon/model/paper/sse/{essayId}/summary?caseIds=...&caseIds=...
   * Emits parsed SummarySseItem objects for event "summary" (or default "message").
   * Auto-completes when a terminal message is received (index === -1 && status === 'DONE').
   */
  streamSummary(
    essayId: string,
    caseIds: ReadonlyArray<string>,
  ): Observable<Readonly<SummarySseItem>> {
    return new Observable<Readonly<SummarySseItem>>((subscriber) => {
      if (typeof window === "undefined") {
        subscriber.error(
          new Error("SSE is only supported in browser environment"),
        );
        return undefined;
      }

      const controller = new AbortController();
      const query = (caseIds ?? [])
        .map((id) => `caseIds=${encodeURIComponent(id)}`)
        .join("&");
      const url = `${this.apiUrl}/anon/model/paper/sse/${encodeURIComponent(
        essayId,
      )}/summary${query ? `?${query}` : ""}`;

      const headers = new Headers({
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
      });

      let carry = "";
      let completed = false;

      (async () => {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `SSE request failed with status ${response.status}`,
            );
          }

          const body = response.body;
          if (!body) {
            throw new Error("SSE response has no body");
          }

          const reader = body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const parsed = parseSseStreamChunkAll(text, carry);
            carry = parsed.carry;

            for (const evt of parsed.events) {
              if (
                evt.event !== SseSummaryEventName &&
                evt.event !== "message"
              ) {
                continue;
              }

              const item = safeJsonParse<SummarySseItem>(evt.data);
              if (!item) continue;

              subscriber.next(item);

              // Use existing terminal condition logic from sse-util
              // Adapt minimal shape to ModelCaseVO for the check
              const terminalLike = {
                index: item.index,
                status: item.status,
              } as unknown as ModelCaseVO;
              if (isTerminalCase(terminalLike)) {
                completed = true;
                controller.abort();
                subscriber.complete();
                return;
              }
            }
          }

          if (!completed) {
            subscriber.complete();
          }
        } catch (err) {
          if ((err as any)?.name === "AbortError") {
            if (!completed) {
              subscriber.complete();
            }
            return;
          }
          subscriber.error(err);
        }
      })();

      return () => {
        controller.abort();
      };
    });
  }

  /**
   * Stream essay body via SSE.
   * Endpoint: GET /anon/model/paper/sse/{essayId}/body?wordCount=...
   * Emits parsed SummarySseItem objects for event "body" (or default "message").
   * Auto-completes when a terminal message is received (index === -1 && status === 'DONE').
   */
  streamBody(
    essayId: string,
    wordCount: number,
  ): Observable<Readonly<SummarySseItem>> {
    return new Observable<Readonly<SummarySseItem>>((subscriber) => {
      if (typeof window === "undefined") {
        subscriber.error(
          new Error("SSE is only supported in browser environment"),
        );
        return undefined;
      }

      const controller = new AbortController();
      const wc =
        Number.isFinite(wordCount) && wordCount > 0 ? String(wordCount) : "";
      const url = `${this.apiUrl}/anon/model/paper/sse/${encodeURIComponent(
        essayId,
      )}/body${wc ? `?wordCount=${encodeURIComponent(wc)}` : ""}`;

      const headers = new Headers({
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
      });

      let carry = "";
      let completed = false;

      (async () => {
        try {
          const response = await fetch(url, {
            method: "GET",
            headers,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `SSE request failed with status ${response.status}`,
            );
          }

          const body = response.body;
          if (!body) {
            throw new Error("SSE response has no body");
          }

          const reader = body.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const parsed = parseSseStreamChunkAll(text, carry);
            carry = parsed.carry;

            for (const evt of parsed.events) {
              if (evt.event !== "body" && evt.event !== "message") {
                continue;
              }

              const item = safeJsonParse<SummarySseItem>(evt.data);
              if (!item) continue;

              subscriber.next(item);

              const terminalLike = {
                index: item.index,
                status: item.status,
              } as unknown as ModelCaseVO;
              if (isTerminalCase(terminalLike)) {
                completed = true;
                controller.abort();
                subscriber.complete();
                return;
              }
            }
          }

          if (!completed) {
            subscriber.complete();
          }
        } catch (err) {
          if ((err as any)?.name === "AbortError") {
            if (!completed) {
              subscriber.complete();
            }
            return;
          }
          subscriber.error(err);
        }
      })();

      return () => {
        controller.abort();
      };
    });
  }
}
