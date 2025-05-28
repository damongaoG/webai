import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatEventsService {
  private readonly saveAndClearSubject = new Subject<void>();
  private readonly saveHistorySubject = new Subject<void>();
  private readonly showChatHistorySubject = new BehaviorSubject<boolean>(true);
  private readonly loadMoreHistorySubject = new Subject<void>();
  private readonly clearChatSubject = new Subject<void>();

  // Observable streams
  saveAndClear$ = this.saveAndClearSubject.asObservable();
  saveHistory$ = this.saveHistorySubject.asObservable();
  showChatHistory$ = this.showChatHistorySubject.asObservable();
  loadMoreHistory$ = this.loadMoreHistorySubject.asObservable();
  clearChat$ = this.clearChatSubject.asObservable();

  // Trigger a clear chat event
  triggerClearChat(): void {
    this.clearChatSubject.next();
  }

  // Trigger a save and clear event
  triggerSaveAndClear(): void {
    this.saveAndClearSubject.next();
  }

  // Trigger a save history event
  triggerSaveHistory(): void {
    this.saveHistorySubject.next();
  }

  // Set the chat history visibility
  setShowChatHistory(show: boolean): void {
    this.showChatHistorySubject.next(show);
  }

  // Trigger a load more history event
  triggerLoadMoreHistory(): void {
    this.loadMoreHistorySubject.next();
  }
} 