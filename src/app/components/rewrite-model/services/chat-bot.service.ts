import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { Result } from "@/app/interfaces/result";
import { PageListChatHistoryVo } from "@/app/interfaces/page-list-chat-history-vo";
import { PageListChatSessionVo } from "@/app/interfaces/page-list-chat-session-vo";
import { ActivationCodeVo } from "@/app/interfaces/activation-code-vo";
import { StartChatVo } from "@/app/interfaces/start-chat-vo";
import { ModelRequestDto } from "@/app/interfaces/model-request-dto";
import { SaveChatHistoryDto } from "@/app/interfaces/save-chat-history-dto";

// Interface for streaming response data
interface StreamingResponse {
  content?: string;
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  [key: string]: any;
}

@Injectable({
  providedIn: "root",
})
export class ChatBotService {
  // API URL for the model service
  private readonly apiUrl = "/model-service/api";

  // HTTP headers for regular requests
  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  // Subject for stopping output stream
  constructor(private readonly http: HttpClient) {}

  // Get model result with streaming response
  public getModelResult(
    request: ModelRequestDto,
  ): Observable<StreamingResponse> {
    // Create a unique tag for this request
    const tag = `${request.tag}_${Date.now()}`;

    // Return an observable that handles the streaming response
    return new Observable<StreamingResponse>((observer) => {
      let abortController: AbortController | null = null;
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      // Start the streaming request
      const startStreaming = async (): Promise<void> => {
        try {
          // Create abort controller for cancellation
          abortController = new AbortController();

          // Send POST request with streaming enabled
          const response = await fetch(
            `${this.apiUrl}/auth/model/action/completion`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "text/event-stream",
                "Cache-Control": "no-cache",
              },
              body: JSON.stringify(request),
              signal: abortController.signal,
            },
          );

          // Check if response is ok
          if (!response.ok) {
            throw new Error(
              `HTTP error! status: ${response.status} - ${response.statusText}`,
            );
          }

          // Check if response body exists
          if (!response.body) {
            throw new Error("Response body is null");
          }

          // Get the reader from response stream
          reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let buffer = "";

          // Process the stream
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Process any remaining buffer content
              if (buffer.trim()) {
                this.processBufferContent(buffer, observer);
              }
              observer.complete();
              break;
            }

            // Decode the chunk and add to buffer
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Process complete lines from buffer
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            // Process each complete line
            for (const line of lines) {
              this.processStreamLine(line, observer);
            }
          }
        } catch (error) {
          this.handleStreamError(error, observer);
        } finally {
          await this.cleanupStreamResources(reader);
        }
      };

      // Start the streaming process
      startStreaming();

      // Return cleanup function
      return () => {
        this.cleanup(abortController, reader, tag);
      };
    });
  }

  private processStreamLine(line: string, observer: any): void {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith(":")) {
      return;
    }

    // Parse data lines
    if (trimmedLine.startsWith("data: ")) {
      const dataContent = trimmedLine.slice(6); // Remove 'data: '

      // Check for completion signal
      if (!dataContent || dataContent === "[DONE]") {
        observer.complete();
        return;
      }

      this.parseAndEmitData(dataContent, observer);
    }
  }

  private processBufferContent(buffer: string, observer: any): void {
    const lines = buffer.split("\n");
    for (const line of lines) {
      this.processStreamLine(line, observer);
    }
  }

  private parseAndEmitData(dataContent: string, observer: any): void {
    try {
      // Attempt to parse as JSON
      const parsedData = JSON.parse(dataContent);
      observer.next(parsedData);
    } catch (parseError) {
      // If parsing fails, emit as plain text content
      observer.next({ content: dataContent });
    }
  }

  private handleStreamError(error: unknown, observer: any): void {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        // Request was cancelled, complete
        observer.complete();
      } else {
        observer.error(new Error(`Streaming error: ${error.message}`));
      }
    } else {
      observer.error(new Error("Unknown streaming error"));
    }
  }

  private async cleanupStreamResources(
    reader: ReadableStreamDefaultReader<Uint8Array> | null,
  ): Promise<void> {
    if (reader) {
      try {
        await reader.cancel();
      } catch (e) {
        console.log("Error during stream cleanup:", e);
      }
    }
  }

  private cleanup(
    abortController: AbortController | null,
    reader: ReadableStreamDefaultReader<Uint8Array> | null,
    tag: string,
  ): void {
    // Abort the fetch request
    if (abortController) {
      abortController.abort();
    }

    // Cancel the stream reader
    if (reader) {
      reader.cancel().catch((error) => {
        console.warn("Error cancelling stream reader:", error);
      });
    }

    // Stop the output
    this.stopOutput(tag).subscribe({
      error: (error) => {
        console.warn("Error stopping server output:", error);
      },
    });
  }

  // Stop the output stream
  public stopOutput(tag: string): Observable<Result<any>> {
    return this.http
      .patch<
        Result<any>
      >(`${this.apiUrl}/auth/model/action/stop?tag=${tag}`, {}, { headers: this.headers })
      .pipe(catchError((error) => throwError(() => error)));
  }

  // Start chat session
  public startChat(): Observable<Result<StartChatVo>> {
    return this.http.post<Result<StartChatVo>>(
      `${this.apiUrl}/auth/model/action/chat`,
      {},
      { headers: this.headers },
    );
  }

  // Check chat status
  public checkChatStatus(): Observable<Result<ActivationCodeVo>> {
    return this.http.post<Result<ActivationCodeVo>>(
      `${this.apiUrl}/auth/model/action/check-chat`,
      {},
      { headers: this.headers },
    );
  }

  // Save chat history
  public saveChatHistory(
    chatHistory: Array<SaveChatHistoryDto>,
  ): Observable<Result<any>> {
    return this.http.post<Result<any>>(
      `${this.apiUrl}/auth/model/entity/chat`,
      chatHistory,
      { headers: this.headers },
    );
  }

  // List chat history
  public listChatHistory(
    tag: number,
    page: number,
    pageSize: number,
  ): Observable<Result<PageListChatHistoryVo>> {
    return this.http.get<Result<PageListChatHistoryVo>>(
      `${this.apiUrl}/auth/model/entity/chat-group?tag=${tag}&page=${page}&size=${pageSize}`,
      { headers: this.headers },
    );
  }

  // List chat history by session ID
  public listChatHistoryById(
    sessionId: string,
  ): Observable<Result<PageListChatSessionVo>> {
    return this.http.get<Result<PageListChatSessionVo>>(
      `${this.apiUrl}/auth/model/entity/chat?sessionId=${sessionId}`,
      { headers: this.headers },
    );
  }
}
