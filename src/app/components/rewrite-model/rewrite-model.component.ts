import { ListChatSessionVo } from "@/app/interfaces/list-chat-session-vo";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { HttpClientModule } from "@angular/common/http";
import { Subject, takeUntil } from "rxjs";

import { AuthService } from "../../services/auth.service";
import { ChatEventsService } from "./services/chat-events.service";

import { ListChatHistoryDto } from "../../interfaces/list-chat-history-dto";
import { ModelMessageDTO } from "../../interfaces/model-message-dto";
import { ChatMessage } from "../../interfaces/chat-dto";
import { Result } from "../../interfaces/result";
import { PageListChatSessionVo } from "../../interfaces/page-list-chat-session-vo";
import { PageListChatHistoryVo } from "../../interfaces/page-list-chat-history-vo";

import { ChatService } from "./services/chat.service";
import { ChatBotService } from "./services/chat-bot.service";
import { KatexService } from "./services/katex.service";
import { VisibilityService } from "./services/visibility.service";

import { ChatBotComponent } from "./components/chat-bot/chat-bot.component";
import { UserMenuComponent } from "./components/user-menu/user-menu.component";
import {
  ButtonComponent,
  IconComponent,
  MessageService,
  SpinnerComponent,
} from "@/app/shared";
import { ChatStatusService } from "@components/rewrite-model/services/chat-status.service";

@Component({
  selector: "app-rewrite-model",
  templateUrl: "./rewrite-model.component.html",
  styleUrls: ["./rewrite-model.component.scss"],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ButtonComponent,
    IconComponent,
    SpinnerComponent,
    ChatBotComponent,
    UserMenuComponent,
  ],
  providers: [
    ChatService,
    ChatBotService,
    KatexService,
    ChatEventsService,
    VisibilityService,
    ChatStatusService,
  ],
})
export class RewriteModelComponent implements OnInit, OnDestroy {
  // Layout state
  isCollapsed = false;
  isMobile = false;
  selectedTabIndex = 2;
  userEmail = "User";
  activeHistoryId: string | null = null;

  // Subscriptions
  private readonly emailSubscription: Subscription;
  private readonly chatHistorySubscription: Subscription;

  // Chat history
  chatHistory: ListChatHistoryDto[] = [];
  isLoading = false;

  // Pagination
  private currentPage = 0;
  private readonly pageSize = 10;
  private hasMoreData = true;
  private isLoadingSpecificChat = false;

  // UI state
  showChatHistory = true;

  // Chat state
  currentSessionId: string | null = null;

  // Cleanup subject for subscription management
  private destroy$ = new Subject<void>();

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    public chatEventsService: ChatEventsService,
    private chatBotService: ChatBotService,
    private chatStatusService: ChatStatusService,
    private messageService: MessageService,
  ) {
    // Subscribe to user email changes
    this.emailSubscription = this.authService
      .getUserEmail()
      .subscribe((email) => (this.userEmail = email));

    // Subscribe to chat history changes
    this.chatHistorySubscription = this.chatService.chatHistory$.subscribe(
      (history) => {
        this.chatHistory = history;
        console.log("chatHistory", history);
      },
    );

    // Subscribe to session ID changes
    this.chatService.sessionId$.subscribe((sessionId) => {
      if (sessionId) {
        this.activeHistoryId = sessionId;
      }
    });
  }

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener("resize", () => this.checkMobile());

    // Subscribe to chat history toggle event
    this.chatEventsService.showChatHistory$
      .pipe(takeUntil(this.destroy$))
      .subscribe((show) => {
        this.showChatHistory = show;
      });

    // Check chat status to ensure user has access
    this.chatStatusService.checkChatStatus().subscribe({
      next: (result) => {
        console.log("Chat status checked:", result);
      },
      error: (error) => {
        console.error("Error checking chat status:", error);
        this.messageService.error("Failed to check chat status");
      },
    });
  }

  ngOnDestroy(): void {
    if (this.emailSubscription) {
      this.emailSubscription.unsubscribe();
    }
    if (this.chatHistorySubscription) {
      this.chatHistorySubscription.unsubscribe();
    }
    window.removeEventListener("resize", () => this.checkMobile());

    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Layout methods
  private checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isCollapsed = true;
    }
    this.chatService.setIsMobile(this.isMobile);

    // Auto-hide chat history on mobile
    if (this.isMobile && this.showChatHistory) {
      this.chatEventsService.setShowChatHistory(false);
    }
  }

  // Navigation methods
  // Tab management
  onTabChange(index: number): void {
    this.selectedTabIndex = index;

    if (!this.isLoadingSpecificChat) {
      this.chatService.onTabChange(index);
      this.currentPage = 0;
      this.hasMoreData = true;
    }
  }

  // Chat methods
  loadChat(history: ListChatHistoryDto): void {
    console.log("Loading chat:", history);
    this.activeHistoryId = history.sessionId;
    this.onContentClick();

    // Set the flag to prevent redundant calls
    this.isLoadingSpecificChat = true;

    // Update the selected tab based on history tag
    this.selectedTabIndex = history.tag;
    this.onTabChange(history.tag);

    this.chatBotService.listChatHistoryById(history.sessionId).subscribe({
      next: (res) => {
        // Validate response structure
        if (this.isValidPageListResponse(res)) {
          try {
            // Update sessionId in ChatService
            this.chatService.updateSessionId(history.sessionId);

            // Filter messages by the current tab
            const filteredMessages = res.data.content.filter(
              (item: ListChatSessionVo) =>
                item && true && item.tag === this.selectedTabIndex,
            );

            // Convert the response data to ChatMessage format for display
            const chatMessages: ChatMessage[] = [];

            filteredMessages.forEach((item: ListChatSessionVo) => {
              // Ensure item and messages array exist before processing
              if (item?.messages && Array.isArray(item.messages)) {
                item.messages.forEach((message: ModelMessageDTO) => {
                  // Validate message structure before processing
                  if (message?.role && message?.content) {
                    chatMessages.push({
                      role: message.role,
                      content: message.content,
                      isUser: message.role === "user",
                      tag: item.tag,
                      parsedContent: undefined,
                    });
                  }
                });
              }
            });

            // Update the chat messages in the chat service
            this.chatService.updateChatMessages(
              chatMessages.map((msg) => ({
                ...msg,
                isFromHistory: true,
              })),
              false,
            );

            console.log(
              `Successfully loaded ${chatMessages.length} messages from chat history`,
            );
          } catch (error) {
            console.error("Error processing chat history data:", error);
            this.messageService.error("Failed to process chat history data");
          }
        } else {
          // Handle invalid response structure
          console.log("Invalid response structure or empty content:", res);
          this.messageService.warning("No chat history found for this session");
        }
      },
      error: (error) => {
        console.error("Error loading chat history:", error);
        this.messageService.error("Failed to load chat history");
      },
      complete: () => {
        this.isLoadingSpecificChat = false;
      },
    });
  }

  // User management
  logout(): void {
    this.authService.logout().subscribe();
  }
  // Mobile interaction methods
  onContentClick(): void {
    if (this.isMobile && !this.isCollapsed) {
      this.isCollapsed = true;
    }
  }
  // History scroll handling
  onHistoryScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const scrollPosition = element.scrollTop + element.clientHeight;
    const scrollHeight = element.scrollHeight;

    // Check if user scrolls to the bottom
    if (
      scrollHeight - scrollPosition < 20 &&
      !this.isLoading &&
      this.hasMoreData
    ) {
      this.loadMoreHistory();
    }
  }

  private loadMoreHistory(): void {
    this.isLoading = true;
    const nextPage = this.currentPage + 1;

    this.chatBotService
      .listChatHistory(this.selectedTabIndex, nextPage, this.pageSize)
      .subscribe({
        next: (result) => {
          // Validate response
          if (this.isValidChatHistoryResponse(result)) {
            const newHistory = result.data.content;

            // Check if there is more data
            this.hasMoreData = !result.data.last;

            if (newHistory.length > 0) {
              // Update current page only if there is new data
              this.currentPage = nextPage;
              // Combine new history with existing history
              this.chatHistory = [...this.chatHistory, ...newHistory];
              console.log(`Loaded ${newHistory.length} more history items`);
            } else {
              console.log("No more history items to load");
            }
          } else {
            // Handle invalid response or empty data
            console.log("Invalid response or no data");
            this.hasMoreData = false;
            this.messageService.info("No more chat history available");
          }
        },
        error: (error) => {
          console.error("Error loading more history:", error);
          this.messageService.error("Failed to load more chat history");
          this.hasMoreData = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  // Utility methods
  truncateContent(content: string): string {
    return content;
  }

  // Toggle chat history visibility
  toggleChatHistory() {
    this.chatEventsService.setShowChatHistory(!this.showChatHistory);
  }

  // Start a new chat
  startNewChat() {
    this.chatEventsService.triggerClearChat();
    this.chatService.updateSessionId(null);
    this.currentSessionId = null;
    this.messageService.success("Started a new conversation");
  }

  // Save current chat
  saveChat() {
    this.chatEventsService.triggerSaveHistory();
    this.messageService.success("Chat saved successfully");
  }

  private isValidApiResponse<T>(
    response: Result<T> | null | undefined,
  ): response is Result<T> {
    return response != null && true;
  }

  private isSuccessfulResponse<T>(response: Result<T>): boolean {
    return response.code === 1;
  }

  private hasValidData<T>(
    response: Result<T>,
  ): response is Result<T> & { data: T } {
    return response.data != null;
  }

  private isValidPageListResponse(
    response: Result<PageListChatSessionVo> | null | undefined,
  ): response is Result<PageListChatSessionVo> & {
    data: PageListChatSessionVo;
  } {
    return (
      this.isValidApiResponse(response) &&
      this.isSuccessfulResponse(response) &&
      this.hasValidData(response) &&
      response.data.content != null &&
      Array.isArray(response.data.content)
    );
  }

  private isValidChatHistoryResponse(
    response: Result<PageListChatHistoryVo> | null | undefined,
  ): response is Result<PageListChatHistoryVo> & {
    data: PageListChatHistoryVo;
  } {
    return (
      this.isValidApiResponse(response) &&
      this.isSuccessfulResponse(response) &&
      this.hasValidData(response) &&
      response.data.content != null &&
      Array.isArray(response.data.content)
    );
  }
}
