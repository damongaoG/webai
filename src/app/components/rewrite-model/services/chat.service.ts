import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { ListChatHistoryDto } from "@/app/interfaces/list-chat-history-dto";
import { ChatMessage } from "@/app/interfaces/chat-dto";
import { ChatBotService } from "./chat-bot.service";
import { Result } from "@/app/interfaces/result";
import { PageListChatHistoryVo } from "@/app/interfaces/page-list-chat-history-vo";
import { PageListChatSessionVo } from "@/app/interfaces/page-list-chat-session-vo";

interface ChatResult {
  code: number;
  data?: any;
}

interface ChatData {
  messages: ChatMessage[];
  tag: number;
  sessionId: string;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private clearMessagesSubject = new Subject<void>();
  private tabChangeSubject = new Subject<number>();
  private chatHistorySubject = new BehaviorSubject<ListChatHistoryDto[]>([]);
  private saveHistorySubject = new Subject<void>();
  private chatMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private sessionIdSubject = new BehaviorSubject<string | null>(null);
  private unsavedMessagesSubject = new BehaviorSubject<{
    [key: string]: ChatMessage[];
  }>({ 0: [], 1: [], 2: [] });
  private currentTabIndex = 2; // Default to rewrite tab

  // Observable streams
  tabChange$ = this.tabChangeSubject.asObservable();
  chatHistory$ = this.chatHistorySubject.asObservable();
  chatMessages$ = this.chatMessagesSubject.asObservable();
  sessionId$ = this.sessionIdSubject.asObservable();

  private isMobileSubject = new BehaviorSubject<boolean>(false);
  isMobile$ = this.isMobileSubject.asObservable();

  private _startChatResult: ChatResult | null = null;
  private _chatStatusResult: ChatResult | null = null;

  private timeexpiredSubject = new BehaviorSubject<boolean>(true);

  constructor(private chatBotService: ChatBotService) {}

  // Getters and setters
  set chatStatusResult(result: ChatResult | null) {
    this._chatStatusResult = result;
  }

  get chatStatusResult(): ChatResult | null {
    return this._chatStatusResult;
  }

  set startChatResult(result: ChatResult | null) {
    this._startChatResult = result;
  }

  get startChatResult(): ChatResult | null {
    return this._startChatResult;
  }

  // Tab management
  onTabChange(index: number): void {
    this.currentTabIndex = index;
    this.tabChangeSubject.next(index);
  }

  getCurrentTabIndex(): number {
    return this.currentTabIndex;
  }

  // Mobile state management
  setIsMobile(isMobile: boolean): void {
    this.isMobileSubject.next(isMobile);
  }

  // Chat history management
  updateChatHistory(history: ListChatHistoryDto[]): void {
    this.chatHistorySubject.next(history);
  }

  getChatHistory(): ListChatHistoryDto[] {
    return this.chatHistorySubject.value;
  }

  // Chat messages management
  updateChatMessages(
    messages: ChatMessage[],
    isHistory: boolean = false,
  ): void {
    if (!isHistory) {
      this.chatMessagesSubject.next(messages);
    } else {
      // Special handling for historical messages
      const filtered = messages.filter((msg) => !msg.isFromHistory);
      this.chatMessagesSubject.next(filtered);
    }
  }

  getChatMessages(): ChatMessage[] {
    return this.chatMessagesSubject.value;
  }

  // Session management
  updateSessionId(sessionId: string | null): void {
    this.sessionIdSubject.next(sessionId);
  }

  getCurrentSessionId(): string | null {
    return this.sessionIdSubject.value;
  }

  // Get chat data from session
  getChatDataFromSession(): Promise<Record<number, ChatData> | null> {
    return new Promise((resolve) => {
      this.chatBotService
        .listChatHistory(this.currentTabIndex, 0, 10)
        .subscribe({
          next: (res: Result<PageListChatHistoryVo>) => {
            if (res.code === 1 && res.data?.content) {
              const firstChat = res.data?.content[0];
              if (!firstChat?.sessionId) {
                resolve(null);
                return;
              }
              this.chatBotService
                .listChatHistoryById(firstChat.sessionId)
                .subscribe({
                  next: (historyRes: Result<PageListChatSessionVo>) => {
                    if (historyRes.code === 1 && historyRes.data?.content) {
                      // Convert the API data to the required format
                      const chatData: Record<number, ChatData> = {
                        0: {
                          messages: [],
                          tag: 0,
                          sessionId: firstChat.sessionId,
                        },
                        1: {
                          messages: [],
                          tag: 1,
                          sessionId: firstChat.sessionId,
                        },
                        2: {
                          messages: [],
                          tag: 2,
                          sessionId: firstChat.sessionId,
                        },
                      };

                      // Add history messages to the corresponding tag category
                      historyRes.data.content.forEach((msg) => {
                        if (msg.tag !== undefined && msg.content) {
                          chatData[msg.tag].messages.push({
                            role: msg.role || "assistant",
                            content: msg.content,
                            isUser: msg.role === "user",
                            tag: msg.tag,
                          });
                        }
                      });

                      // Update sessionId
                      this.updateSessionId(firstChat.sessionId);

                      resolve(chatData);
                    } else {
                      resolve(null);
                    }
                  },
                  error: () => resolve(null),
                });
            } else {
              resolve(null);
            }
          },
          error: () => resolve(null),
        });
    });
  }

  // Unsaved messages management
  addUnsavedMessage(message: ChatMessage, tag: number): void {
    const currentMessages = this.unsavedMessagesSubject.value;
    if (!currentMessages[tag]) {
      currentMessages[tag] = [];
    }
    currentMessages[tag].push(message);
    this.unsavedMessagesSubject.next(currentMessages);
  }

  clearUnsavedMessages(): void {
    this.unsavedMessagesSubject.next({ 0: [], 1: [], 2: [] });
  }

  hasUnsavedMessages(): boolean {
    const messages = this.unsavedMessagesSubject.value;
    return Object.values(messages).some((msgs) => msgs.length > 0);
  }

  getUnsavedMessages(): { [key: string]: ChatMessage[] } {
    return this.unsavedMessagesSubject.value;
  }

  // Time expiration management
  setTimeExpired(expired: boolean): void {
    this.timeexpiredSubject.next(expired);
  }

  getTimeExpired(): boolean {
    return this.timeexpiredSubject.getValue();
  }

  // Clear all messages
  clearMessages(): void {
    this.clearMessagesSubject.next();
    this.chatMessagesSubject.next([]);
    this.clearUnsavedMessages();
  }

  // Get clear messages observable
  getClearMessages$() {
    return this.clearMessagesSubject.asObservable();
  }

  // Save history trigger
  triggerSaveHistory(): void {
    this.saveHistorySubject.next();
  }

  getSaveHistory$() {
    return this.saveHistorySubject.asObservable();
  }
}
