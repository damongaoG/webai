import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ChatEventsService {
  private readonly saveAndClearSubject = new Subject<void>();
  private readonly saveHistorySubject = new Subject<void>();
  private readonly showChatHistorySubject = new BehaviorSubject<boolean>(true);
  private readonly loadMoreHistorySubject = new Subject<void>();

  saveAndClear$ = this.saveAndClearSubject.asObservable();
  saveHistory$ = this.saveHistorySubject.asObservable();
  showChatHistory$ = this.showChatHistorySubject.asObservable();
  loadMoreHistory$ = this.loadMoreHistorySubject.asObservable();

  triggerClearChat(): void {
    this.saveAndClearSubject.next();
  }

  triggerSaveHistory(): void {
    this.saveHistorySubject.next();
  }

  setShowChatHistory(show: boolean): void {
    this.showChatHistorySubject.next(show);
  }

  triggerLoadMoreHistory(): void {
    this.loadMoreHistorySubject.next();
  }
} 