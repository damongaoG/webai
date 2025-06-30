import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { ListChatSessionVo } from "@/app/interfaces/list-chat-session-vo";

// Interface for current session state
interface SessionState {
  sessionId: string | null;
  messages: ListChatSessionVo[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: "root",
})
export class ChatSessionStateService {
  // Initial state
  private readonly initialState: SessionState = {
    sessionId: null,
    messages: [],
    loading: false,
    error: null,
  };

  // State subject
  private readonly sessionState$ = new BehaviorSubject<SessionState>(
    this.initialState,
  );

  // Public observables
  public readonly currentSession$: Observable<SessionState> =
    this.sessionState$.asObservable();

  // Set loading state
  public setLoading(loading: boolean): void {
    this.sessionState$.next({
      ...this.sessionState$.value,
      loading,
    });
  }

  // Set session data
  public setSession(sessionId: string, messages: ListChatSessionVo[]): void {
    this.sessionState$.next({
      sessionId,
      messages,
      loading: false,
      error: null,
    });
  }

  // Set error state
  public setError(error: string): void {
    this.sessionState$.next({
      ...this.sessionState$.value,
      loading: false,
      error,
    });
  }

  // Clear session
  public clearSession(): void {
    this.sessionState$.next(this.initialState);
  }

  // Start new chat session
  public startNewSession(): void {
    this.clearSession();
  }
}
