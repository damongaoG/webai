import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { ListChatHistoryDto } from "../../../interfaces/list-chat-history-dto";
import { ChatBotService } from "./chat-bot.service";
import { ChatMessage, ChatData } from "../../../interfaces/chat-dto";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  // Subjects for reactive state management
  private clearMessagesSubject = new Subject<void>();
  private tabChangeSubject = new Subject<number>();
  private chatHistorySubject = new BehaviorSubject<ListChatHistoryDto[]>([]);
  private saveHistorySubject = new Subject<void>();
  private chatMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private sessionIdSubject = new BehaviorSubject<string | null>(null);
  private unsavedMessagesSubject = new BehaviorSubject<{
    [key: number]: ChatMessage[];
  }>({ 0: [], 1: [], 2: [] });

  // Current active tab
  private currentTabIndex = 2;

  // Observable streams
  tabChange$ = this.tabChangeSubject.asObservable();
  chatHistory$ = this.chatHistorySubject.asObservable();
  chatMessages$ = this.chatMessagesSubject.asObservable();
  sessionId$ = this.sessionIdSubject.asObservable();

  // Mobile state
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  isMobile$ = this.isMobileSubject.asObservable();

  // Chat state tracking
  private _startChatResult: any | null = null;
  private _chatStatusResult: any | null = null;

  // Time expiration tracking
  private timeexpiredSubject = new BehaviorSubject<boolean>(true);

  constructor(private chatBotService: ChatBotService) {}

  // Chat status setter
  set chatStatusResult(result: any | null) {
    this._chatStatusResult = result;
  }

  // Tab change handler
  onTabChange(index: number): void {
    this.currentTabIndex = index;
    this.tabChangeSubject.next(index);
  }

  // Set mobile state
  setIsMobile(isMobile: boolean): void {
    this.isMobileSubject.next(isMobile);
  }

  // Update chat history
  updateChatHistory(history: ListChatHistoryDto[]): void {
    this.chatHistorySubject.next(history);
  }

  // Update chat messages
  updateChatMessages(
    messages: ChatMessage[],
    isHistory: boolean = false,
  ): void {
    this.chatMessagesSubject.next(messages);
  }

  // Get chat data from session storage
  getChatDataFromSession(): Promise<Record<number, ChatData> | null> {
    return Promise.resolve(null);
  }

  // Update session ID
  updateSessionId(sessionId: string | null): void {
    this.sessionIdSubject.next(sessionId);
  }

  // Add unsaved message
  addUnsavedMessage(message: ChatMessage, tag: number) {
    const currentMessages = this.unsavedMessagesSubject.getValue();
    currentMessages[tag] = [...(currentMessages[tag] || []), message];
    this.unsavedMessagesSubject.next(currentMessages);
  }

  // Clear unsaved messages
  clearUnsavedMessages() {
    this.unsavedMessagesSubject.next({ 0: [], 1: [], 2: [] });
  }

  // Check if there are unsaved messages
  hasUnsavedMessages(): boolean {
    const messages = this.unsavedMessagesSubject.getValue();
    return Object.values(messages).some((msgs) => msgs.length > 0);
  }

  // Get unsaved messages
  getUnsavedMessages() {
    return this.unsavedMessagesSubject.getValue();
  }

  // Set time expired state
  setTimeExpired(expired: boolean) {
    this.timeexpiredSubject.next(expired);
  }

  // Get time expired state
  getTimeExpired(): boolean {
    return this.timeexpiredSubject.getValue();
  }
}
