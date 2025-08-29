import { Injectable } from "@angular/core";
import { Observable, Subject, throwError } from "rxjs";
import { ModelRequestDto } from "../interfaces/model-request-dto";
import { v4 as uuidv4 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class ChatWorkerService {
  private worker: Worker | null = null;
  private responseSubjects: Map<string, Subject<any>> = new Map();
  private isWorkerSupported: boolean = false;

  constructor() {
    // Check if Web Workers are supported
    this.isWorkerSupported = typeof Worker !== "undefined";

    if (this.isWorkerSupported) {
      try {
        // Create the worker
        this.worker = new Worker(
          new URL("../workers/chat-api.worker.ts", import.meta.url),
        );

        // Set up message handler
        this.worker.onmessage = ({ data }) => {
          const { type, requestId, data: responseData, error } = data;

          // Get the subject for this request
          const subject = this.responseSubjects.get(requestId);
          if (!subject) return;

          switch (type) {
            case "MODEL_DATA":
              subject.next(responseData);
              break;
            case "MODEL_ERROR":
              subject.error(error);
              this.responseSubjects.delete(requestId);
              break;
            case "MODEL_COMPLETE":
              subject.complete();
              this.responseSubjects.delete(requestId);
              break;
            case "STOP_COMPLETE":
              // Handle stop completion if needed
              break;
          }
        };

        // Handle worker errors
        this.worker.onerror = (event) => {
          console.error("Worker global error:", event);
          this.isWorkerSupported = false;

          // Notify all pending requests about the error
          this.responseSubjects.forEach((subject) => {
            subject.error("Worker failed: " + event.message);
          });
          this.responseSubjects.clear();
        };

        console.log("Chat worker initialized successfully");
      } catch (error) {
        console.error("Failed to initialize chat worker:", error);
        this.isWorkerSupported = false;
      }
    } else {
      console.warn("Web Workers are not supported in this browser");
    }
  }

  public isSupported(): boolean {
    return this.isWorkerSupported && this.worker !== null;
  }

  public getModelResult(request: ModelRequestDto): Observable<any> {
    if (!this.isSupported()) {
      return throwError(() => new Error("Web Workers are not supported"));
    }

    // Create a unique ID for this request
    const requestId = `tag_${request.tag}_${uuidv4()}`;

    // Create a subject to handle the response
    const subject = new Subject<any>();
    this.responseSubjects.set(requestId, subject);

    // Send the request to the worker
    this.worker!.postMessage({
      type: "MODEL_REQUEST",
      requestId,
      payload: {
        apiUrl: "/model-service",
        modelRequest: request,
      },
    });

    return subject.asObservable();
  }

  public stopOutput(tag: string): void {
    if (!this.isSupported()) {
      return;
    }

    this.worker!.postMessage({
      type: "STOP_REQUEST",
      payload: { tag },
    });
  }
}
