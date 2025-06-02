import { inject, Injectable } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  retry,
  timer,
} from "rxjs";
import { finalize } from "rxjs/operators";
import { ChatBotService } from "./chat-bot.service";
import { MessageService } from "@/app/shared";
import { Result } from "@/app/interfaces/result";
import { ActivationCodeVo } from "@/app/interfaces/activation-code-vo";

export interface ChatStatusState {
  isAvailable: boolean;
  isChecking: boolean;
  lastCheckTime: Date | null;
  error: string | null;
  code: number | null;
  data: any;
}

@Injectable({
  providedIn: "root",
})
export class ChatStatusService {
  private readonly statusSubject = new BehaviorSubject<ChatStatusState>({
    isAvailable: false,
    isChecking: false,
    lastCheckTime: null,
    error: null,
    code: null,
    data: null,
  });

  private readonly retryAttempts = 3;
  private readonly retryDelayMs = 2000;

  private chatBotService = inject(ChatBotService);
  private messageService = inject(MessageService);

  get status$(): Observable<ChatStatusState> {
    return this.statusSubject.asObservable();
  }

  get currentStatus(): ChatStatusState {
    return this.statusSubject.value;
  }

  get isAvailable(): boolean {
    return this.currentStatus.isAvailable;
  }

  get isChecking(): boolean {
    return this.currentStatus.isChecking;
  }

  checkChatStatus(): Observable<Result<ActivationCodeVo>> {
    this.updateStatus({
      isChecking: true,
      error: null,
    });

    return this.chatBotService.checkChatStatus().pipe(
      map((result: Result<ActivationCodeVo>) => {
        this.handleStatusResult(result);
        return result;
      }),
      retry({
        count: this.retryAttempts,
        delay: (error, retryCount) => {
          console.warn("Chat status check failed", error);
          return timer(this.retryDelayMs * retryCount);
        },
      }),
      catchError((error) => {
        this.handleStatusError(error);
        return of({
          code: -1,
          timestamp: Date.now(),
          data: undefined,
          error: {
            message: "Connection failed",
            extra: { code: -1 },
          },
        } as Result<ActivationCodeVo>);
      }),
      finalize(() => {
        this.updateStatus({
          isChecking: false,
          lastCheckTime: new Date(),
        });
      }),
    );
  }

  refreshStatus(): Observable<Result<ActivationCodeVo>> {
    return this.checkChatStatus();
  }

  resetStatus(): void {
    this.statusSubject.next({
      isAvailable: false,
      isChecking: false,
      lastCheckTime: null,
      error: null,
      code: null,
      data: null,
    });
  }

  private handleStatusResult(result: Result<ActivationCodeVo>): void {
    const isAvailable = result.code === 1;

    this.updateStatus({
      isAvailable,
      code: result.code,
      data: result.data,
      error: isAvailable
        ? null
        : this.getErrorMessage(result.code, result.error?.message),
    });

    if (!isAvailable) {
      this.showUserFeedback(result.code, result.error?.message);
    }
  }

  private handleStatusError(error: any): void {
    const errorMessage = error?.message || "Failed";

    this.updateStatus({
      isAvailable: false,
      error: errorMessage,
      code: -1,
    });

    this.messageService.error("Failed to check chat status. Please try again.");
  }

  private updateStatus(partial: Partial<ChatStatusState>): void {
    const currentStatus = this.statusSubject.value;
    this.statusSubject.next({
      ...currentStatus,
      ...partial,
    });
  }

  private getErrorMessage(code: number, message?: string): string {
    switch (code) {
      case 0:
        return "Chat service is not available";
      case -2:
        return "Activation code already used on another device";
      case -11:
        return "No activation code available";
      case -6:
        return "Activation code is being used";
      default:
        return message || "Unknown error occurred";
    }
  }

  private showUserFeedback(code: number, message?: string): void {
    switch (code) {
      case -2:
        this.messageService.error(
          "Your activation code has already been used on another device.",
        );
        break;
      case -11:
        this.messageService.error(
          "Your account has no activation code, please contact us to purchase",
        );
        break;
      case -6:
        this.messageService.info("The activation code is being used");
        break;
      case 0:
        // No message for code 0, just show start chat button
        break;
      default:
        if (message) {
          this.messageService.error(message);
        }
        break;
    }
  }
}
