import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { HttpClientModule } from "@angular/common/http";
import { Subject, takeUntil } from "rxjs";

// Import services from webai project
import { AuthService } from "../../services/auth.service";
import { ChatEventsService } from "./services/chat-events.service";

// Import interfaces that exist in webai project
import { ListChatHistoryDto } from "../../interfaces/list-chat-history-dto";
import { ListChatSessionVo } from "../../interfaces/list-chat-session-vo";
import { ModelMessageDTO } from "../../interfaces/model-message-dto";
import { ChatMessage } from "../../interfaces/chat-dto";

// Import services that we'll create
import { ChatService } from "./services/chat.service";
import { ChatBotService } from "./services/chat-bot.service";
import { KatexService } from "./services/katex.service";
import { VisibilityService } from "./services/visibility.service";

// Import components
import { ChatBotComponent } from "./components/chat-bot/chat-bot.component";
import {
  ButtonComponent,
  IconComponent,
  MessageService,
  ModalService,
  SpinnerComponent,
} from "@/app/shared";

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
  ],
  providers: [
    ChatService,
    ChatBotService,
    KatexService,
    ChatEventsService,
    VisibilityService,
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

  // Tab options for rewrite functionality
  options = [{ label: "Rewrite", value: 2 }];

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
    private router: Router,
    private modalService: ModalService,
    private chatService: ChatService,
    private authService: AuthService,
    public chatEventsService: ChatEventsService,
    private chatBotService: ChatBotService,
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
    this.chatBotService.checkChatStatus().subscribe({
      next: (result) => {
        if (result.code !== 1) {
          this.messageService.error("Chat service unavailable");
        }
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
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

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
  isOnChatPage(): boolean {
    return (
      this.router.url === "/rewrite" || this.router.url.includes("/rewrite")
    );
  }

  isProfileSection(): boolean {
    return (
      this.router.url.startsWith("/profile") || this.router.url === "/activate"
    );
  }

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
  clearChat(): void {
    this.chatEventsService.triggerClearChat();
    this.onMenuItemClick();
  }

  loadChat(history: ListChatHistoryDto): void {
    console.log("Loading chat:", history);
    this.activeHistoryId = history.sessionId;
    this.onContentClick();

    // Set the flag to prevent redundant calls
    this.isLoadingSpecificChat = true;

    // Update the selected tab based on history tag
    this.selectedTabIndex = history.tag;
    this.onTabChange(history.tag);

    this.chatBotService
      .listChatHistoryById(history.sessionId)
      .subscribe((res) => {
        if (res.code === 1 && res.data?.content) {
          // Update sessionId in ChatService
          this.chatService.updateSessionId(history.sessionId);

          // Filter messages by the current tab
          const filteredMessages = res.data.content.filter(
            (item: ListChatSessionVo) => item.tag === this.selectedTabIndex,
          );

          // Convert the response data to ChatMessage format for display
          const chatMessages: ChatMessage[] = [];

          filteredMessages.forEach((item: ListChatSessionVo) => {
            // Process each message in the item's messages array
            item.messages.forEach((message: ModelMessageDTO) => {
              chatMessages.push({
                role: message.role,
                content: message.content,
                isUser: message.role === "user",
                tag: item.tag,
                parsedContent: undefined, // Let the ChatBotComponent handle the parsing
              });
            });
          });

          // Update the chat messages in the chat service
          this.chatService.updateChatMessages(
            chatMessages.map((msg) => ({
              ...msg,
              isFromHistory: true,
            })),
            false,
          );

          // Reset the flag after chat is loaded
          this.isLoadingSpecificChat = false;
        }
      });
  }

  // User management
  showLogoutConfirm(): void {
    this.modalService.confirm({
      title: "Are you sure you want to logout?",
      centered: true,
      onOk: () => this.logout(),
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  jumpToProfile(): void {
    this.router.navigate(["/profile/change-password"]);
    this.onMenuItemClick();
  }

  // Mobile interaction methods
  onContentClick(): void {
    if (this.isMobile && !this.isCollapsed) {
      this.isCollapsed = true;
    }
  }

  onMenuItemClick(): void {
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
          if (result.code === 1 && result.data) {
            const newHistory = result.data.content;

            // Check if there is more data
            this.hasMoreData = !result.data.last;

            if (newHistory.length > 0) {
              // Update current page only if there is new data
              this.currentPage = nextPage;
              // Combine new history with existing history
              this.chatHistory = [...this.chatHistory, ...newHistory];
            }
          }
        },
        error: (error) => {
          console.error("Error loading more history:", error);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  // Utility methods
  truncateEmail(email: string): string {
    if (this.isMobile) {
      return email.length > 20 ? `${email.substring(0, 15)}...` : email;
    } else {
      return email.length > 25 ? `${email.substring(0, 20)}...` : email;
    }
  }

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
}
