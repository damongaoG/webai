import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  EMPTY,
  Observable,
  of,
  Subject,
  switchMap,
  timer,
  catchError,
} from "rxjs";
import { environment } from "@environment/environment";
import { ModelRequestDto } from "@/app/interfaces/model-request-dto";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Result } from "@/app/interfaces/result";
import { StartChatVo } from "@/app/interfaces/start-chat-vo";
import { ActivationCodeVo } from "@/app/interfaces/activation-code-vo";
import { SaveChatHistoryDto } from "@/app/interfaces/save-chat-history-dto";
import { PageListChatSessionVo } from "@/app/interfaces/page-list-chat-session-vo";
import { PageListChatHistoryVo } from "@/app/interfaces/page-list-chat-history-vo";
import { ChatWorkerService } from "@/app/services/chat-worker.service";

@Injectable({
  providedIn: "root",
})
export class ChatBotService {
  private apiUrl = environment.modelServiceUrl || "http://localhost:3000/api";
  headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  private stopStreamSubject = new Subject<void>();

  constructor(
    private http: HttpClient,
    private chatWorkerService: ChatWorkerService,
  ) {
    // Log worker support status
    console.log(
      "Web Worker support:",
      this.chatWorkerService.isSupported() ? "Available" : "Not available",
    );
  }

  // Main method to get model results with worker fallback
  public getModelResult(request: ModelRequestDto): Observable<any> {
    // Try to use the worker if supported
    if (this.chatWorkerService.isSupported()) {
      try {
        console.log("Using worker for model request");
        return this.chatWorkerService.getModelResult(request).pipe(
          catchError((error) => {
            console.error(
              "Worker request failed, falling back to direct implementation:",
              error,
            );
            // Fall back to the direct implementation
            return this.getModelResultDirect(request);
          }),
        );
      } catch (error) {
        console.error(
          "Worker setup failed, falling back to direct implementation:",
          error,
        );
        // Fall through to the direct implementation
      }
    }

    // Fall back to the original implementation
    console.log("Using direct implementation for model request");
    return this.getModelResultDirect(request);
  }

  // Direct implementation without worker
  private getModelResultDirect(request: ModelRequestDto): Observable<any> {
    return new Observable((observer) => {
      let controller: AbortController | null = null;
      const messageReceived = new Subject<void>();
      let lastMessageTime = Date.now();
      let isDone = false;

      try {
        controller = new AbortController();

        // Create timer to check for inactivity
        const inactivityCheck = timer(0, 1000)
          .pipe(
            switchMap(() => {
              // Only check if uncompleted
              if (!isDone) {
                const timeSinceLastMessage = Date.now() - lastMessageTime;
                if (timeSinceLastMessage > 15000) {
                  console.log(
                    "No new messages for 15 seconds, closing connection",
                  );
                  observer.error("Over Time");
                  observer.complete();
                  controller?.abort();
                  return EMPTY;
                }
              }
              return of(null);
            }),
          )
          .subscribe();

        // Subscribe to the stop stream subject
        const stopSubscription = this.stopStreamSubject.subscribe(() => {
          isDone = true;
          inactivityCheck.unsubscribe();
          observer.complete();
          controller?.abort();
        });

        fetchEventSource(`${this.apiUrl}/auth/model/action/completion`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: controller.signal,
          onmessage(event) {
            // If the stream is completed, set the flag and complete the observer
            if (event.data === "[DONE]") {
              console.log("Stream completed with [DONE]");
              isDone = true;
              inactivityCheck.unsubscribe();
              observer.complete();
              return;
            }
            // Update last message time
            lastMessageTime = Date.now();

            console.log("Received event data:", event.data);

            try {
              let data;
              // Handle data: prefix if present
              if (event.data.startsWith("data: ")) {
                const jsonStr = event.data.substring(6).trim();
                if (jsonStr) {
                  data = JSON.parse(jsonStr);
                  console.log("Parsed data with prefix:", data);
                }
              } else {
                data = JSON.parse(event.data);
                console.log("Parsed data without prefix:", data);
              }

              // Check for Connection reset error
              if (data?.error) {
                observer.error("Error");
                observer.complete();
                controller?.abort();
                return;
              }

              if (data) {
                observer.next(data);
              }
            } catch (error) {
              console.error(
                "Error parsing JSON:",
                error,
                "Raw data:",
                event.data,
              );
              observer.error(new Error("Invalid JSON response"));
            }
          },
          onclose() {
            console.log("Stream connection closed");
            inactivityCheck.unsubscribe();
            observer.complete();
          },
          onerror(error) {
            console.error("Stream error:", error);
            inactivityCheck.unsubscribe();
            observer.error(error);
          },
        });

        return () => {
          if (controller) {
            console.log("Cleaning up stream connection");
            inactivityCheck.unsubscribe();
            stopSubscription.unsubscribe();
            controller.abort();
          }
        };
      } catch (error) {
        console.error("Error in stream setup:", error);
        observer.error(error);
        return () => {
          if (controller) {
            controller.abort();
          }
        };
      }
    });
  }

  // Stop the current output stream
  public stopOutput(tag: string): Observable<Result<any>> {
    this.stopStreamSubject.next();
    return this.http.post<Result<any>>(
      `${this.apiUrl}/auth/model/action/stop`,
      { tag },
      { headers: this.headers },
    );
  }

  // Start a new chat session
  public startChat(): Observable<Result<StartChatVo>> {
    return this.http.post<Result<StartChatVo>>(
      `${this.apiUrl}/auth/chat/action/start`,
      {},
      { headers: this.headers },
    );
  }

  // Check chat status
  public checkChatStatus(): Observable<Result<ActivationCodeVo>> {
    return this.http.get<Result<ActivationCodeVo>>(
      `${this.apiUrl}/auth/chat/action/status`,
      { headers: this.headers },
    );
  }

  // Save chat history
  public saveChatHistory(
    chatHistory: Array<SaveChatHistoryDto>,
  ): Observable<Result<any>> {
    return this.http.post<Result<any>>(
      `${this.apiUrl}/auth/chat/action/save`,
      chatHistory,
      { headers: this.headers },
    );
  }

  // List chat history with pagination
  public listChatHistory(
    tag: number,
    page: number,
    pageSize: number,
  ): Observable<Result<PageListChatHistoryVo>> {
    return this.http.get<Result<PageListChatHistoryVo>>(
      `${this.apiUrl}/auth/chat/action/list?tag=${tag}&page=${page}&size=${pageSize}`,
      { headers: this.headers },
    );
  }

  // Get chat history by session ID
  public listChatHistoryById(
    sessionId: string,
  ): Observable<Result<PageListChatSessionVo>> {
    return this.http.get<Result<PageListChatSessionVo>>(
      `${this.apiUrl}/auth/chat/action/list/${sessionId}`,
      { headers: this.headers },
    );
  }

  // Get stop stream subject for external control
  public getStopStreamSubject(): Subject<void> {
    return this.stopStreamSubject;
  }

  // Trigger stop stream
  public triggerStopStream(): void {
    this.stopStreamSubject.next();
  }
}
