import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzMenuModule } from "ng-zorro-antd/menu";
import { NzIconModule } from "ng-zorro-antd/icon";
import { CommonModule } from "@angular/common";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { NzAvatarModule } from "ng-zorro-antd/avatar";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { NzSelectModule } from "ng-zorro-antd/select";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";

// Import services from webai project
import { AuthService } from "../../services/auth.service";
import { ChatEventsService } from "../../services/chat-events.service";

// Import interfaces that exist in webai project
import { ListChatHistoryDto } from "../../interfaces/list-chat-history-dto";
import { ListChatSessionVo } from "../../interfaces/list-chat-session-vo";

// Import services that we'll create
import { ChatService } from "@/app/components/rewrite-model/services/chat.service";
import { ChatBotService } from "@/app/components/rewrite-model/services/chat-bot.service";

@Component({
  selector: "app-rewrite-model",
  templateUrl: "./rewrite-model.component.html",
  styleUrls: ["./rewrite-model.component.scss"],
  standalone: true,
  imports: [
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    CommonModule,
    NzButtonModule,
    NzDropDownModule,
    NzModalModule,
    NzAvatarModule,
    NzToolTipModule,
    NzSelectModule,
    FormsModule,
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

  constructor(
    private router: Router,
    private modal: NzModalService,
    private chatService: ChatService,
    private authService: AuthService,
    public chatEventsService: ChatEventsService,
    private chatBotService: ChatBotService,
  ) {
    // Subscribe to user email changes
    this.emailSubscription = this.authService
      .getUserEmail()
      .subscribe((email) => (this.userEmail = email));

    // Subscribe to chat history changes
    this.chatHistorySubscription = this.chatService.chatHistory$.subscribe(
      (history) => {
        this.chatHistory = history;
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
  }

  ngOnDestroy(): void {
    if (this.emailSubscription) {
      this.emailSubscription.unsubscribe();
    }
    if (this.chatHistorySubscription) {
      this.chatHistorySubscription.unsubscribe();
    }
    window.removeEventListener("resize", () => this.checkMobile());
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
          const chatMessages = filteredMessages.map(
            (item: ListChatSessionVo) => ({
              role: item.role,
              content: item.content,
              isUser: item.role === "user",
              tag: item.tag,
              parsedContent: undefined, // Let the ChatBotComponent handle the parsing
            }),
          );

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
    this.modal.confirm({
      nzCentered: true,
      nzTitle: "Are you sure you want to logout?",
      nzOnOk: () => this.logout(),
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
}
