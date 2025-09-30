import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { environment } from "@environment/environment";
import {
  CreateEssayDto,
  CreateEssayResponse,
  KeywordsResponse,
  ArgumentsResponse,
  ScholarsResponse,
  UndoResponse,
} from "../interfaces/essay-create.interface";
import { parseSseStreamChunkAll, safeJsonParse } from "../helper/sse-parser";
import { isTerminalCase } from "../helper/sse-util";
import {
  SseCaseEventName,
  type ModelCaseVO,
} from "../interfaces/model-case.interface";
import {
  SseSummaryEventName,
  type SummarySseItem,
} from "../interfaces/summary-sse.interface";
import { ToastService } from "../shared";

@Injectable({
  providedIn: "root",
})
export class EssayService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.modelProcessorServiceUrl;
  private readonly toastService = inject(ToastService);

  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  // Shared SSE headers (GET only)
  private createSseHeaders(): Headers {
    return new Headers({
      Accept: "text/event-stream, application/json",
    });
  }

  /**
   * Generic SSE streaming helper to eliminate duplication across SSE endpoints.
   * - Parses incremental chunks using parseSseStreamChunkAll
   * - Filters by event names
   * - Parses JSON per event and emits typed items
   * - Completes early when terminal predicate returns true
   */
  private streamSse<T>(
    url: string,
    validEventNames: ReadonlyArray<string>,
    parseItem: (data: string) => T | undefined,
    isTerminal: (item: T) => boolean,
    fetchInit?: RequestInit,
    onJsonResponse?: (json: any) => Error | undefined,
  ): Observable<Readonly<T>> {
    return new Observable<Readonly<T>>((subscriber) => {
      if (typeof window === "undefined") {
        subscriber.error(
          new Error("SSE is only supported in browser environment"),
        );
        return undefined;
      }

      const controller = new AbortController();
      // Merge default SSE headers with any provided headers
      const defaultHeaders = this.createSseHeaders();
      if (fetchInit?.headers) {
        const extra = new Headers(fetchInit.headers as HeadersInit);
        extra.forEach((value, key) => defaultHeaders.set(key, value));
      }

      let carry = "";
      let completed = false;

      (async () => {
        try {
          const response = await fetch(url, {
            method: fetchInit?.method ?? "GET",
            ...(fetchInit ?? {}),
            headers: defaultHeaders,
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `SSE request failed with status ${response.status}`,
            );
          }

          // If server responded with JSON (non-SSE), allow optional handler
          const contentType = response.headers?.get("content-type") ?? "";
          if (contentType.includes("application/json")) {
            try {
              const json = await (response as any).json();
              const maybeErr = onJsonResponse?.(json);
              if (maybeErr) {
                subscriber.error(maybeErr);
              } else {
                subscriber.complete();
              }
            } catch (e) {
              subscriber.error(e);
            }
            return;
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
              if (!validEventNames.includes(evt.event)) continue;
              const item = parseItem(evt.data);
              if (!item) continue;

              subscriber.next(item);
              if (isTerminal(item)) {
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
   * Stream ModelCaseVO items via SSE using GET.
   * Endpoint: GET /anon/model/paper/sse/{essayId}/case
   * Emits parsed ModelCaseVO objects for event "case" (or default "message").
   * Auto-completes when a terminal message is received (index === -1 && status === 'DONE').
   */
  streamModelCases(essayId: string): Observable<Readonly<ModelCaseVO>> {
    const url = `${this.apiUrl}/anon/model/paper/sse/${encodeURIComponent(essayId)}/case`;
    return this.streamSse<ModelCaseVO>(
      url,
      [SseCaseEventName, "message"],
      (data) => safeJsonParse<ModelCaseVO>(data),
      (item) => isTerminalCase(item),
    );
  }

  /**
   * Stream essay summary via SSE.
   * Endpoint: GET /anon/model/paper/sse/{essayId}/summary?caseIds=...&caseIds=...
   * Emits parsed SummarySseItem objects for event "summary" (or default "message").
   * Auto-completes when a terminal message is received (index === -1 && status === 'DONE').
   */
  streamSummary(
    essayId: string,
    selections: ReadonlyArray<{ caseId: string; resultIds: string[] }>,
  ): Observable<Readonly<SummarySseItem>> {
    const url = `${this.apiUrl}/anon/model/paper/sse/${encodeURIComponent(
      essayId,
    )}/summary`;

    return this.streamSse<SummarySseItem>(
      url,
      [SseSummaryEventName, "message"],
      (data) => safeJsonParse<SummarySseItem>(data),
      (item) =>
        isTerminalCase({
          index: item.index,
          status: item.status,
        } as unknown as ModelCaseVO),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/json",
        },
        body: JSON.stringify(
          (selections ?? []).map((s) => ({
            caseId: s.caseId,
            resultIds: s.resultIds,
          })),
        ),
      },
    ).pipe(
      tap((item) => {
        const isTerminalError =
          item && item.index === -1 && String(item.status).toUpperCase() === "ERROR";
        if (isTerminalError) {
          // Notify user that summary generation failed; do not alter stream control flow
          this.toastService.error("Generate summary failed. Please try again.");
        }
      }),
    );
  }

  /**
   * Stream essay body via SSE.
   * Endpoint: POST /anon/model/paper/sse/{essayId}/body
   * Emits parsed SummarySseItem objects for event "body" (or default "message").
   * Auto-completes when a terminal message is received (index === -1 && status === 'DONE').
   */
  streamBody(
    essayId: string,
    wordCount: number,
  ): Observable<Readonly<SummarySseItem>> {
    const sanitized =
      Number.isFinite(wordCount) && wordCount > 0
        ? Math.floor(wordCount)
        : undefined;
    const url = `${this.apiUrl}/anon/model/paper/sse/${encodeURIComponent(
      essayId,
    )}/body`;

    return this.streamSse<SummarySseItem>(
      url,
      ["body", "message"],
      (data) => safeJsonParse<SummarySseItem>(data),
      (item) =>
        isTerminalCase({
          index: item.index,
          status: item.status,
        } as unknown as ModelCaseVO),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/json",
        },
        body: JSON.stringify(sanitized ? { wordCount: sanitized } : {}),
      },
      (json) => {
        // When server responds JSON instead of SSE, treat code !== 1 as failure
        try {
          const code =
            json && typeof json === "object" && "code" in json
              ? Number((json as any).code)
              : NaN;
          if (!Number.isFinite(code) || code !== 1) {
            this.toastService.error(
              "Failed to generate essay. Please try again.",
            );
            return new Error("Essay generation failed (non-success code)");
          }
          // code === 1 -> consider it a success without streaming content
          return undefined;
        } catch {
          this.toastService.error(
            "Failed to generate essay. Please try again.",
          );
          return new Error("Essay generation failed (invalid JSON)");
        }
      },
    );
  }
}
