import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject, catchError, throwError } from "rxjs";
import { Result } from "@/app/interfaces/result";
import { PageListChatHistoryVo } from "@/app/interfaces/page-list-chat-history-vo";
import { PageListChatSessionVo } from "@/app/interfaces/page-list-chat-session-vo";
import { ActivationCodeVo } from "@/app/interfaces/activation-code-vo";
import { StartChatVo } from "@/app/interfaces/start-chat-vo";
import { ModelRequestDto } from "@/app/interfaces/model-request-dto";
import { SaveChatHistoryDto } from "@/app/interfaces/save-chat-history-dto";

@Injectable({
  providedIn: "root",
})
export class ChatBotService {
  // API URL for the model service
  private apiUrl = "/model-service/api";

  // HTTP headers
  headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  // Subject for stopping output stream
  private stopStreamSubject = new Subject<void>();

  constructor(private http: HttpClient) {}

  // Get model result with streaming response
  public getModelResult(request: ModelRequestDto): Observable<any> {
    // Create a unique tag for this request
    const tag = `${request.tag}_${Date.now()}`;

    // Return an observable that handles the streaming response
    return new Observable((observer) => {
      const eventSource = new EventSource(
        `${this.apiUrl}/auth/model/action/chat?tag=${tag}`,
      );

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          observer.next(data);

          // If we get a complete response, close the connection
          if (
            data.choices &&
            data.choices.length > 0 &&
            data.choices[0].delta &&
            data.choices[0].delta.content === "[DONE]"
          ) {
            eventSource.close();
            observer.complete();
          }
        } catch (error) {
          observer.error(error);
        }
      };

      // Handle connection open
      eventSource.onopen = () => {
        // Send the actual request
        this.http
          .post(`${this.apiUrl}/auth/model/action/completion`, request, {
            headers: this.headers,
          })
          .subscribe({
            error: (err) => {
              eventSource.close();
              observer.error(err);
            },
          });
      };

      // Handle connection close
      eventSource.addEventListener("close", () => {
        observer.complete();
      });

      // Handle errors
      eventSource.onerror = (error) => {
        eventSource.close();
        observer.error(error);
      };

      // Return teardown logic for the Observable
      return () => {
        eventSource.close();
        this.stopOutput(tag).subscribe();
      };
    });
  }

  // Stop the output stream
  public stopOutput(tag: string): Observable<Result<any>> {
    return this.http
      .post<
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
