import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzTabsModule } from "ng-zorro-antd/tabs";
import { NzSelectModule } from "ng-zorro-antd/select";
import { CommonModule } from "@angular/common";
import { ChatBotService } from "../../services/chat-bot.service";
import { ChatService } from "../../services/chat.service";
import { ModelMessageDTO } from "@/app/interfaces/model-message-dto";
import { ModelRequestDto } from "@/app/interfaces/model-request-dto";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { marked } from "marked";
import { firstValueFrom, interval, Subscription } from "rxjs";
import { KatexService } from "@/app/services/katex.service";
import { NzMessageService } from "ng-zorro-antd/message";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { AuthService } from "@/app/services/auth.service";
import { environment } from "@environment/environment";
import { ChatEventsService } from "@/app/services/chat-events.service";
import { finalize, take } from "rxjs/operators";
import { ChatData, ChatMessage } from "@/app/interfaces/chat-dto";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from "@angular/router";
import { CONSTANTS } from "@/app/constants";
import { VisibilityService } from "@/app/services/visibility.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { NzTooltipDirective, NzToolTipModule } from "ng-zorro-antd/tooltip";
import { NzSpinModule } from "ng-zorro-antd/spin";

// Configure marked for synchronous operation
marked.setOptions({
  async: false,
  breaks: true,
});

@Component({
  selector: "app-chat-bot",
  templateUrl: "./chat-bot.component.html",
  styleUrls: ["./chat-bot.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzTabsModule,
    NzSelectModule,
    NzModalModule,
    NzToolTipModule,
    NzSpinModule,
  ],
})
export class ChatBotComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren("messageInput") messageInputs!: QueryList<ElementRef>;
  @ViewChildren("scrollMe") messageContainers!: QueryList<ElementRef>;
  @ViewChildren(NzTooltipDirective) tooltips!: QueryList<NzTooltipDirective>;

  // Private properties for internal state management
  private userScrollingUp = false;
  private isPageVisible = true;
  private visibilitySubscription: Subscription | undefined;
  private pendingUpdates = false;
  private newMessages: Record<number, ChatMessage[]> = { 0: [], 1: [], 2: [] };
  private isSavingHistory = false;
  private hasJustCleared = false;
  private isAfterClear = false;
  private isFirstUser = false;
  private isNewSession = false;
  private lastRequest: ModelRequestDto | null = null;
  private lastAssistantMessage: ChatMessage | null = null;
  private isRouteChange = false;
  private _showThankYou = false;

  // Public component state
  chatStarted = false;
  selectedTabIndex = 2; // Default to rewrite tab
  currentMessage = "";
  isStreaming = false;
  isLoading = false;
  streamingTabIndex: number | null = null;
  showScrollTop = false;
  isMobile = false;
  showCountdown = false;
  countdownTime = "";
  countdownSeconds = 0;
  page = 0;
  pageSize = 10;
  isCountdownExpanded = false;
  isConfirmStartChat = false;
  userId = "";
  showInputContainer = true;
  currentSessionId: string | null = null;
  copiedMessageId: string | null = null;

  // Chat messages for different tabs
  economicQAMessages: ChatMessage[] = [];
  economicThesesMessages: ChatMessage[] = [];
  rewriteMessages: ChatMessage[] = [];

  // Character counting and limits
  englishCharCount = 0;
  nonEnglishCharCount = 0;
  isLimitReached = false;
  isComposing = false;
  isEnglishLimitReached = false;
  isNonEnglishLimitReached = false;

  // Subscriptions for cleanup
  private readonly clearMessagesSubscription: Subscription;
  private readonly tabChangeSubscription: Subscription;
  private readonly isMobileSubscription: Subscription;
  private readonly chatMessagesSubscription: Subscription;
  private readonly loadMoreHistorySubscription: Subscription;
  private readonly sessionIdSubscription: Subscription;
  private countdownSubscription?: Subscription;

  // Configuration objects
  private readonly welcomeMessages: Record<number, string> = {
    0: "Welcome to Tudor AI!",
    1: "Welcome to Tudor AI!",
    2: "Welcome to Tudor AI!",
  };

  private chatData: Record<number, ChatData> = {
    0: { messages: this.economicQAMessages, tag: 0 },
    1: { messages: this.economicThesesMessages, tag: 1 },
    2: { messages: this.rewriteMessages, tag: 2 },
  };

  private maxMessagesByTag: Record<number, number> = {
    0: 10,
    1: 10,
    2: 10,
  };

  constructor(
    private chatBotService: ChatBotService,
    private chatService: ChatService,
    private sanitizer: DomSanitizer,
    private katexService: KatexService,
    private message: NzMessageService,
    private modal: NzModalService,
    private authService: AuthService,
    private chatEventsService: ChatEventsService,
    private injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
    private visibilityService: VisibilityService,
    private clipboard: Clipboard,
  ) {
    // Load initial chat history
    this.loadInitialChatHistory();

    // Initialize subscriptions
    this.clearMessagesSubscription = this.initializeClearMessagesSubscription();
    this.tabChangeSubscription = this.initializeTabChangeSubscription();
    this.isMobileSubscription = this.initializeMobileSubscription();
    this.chatMessagesSubscription = this.initializeChatMessagesSubscription();
    this.loadMoreHistorySubscription =
      this.initializeLoadMoreHistorySubscription();
    this.sessionIdSubscription = this.initializeSessionIdSubscription();

    // Initialize router event subscription
    this.initializeRouterSubscription();
  }

  ngOnInit(): void {
    // Initialize visibility tracking
    this.isPageVisible = this.visibilityService.isVisible();
    this.visibilitySubscription = this.visibilityService
      .visibility()
      .subscribe((isVisible) => {
        console.log("Page visibility changed:", isVisible);
        this.handleVisibilityChange(isVisible);
      });
  }

  ngAfterViewInit(): void {
    this.focusInput();
    this.setupScrollListener();

    // Check chat status and initialize
    this.checkChatStatusAndInitialize();

    // Load chat data from session
    this.loadChatDataFromSession();

    // Setup composition listeners for input handling
    this.messageInputs.changes.subscribe(() => {
      this.setupCompositionListeners();
    });

    this.setupCompositionListeners();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.clearMessagesSubscription?.unsubscribe();
    this.tabChangeSubscription?.unsubscribe();
    this.isMobileSubscription?.unsubscribe();
    this.chatMessagesSubscription?.unsubscribe();
    this.loadMoreHistorySubscription?.unsubscribe();
    this.countdownSubscription?.unsubscribe();
    this.sessionIdSubscription?.unsubscribe();
    this.visibilitySubscription?.unsubscribe();

    // Send beacon data if needed
    if (!this.isRouteChange && this.chatService.hasUnsavedMessages()) {
      this.sendBeaconData();
    }

    // Clean up composition listeners
    this.cleanupCompositionListeners();
  }

  // Getter for current messages
  get messages(): ChatMessage[] {
    return this.chatData[this.selectedTabIndex]?.messages || [];
  }

  // Getter/setter for showThankYou
  set showThankYou(value: boolean) {
    this._showThankYou = value;
  }

  get showThankYou(): boolean {
    return this._showThankYou;
  }

  // Initialize methods
  private loadInitialChatHistory(): void {
    this.chatBotService
      .listChatHistory(this.selectedTabIndex, this.page, this.pageSize)
      .subscribe((result) => {
        if (result.code === 1) {
          if (result.data?.content && result.data.content.length > 0) {
            this.chatService.updateChatHistory(result.data.content);
            this.isFirstUser = false;
          } else {
            this.isFirstUser = true;
          }
        }
      });
  }

  private initializeClearMessagesSubscription(): Subscription {
    return this.chatEventsService.saveAndClear$.subscribe(() => {
      console.log("saveAndClear$ event received");

      // Stop streaming if active
      if (this.isStreaming) {
        this.stopStreaming();
        this.isStreaming = false;
        this.streamingTabIndex = null;
      }

      // Prevent multiple simultaneous saves
      if (this.isSavingHistory) {
        return;
      }

      this.isSavingHistory = true;
      this.isAfterClear = true;
      const originalSessionId = this.currentSessionId;

      if (!this.isNewSession) {
        this.currentSessionId = null;
        this.isNewSession = false;
      }

      // Handle visibility state for beacon data
      if (document.visibilityState === "hidden") {
        this.sendBeaconData();
        this.clearAllMessages();
        this.isSavingHistory = false;
        return;
      }

      // Save and clear sequence
      this.saveChatHistoryIfNeeded()
        .then(() => {
          console.log("Chat history saved");
          return new Promise<void>((resolve) => setTimeout(resolve, 200));
        })
        .then(() => {
          console.log("Clearing messages");
          this.clearAllMessages();
        })
        .catch((error) => {
          console.error("Error in clear chat sequence:", error);
        })
        .finally(() => {
          this.isSavingHistory = false;
          this.currentSessionId = originalSessionId;
        });
    });
  }

  private initializeTabChangeSubscription(): Subscription {
    return this.chatService.tabChange$.subscribe((index) => {
      this.onTabChange(index);
    });
  }

  private initializeMobileSubscription(): Subscription {
    return this.chatService.isMobile$.subscribe((isMobile) => {
      this.isMobile = isMobile;
    });
  }

  private initializeChatMessagesSubscription(): Subscription {
    return this.chatService.chatMessages$.subscribe((messages) => {
      if (messages && messages.length > 0) {
        if (!this.showCountdown) {
          this.chatStarted = true;
          this.showInputContainer = false;
        } else {
          this.chatStarted = false;
          this.showInputContainer = true;
        }

        // Clear existing messages and set correct tab
        this.clearAllMessages();
        const firstMessageTag = messages[0].tag;
        if (this.selectedTabIndex !== firstMessageTag) {
          this.selectedTabIndex = firstMessageTag!;
          this.onTabChange(firstMessageTag!);
        }

        // Process and add messages
        this.processIncomingMessages(messages);
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  private initializeLoadMoreHistorySubscription(): Subscription {
    return this.chatEventsService.loadMoreHistory$.subscribe(() => {
      this.loadMoreHistory();
    });
  }

  private initializeSessionIdSubscription(): Subscription {
    return this.chatService.sessionId$.subscribe((sessionId) => {
      this.currentSessionId = sessionId;
      console.log("currentSessionId", this.currentSessionId);
      this.changeDetectorRef.detectChanges();
    });
  }

  private initializeRouterSubscription(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isRouteChange = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isRouteChange = false;
      }
    });
  }

  private handleVisibilityChange(isVisible: boolean): void {
    this.isPageVisible = isVisible;

    if (isVisible && this.pendingUpdates) {
      this.pendingUpdates = false;
      this.changeDetectorRef.detectChanges();
      this.scrollToBottom();
    }
  }

  private checkChatStatusAndInitialize(): void {
    this.chatBotService.checkChatStatus().subscribe((result) => {
      this.ngZone.run(() => {
        this.chatService.chatStatusResult = result;
        if (result.code === 1) {
          this.chatStarted = true;
          if (result.data?.endTime) {
            this.startCountdown(result.data.endTime);
          }
          this.showWelcomeMessage(false);
          this.showInputContainer = true;
        } else if (result.code === 0) {
          this.chatStarted = false;
          this.showWelcomeMessage(false);
          this.showInputContainer = false;
        } else if (result.code === -2) {
          this.message.error(
            "Your activation code has already been used on another device.",
          );
          this.chatStarted = false;
          this.showWelcomeMessage(false);
          this.showInputContainer = false;
        } else {
          this.chatStarted = false;
          this.showWelcomeMessage(false);
          this.showInputContainer = false;
        }
      });
    });
  }

  private loadChatDataFromSession(): void {
    this.chatService.getChatDataFromSession().then((storedChatData) => {
      if (storedChatData) {
        this.ngZone.run(() => {
          // Process parsedContent for each message
          Object.keys(storedChatData).forEach((key) => {
            const numericKey = Number(key);
            storedChatData[numericKey].messages = storedChatData[
              numericKey
            ].messages.map((msg: ChatMessage) => ({
              ...msg,
              tag: numericKey,
              parsedContent: msg.content
                ? this.parseMarkdown(msg.content)
                : undefined,
            }));
          });

          // Update component data
          this.chatData = storedChatData;
          this.economicQAMessages = storedChatData[0].messages || [];
          this.economicThesesMessages = storedChatData[1].messages || [];
          this.rewriteMessages = storedChatData[2].messages || [];
        });
      }
    });
  }

  // UI and interaction methods
  private setupCompositionListeners(): void {
    if (this.messageInputs && this.messageInputs.length > 0) {
      this.messageInputs.forEach((input) => {
        const textareaElement = input.nativeElement;

        textareaElement.removeEventListener(
          "compositionstart",
          this.handleCompositionStart,
        );
        textareaElement.removeEventListener(
          "compositionend",
          this.handleCompositionEnd,
        );
        textareaElement.removeEventListener(
          "beforeinput",
          this.handleBeforeInput,
        );

        textareaElement.addEventListener(
          "compositionstart",
          this.handleCompositionStart,
        );
        textareaElement.addEventListener(
          "compositionend",
          this.handleCompositionEnd,
        );
        textareaElement.addEventListener("beforeinput", this.handleBeforeInput);
      });
    }
  }

  private cleanupCompositionListeners(): void {
    if (this.messageInputs) {
      this.messageInputs.forEach((input) => {
        const textareaElement = input.nativeElement;
        textareaElement.removeEventListener(
          "compositionstart",
          this.handleCompositionStart,
        );
        textareaElement.removeEventListener(
          "compositionend",
          this.handleCompositionEnd,
        );
        textareaElement.removeEventListener(
          "beforeinput",
          this.handleBeforeInput,
        );
      });
    }
  }

  private handleCompositionStart = (): void => {
    this.isComposing = true;
  };

  private handleCompositionEnd = (): void => {
    this.isComposing = false;
    this.checkCharacterLimit();
  };

  private handleBeforeInput = (event: InputEvent): void => {
    if (this.isComposing) return;

    const inputData = event.data;
    if (!inputData) return;

    const predictedText = this.currentMessage + inputData;
    const currentTokenCount = this.countCharacters(
      this.currentMessage,
    ).englishCount;
    const predictedTokenCount =
      this.countCharacters(predictedText).englishCount;
    const wouldAddNewToken = predictedTokenCount > currentTokenCount;

    const isEnglishChar = inputData
      .split("")
      .every((c) => c.charCodeAt(0) >= 0 && c.charCodeAt(0) <= 127);

    if (this.isEnglishLimitReached && wouldAddNewToken && isEnglishChar) {
      event.preventDefault();
      return;
    }

    const isNonEnglishChar = !isEnglishChar;
    if (this.isNonEnglishLimitReached && isNonEnglishChar) {
      event.preventDefault();
      return;
    }

    const { englishCount, nonEnglishCount } =
      this.countCharacters(predictedText);

    if (
      englishCount > CONSTANTS.ENGLISH_CHAR_LIMIT &&
      wouldAddNewToken &&
      isEnglishChar
    ) {
      event.preventDefault();
      return;
    }

    if (
      nonEnglishCount > CONSTANTS.NON_ENGLISH_CHAR_LIMIT &&
      isNonEnglishChar
    ) {
      event.preventDefault();
      return;
    }
  };

  private sendBeaconData(): void {
    if (!this.hasJustCleared && this.isSavingHistory) {
      return;
    }

    // Check if we have any messages to send
    if (!this.currentSessionId) {
      // If no sessionId, add all current messages to unsaved messages first
      Object.entries(this.chatData).forEach(([tag, data]) => {
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((msg) => {
            if (msg.content !== "thinking..." && !msg.isFromHistory) {
              this.chatService.addUnsavedMessage({ ...msg }, parseInt(tag));
            }
          });
        }
      });
    }

    // Now use unsavedMessages for both cases
    if (!this.chatService.hasUnsavedMessages()) return;
    const unsavedMessages = this.chatService.getUnsavedMessages();

    const payload = Object.entries(unsavedMessages)
      .map(([tag, messages]) => {
        const numericTag = parseInt(tag);
        const limit = this.maxMessagesByTag[numericTag];
        let filteredMessages = messages;
        if (limit !== undefined && messages.length > limit) {
          filteredMessages = messages.slice(messages.length - limit);
        }
        return {
          userId: this.userId,
          tag: numericTag,
          messages: this.formatMessages(filteredMessages),
          sessionId: this.currentSessionId || undefined,
        };
      })
      .filter((item) => item.messages.length > 0);

    if (payload.length === 0) return;

    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });

    navigator.sendBeacon(
      `${environment.modelServiceUrl}/auth/model/entity/chat`,
      blob,
    );
  }

  private focusInput(): void {
    if (!this.chatStarted) return;

    const inputs = this.messageInputs.toArray();
    if (inputs[0]) {
      setTimeout(() => {
        inputs[0].nativeElement.focus();
      }, 300);
    }
  }

  private setupScrollListener(): void {
    const containers = this.messageContainers.toArray();
    containers.forEach((container) => {
      if (container && container.nativeElement) {
        const element = container.nativeElement;
        const scrollHandler = () => {
          const scrollTop = element.scrollTop;
          this.showScrollTop =
            scrollTop > 100 && scrollTop < element.scrollHeight;

          // Track if user is scrolling up
          const isAtBottom =
            element.scrollHeight - element.scrollTop <=
            element.clientHeight + 110;
          if (!isAtBottom && this.isStreaming) {
            this.userScrollingUp = true;
          } else if (isAtBottom) {
            this.userScrollingUp = false;
          }
        };

        // Add wheel event listener to detect scroll direction
        const wheelHandler = (e: WheelEvent) => {
          if (this.isStreaming && e.deltaY < 0) {
            this.userScrollingUp = true;
          }
        };

        element.removeEventListener("scroll", scrollHandler);
        element.removeEventListener("wheel", wheelHandler);
        element.addEventListener("scroll", scrollHandler);
        element.addEventListener("wheel", wheelHandler);
      }
    });
  }

  // Chat functionality methods
  private stopStreaming(): void {
    if (this.isStreaming) {
      this.isStreaming = false;
      this.isLoading = false;
      this.streamingTabIndex = null;

      // Call the stopOutput method with the current tab index as tag
      const tag = this.selectedTabIndex.toString();
      this.chatBotService.stopOutput(tag).subscribe({
        next: () => {
          console.log("Stream stopped successfully");
        },
        error: (error) => {
          console.error("Error stopping stream:", error);
        },
      });

      // Remove the last message if it's still "thinking..."
      const messages = this.chatData[this.selectedTabIndex].messages;
      if (
        messages.length > 0 &&
        messages[messages.length - 1].content === "thinking..."
      ) {
        messages.pop();
      }
    }
  }

  private clearAllMessages(): void {
    console.log(
      "clearAllMessages called, selectedTabIndex:",
      this.selectedTabIndex,
    );
    this.showScrollTop = false;
    const tag = this.selectedTabIndex;

    if (tag === undefined) {
      console.log("No tab selected, clearing all messages");
      this.economicQAMessages = [];
      this.economicThesesMessages = [];
      this.rewriteMessages = [];
      Object.keys(this.chatData).forEach((key) => {
        const numericKey = Number(key);
        this.chatData[numericKey] = {
          messages: [],
          tag: numericKey,
        };
      });
      this.chatService.clearUnsavedMessages();
      return;
    }

    console.log("Clearing messages for tab:", tag);
    switch (tag) {
      case 0:
        this.economicQAMessages = [];
        break;
      case 1:
        this.economicThesesMessages = [];
        break;
      case 2:
        this.rewriteMessages = [];
        break;
    }

    this.chatData[tag] = {
      messages: [],
      tag,
    };

    console.log("Messages cleared for tab:", tag);
    this.showWelcomeMessage(true);

    // Clear unsaved messages only for the current tab
    const currentUnsavedMessages = this.chatService.getUnsavedMessages();
    const updatedMessages: { [key: string]: ChatMessage[] } = {
      ...currentUnsavedMessages,
      [tag]: [],
    };
    this.chatService.clearUnsavedMessages();
    Object.entries(updatedMessages).forEach(
      ([t, messages]: [string, ChatMessage[]]) => {
        if (messages.length > 0) {
          messages.forEach((msg: ChatMessage) => {
            this.chatService.addUnsavedMessage(msg, parseInt(t));
          });
        }
      },
    );
  }

  private processIncomingMessages(messages: ChatMessage[]): void {
    messages.forEach((msg) => {
      const parsedContent = this.parseMarkdown(msg.content);
      const chatMessage: ChatMessage = {
        role: msg.role,
        content: msg.content,
        isUser: msg.isUser,
        parsedContent: msg.parsedContent || parsedContent,
        tag: msg.tag,
      };

      // Add messages to the appropriate tab
      if (!this.chatData[msg.tag!]) {
        this.chatData[msg.tag!] = {
          messages: [],
          tag: msg.tag!,
          sessionId: this.currentSessionId || undefined,
        };
      }
      this.chatData[msg.tag!].messages.push(chatMessage);

      // Track new messages if sessionId exists
      if (
        this.currentSessionId &&
        this.chatData[msg.tag!]?.sessionId === this.currentSessionId
      ) {
        if (!this.newMessages[msg.tag!]) {
          this.newMessages[msg.tag!] = [];
        }
        this.newMessages[msg.tag!].push(chatMessage);
      }
    });
  }

  private scrollToBottom(): void {
    // Don't auto-scroll if user is scrolling up during streaming
    if (this.isStreaming && this.userScrollingUp) {
      return;
    }

    setTimeout(() => {
      const containers = this.messageContainers.toArray();
      containers.forEach((container) => {
        if (container && container.nativeElement) {
          container.nativeElement.scrollTop =
            container.nativeElement.scrollHeight;
        }
      });
    }, 0);
  }

  private startCountdown(endTime: string): void {
    try {
      // Parse the ISO 8601 date
      const endDate = new Date(endTime);
      const endTimestamp = endDate.getTime();

      if (this.countdownSubscription) {
        this.countdownSubscription.unsubscribe();
      }

      this.countdownSubscription = interval(1000).subscribe(() => {
        // Get current timestamp
        const currentTimestamp = Date.now();
        const timeDiff = endTimestamp - currentTimestamp;
        // Set time expired to false
        this.chatService.setTimeExpired(false);

        if (timeDiff <= 0) {
          this.showCountdown = false;
          this.countdownSeconds = 0;
          this.showInputContainer = false;
          this.chatEventsService.setShowChatHistory(false);
          // Set time expired to true
          this.chatService.setTimeExpired(true);
          this.countdownSubscription?.unsubscribe();
          if (this.isStreaming) {
            this.stopStreaming();
          }
          this.saveChatHistoryIfNeeded();
          return;
        }

        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        this.countdownSeconds = minutes * 60 + seconds;

        this.countdownTime = `${minutes < 10 ? "0" : ""}${minutes}:${
          seconds < 10 ? "0" : ""
        }${seconds}`;
        this.showCountdown = true;
      });
    } catch (error) {
      this.message.error("Failed to start countdown");
    }
  }

  private showWelcomeMessage(forceShow: boolean = false): void {
    // If forcing show or no messages in current tab
    if (forceShow || this.messages.length === 0) {
      const welcomeMessage = this.welcomeMessages[this.selectedTabIndex];
      const parsedContent = this.parseMarkdown(welcomeMessage);

      this.ngZone.run(() => {
        const welcomeChatMessage: ChatMessage = {
          role: "assistant",
          content: welcomeMessage,
          isUser: false,
          parsedContent,
        };
        this.addMessage(welcomeChatMessage);
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  private loadMoreHistory(): void {
    console.log("loadMoreHistory called, current page:", this.page);
    this.page += 1;
    console.log("Loading page:", this.page);

    this.chatBotService
      .listChatHistory(this.selectedTabIndex, this.page, this.pageSize)
      .subscribe({
        next: (result) => {
          console.log("History load result:", result);
          if (result.code === 1 && result.data) {
            console.log("New history data:", result.data);
            // Add new history to the existing history
            this.chatService.chatHistory$
              .pipe(take(1))
              .subscribe((currentHistory) => {
                console.log("Current history:", currentHistory);
                const newHistory = result.data?.content || [];
                if (currentHistory && currentHistory.length > 0) {
                  console.log("Merging with existing history");
                  this.chatService.updateChatHistory([
                    ...currentHistory,
                    ...newHistory,
                  ]);
                } else {
                  console.log("Setting new history");
                  this.chatService.updateChatHistory(newHistory);
                }
              });
          } else {
            console.log("No new history data or error:", result);
          }
        },
        error: (error) => {
          console.error("Error loading more history:", error);
        },
      });
  }

  private onTabChange(index: number): void {
    this.ngZone.run(async () => {
      // Save current tab's messages if needed
      if (this.currentSessionId && this.chatService.hasUnsavedMessages()) {
        await this.saveChatHistoryIfNeeded();
      }
      this.switchTab(index);
    });
  }

  private switchTab(index: number): void {
    this.selectedTabIndex = index;
    this.showScrollTop = false;
    setTimeout(() => {
      this.focusInput();
      this.setupScrollListener();
    }, 0);

    this.chatBotService
      .listChatHistory(this.selectedTabIndex, this.page, this.pageSize)
      .subscribe((result) => {
        if (result.code === 1 && result.data) {
          this.chatService.updateChatHistory(result.data.content);
        }
        this.showWelcomeMessage(false);
      });
  }

  private parseMarkdown(content: string): SafeHtml {
    // Process math formulas and replace with placeholders
    const mathExpressions: string[] = [];
    let processedContent = content.replace(
      /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\]|\\\(.*?\\\))/g,
      (match) => {
        mathExpressions.push(match);
        return `MATH_EXPRESSION_${mathExpressions.length - 1}`;
      },
    );

    // Convert markdown to HTML
    processedContent = marked.parse(processedContent) as string;

    // Restore math expressions and render with KaTeX
    processedContent = processedContent.replace(
      /MATH_EXPRESSION_(\d+)/g,
      (_, index) => {
        const mathExpression = mathExpressions[parseInt(index)];
        return this.katexService.renderMath(mathExpression);
      },
    );

    return this.sanitizer.bypassSecurityTrustHtml(processedContent);
  }

  private saveChatHistoryIfNeeded(): Promise<void> {
    if (
      !this.chatService.hasUnsavedMessages() &&
      !this.hasJustCleared &&
      !this.isFirstUser &&
      this.isSavingHistory
    ) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      console.log(
        "has unsaved messages",
        this.chatService.hasUnsavedMessages(),
      );

      this.authService.getUserId().subscribe((userId) => {
        if (!userId) {
          console.error("No user ID available");
          resolve();
          return;
        }
        this.userId = userId;
        const unsavedMessages = this.chatService.getUnsavedMessages();

        console.log("save sessionid", this.currentSessionId);
        const payload = Object.entries(unsavedMessages)
          .map(([tag, messages]) => {
            const numericTag = parseInt(tag);
            const limit = this.maxMessagesByTag[numericTag];
            let filteredMessages = messages;
            if (limit !== undefined && messages.length > limit) {
              filteredMessages = messages.slice(messages.length - limit);
            }
            return {
              userId: this.userId,
              tag: numericTag,
              messages: this.formatMessages(filteredMessages),
              sessionId: this.currentSessionId || undefined,
            };
          })
          .filter((item) => item.messages.length > 0);

        // Handle new user case
        if (payload.length === 0 && this.isFirstUser) {
          payload.push({
            userId: this.userId,
            tag: this.selectedTabIndex,
            messages: this.formatMessages(
              this.chatData[this.selectedTabIndex]?.messages.filter(
                (msg) =>
                  msg.content !== "thinking..." &&
                  msg.content !==
                    this.welcomeMessages[
                      this.selectedTabIndex as keyof typeof this.welcomeMessages
                    ],
              ) || [],
            ),
            sessionId: undefined,
          });
        }

        if (payload.length > 0) {
          this.chatBotService.saveChatHistory(payload).subscribe({
            next: (result) => {
              if (result.code === 1) {
                console.log("Chat history saved successfully");
                this.chatService.clearUnsavedMessages();
                this.loadChatHistory().then(() => resolve());
              } else {
                console.error("Error saving chat history:", result.error);
                resolve();
              }
            },
            error: (error) => {
              console.error("Error saving chat history:", error);
              resolve();
            },
          });
        } else {
          resolve();
        }
      });
    });
  }

  private async loadChatHistory(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.chatBotService
        .listChatHistory(this.selectedTabIndex, this.page, this.pageSize)
        .subscribe((result) => {
          if (result.code === 1 && result.data) {
            this.chatService.updateChatHistory(result.data.content);
          }
          resolve();
        });
    });
  }

  private formatMessages(messages: ChatMessage[]): ModelMessageDTO[] {
    return messages
      .filter(
        (msg) =>
          msg.content !==
          this.welcomeMessages[
            this.selectedTabIndex as keyof typeof this.welcomeMessages
          ],
      )
      .map((msg) => ({
        role: msg.role,
        content: msg.isUser ? msg.content.replace(/\n/g, " ") : msg.content,
      }));
  }

  private countCharacters(text: string): {
    englishCount: number;
    nonEnglishCount: number;
  } {
    const tokenRegex =
      /\b[a-zA-Z]+(?:[',.!?-]*[a-zA-Z]*)*\b|[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]|\s+/g;
    const tokens = text.match(tokenRegex) || [];

    const nonEmptyTokens = tokens.filter((token) => token.trim().length > 0);
    const englishCount = nonEmptyTokens.length;

    let nonEnglishCount = 0;
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      if (charCode < 0 || charCode > 127) {
        nonEnglishCount++;
      }
    }

    return { englishCount, nonEnglishCount };
  }

  private checkCharacterLimit(): void {
    const text = this.currentMessage;

    if (!text || text.trim() === "") {
      this.resetCharacterCounts();
      return;
    }

    // Count English words and non-English characters
    const { englishCount, nonEnglishCount } = this.countCharacters(text);
    this.englishCharCount = englishCount;
    this.nonEnglishCharCount = nonEnglishCount;

    // Check if either limit is reached
    const isEnglishLimitReached =
      this.englishCharCount > CONSTANTS.ENGLISH_CHAR_LIMIT;
    const isNonEnglishLimitReached =
      this.nonEnglishCharCount > CONSTANTS.NON_ENGLISH_CHAR_LIMIT;

    this.isLimitReached = isEnglishLimitReached || isNonEnglishLimitReached;
    this.isEnglishLimitReached = isEnglishLimitReached;
    this.isNonEnglishLimitReached = isNonEnglishLimitReached;

    // If limit is reached
    if (this.isLimitReached && !this.isComposing) {
      if (isEnglishLimitReached) {
        // Trim English content
        this.currentMessage = this.trimToEnglishLimit(text);
      }

      if (isNonEnglishLimitReached) {
        this.currentMessage = this.trimToNonEnglishLimit(text);
      }
    }
  }

  private resetCharacterCounts(): void {
    this.englishCharCount = 0;
    this.nonEnglishCharCount = 0;
    this.isEnglishLimitReached = false;
    this.isNonEnglishLimitReached = false;
    this.isLimitReached = false;
  }

  private trimToEnglishLimit(text: string): string {
    const tokenRegex =
      /\b[a-zA-Z]+(?:[',.!?-]*[a-zA-Z]*)*\b|[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]|\s+/g;
    const matches = [];
    let match;

    while ((match = tokenRegex.exec(text)) !== null) {
      if (match[0].trim().length > 0) {
        matches.push({
          token: match[0],
          index: match.index,
          lastIndex: match.index + match[0].length,
        });
      }
    }

    if (matches.length > CONSTANTS.ENGLISH_CHAR_LIMIT) {
      const cutoffPosition =
        matches[CONSTANTS.ENGLISH_CHAR_LIMIT - 1].lastIndex;
      return text.substring(0, cutoffPosition);
    }

    return text;
  }

  private trimToNonEnglishLimit(text: string): string {
    // Remove non-English characters beyond the limit
    let nonEnglishCount = 0;
    let result = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const isNonEnglish = /[^\x00-\x7F\s]/.test(char);

      if (isNonEnglish) {
        if (nonEnglishCount < CONSTANTS.NON_ENGLISH_CHAR_LIMIT) {
          result += char;
          nonEnglishCount++;
        }
      } else {
        result += char;
      }
    }

    return result;
  }

  private addMessage(message: ChatMessage): void {
    message.tag = this.selectedTabIndex;

    if (!this.chatData[this.selectedTabIndex]) {
      this.chatData[this.selectedTabIndex] = {
        messages: [],
        tag: this.selectedTabIndex,
        sessionId: this.currentSessionId || undefined,
      };
    }

    const messageToAdd = { ...message };
    this.chatData[this.selectedTabIndex].messages.push(messageToAdd);

    // Track unsaved messages if not a thinking message
    if (
      this.currentSessionId &&
      message.content !== "thinking..." &&
      !message.isFromHistory
    ) {
      this.chatService.addUnsavedMessage(messageToAdd, this.selectedTabIndex);
    }

    this.changeDetectorRef.detectChanges();
    setTimeout(() => this.scrollToBottom(), 0);
  }

  // Public methods for component interaction
  sendMessage(): void {
    if (this.isSendButtonDisabled()) {
      return;
    }

    if (this.isStreaming && this.selectedTabIndex !== this.streamingTabIndex) {
      return;
    }

    if (!this.currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: this.currentMessage,
      isUser: true,
      parsedContent: this.sanitizer.bypassSecurityTrustHtml(
        this.currentMessage.replace(/\n/g, "<br>"),
      ),
      tag: this.selectedTabIndex,
    };
    this.addMessage(userMessage);

    this.isLoading = true;
    this.isStreaming = true;
    this.streamingTabIndex = this.selectedTabIndex;
    const limitedMessages = this.limitMessages(
      [...this.messages],
      this.selectedTabIndex,
    );
    const messages = this.formatMessages(limitedMessages);

    const request: ModelRequestDto = {
      tag: this.selectedTabIndex as 0 | 1 | 2,
      messages,
    };

    let assistantMessage: ChatMessage = {
      role: "assistant",
      content: "thinking...",
      isUser: false,
      parsedContent: this.sanitizer.bypassSecurityTrustHtml("thinking..."),
      tag: this.selectedTabIndex,
    };
    this.addMessage(assistantMessage);

    this.handleModelResponse(request, assistantMessage);
    this.currentMessage = "";
    this.resetCharacterCounts();
    this.focusInput();
  }

  private limitMessages(messages: ChatMessage[], tag: number): ChatMessage[] {
    const maxLength = tag === 0 ? 15 : 6;
    if (messages.length > maxLength) {
      return messages.slice(messages.length - maxLength);
    }
    return messages;
  }

  private handleModelResponse(
    request: ModelRequestDto,
    assistantMessage: ChatMessage,
  ): void {
    this.lastRequest = request;
    this.lastAssistantMessage = assistantMessage;

    let isFirstMessage = true;
    let messageContent = "";
    let hasAddedToUnsaved = false;

    console.log("Starting model response handling");

    this.chatBotService
      .getModelResult(request)
      .pipe(
        finalize(async () => {
          this.isStreaming = false;
          this.streamingTabIndex = null;
          this.isLoading = false;

          // Handle session management after completion
          if (this.isAfterClear || this.isFirstUser) {
            this.currentSessionId = null;
            await this.saveChatHistoryIfNeeded();

            // Get new sessionId from latest history
            const result = await firstValueFrom(
              this.chatBotService.listChatHistory(this.selectedTabIndex, 0, 1),
            );

            if (result.code === 1 && result.data?.content) {
              const newSessionId = result.data.content[0].sessionId;
              this.currentSessionId = newSessionId;
              console.log("new session id", this.currentSessionId);
              this.chatService.updateSessionId(newSessionId);
              this.isFirstUser = false;
            }

            this.isAfterClear = false;
            this.isNewSession = true;
          }
        }),
      )
      .subscribe({
        next: (response) => {
          console.log("Received response:", response);

          if (response.choices?.[0]?.delta) {
            const delta = response.choices[0].delta;
            console.log("Received delta:", delta);

            if (isFirstMessage) {
              console.log("Initializing first message");
              messageContent = "";
              assistantMessage.content = "";
              assistantMessage.parsedContent =
                this.sanitizer.bypassSecurityTrustHtml("");
              isFirstMessage = false;
              this.isLoading = false;
            }

            if (delta.content !== undefined && delta.content !== "") {
              messageContent += delta.content;
              console.log("Updated message content:", messageContent);

              // Update the last message in current chat tab
              const messages = this.chatData[this.selectedTabIndex].messages;
              const lastMessageIndex = messages.length - 1;

              if (lastMessageIndex >= 0) {
                messages[lastMessageIndex].content = messageContent;
                messages[lastMessageIndex].parsedContent =
                  this.parseMarkdown(messageContent);

                // Update UI if page is visible
                if (this.isPageVisible) {
                  this.ngZone.run(() => {
                    this.changeDetectorRef.detectChanges();
                  });
                  this.scrollToBottom();
                } else {
                  this.pendingUpdates = true;
                }
              }
            }
          }
        },
        error: (error) => {
          console.error("Error in model response:", error);
          this.isLoading = false;
          messageContent =
            error.error?.error || "Sorry, an error occurred. Please try again.";

          const messages = this.chatData[this.selectedTabIndex].messages;
          const lastMessageIndex = messages.length - 1;

          if (lastMessageIndex >= 0) {
            messages[lastMessageIndex] = {
              ...messages[lastMessageIndex],
              content: messageContent,
              parsedContent: this.parseMarkdown(messageContent),
              isError: true,
            };
            this.chatData[this.selectedTabIndex].messages = [...messages];

            if (
              this.currentSessionId &&
              messageContent !== "thinking..." &&
              !hasAddedToUnsaved
            ) {
              this.chatService.addUnsavedMessage(
                messages[lastMessageIndex],
                this.selectedTabIndex,
              );
              hasAddedToUnsaved = true;
            }

            // Update UI if page is visible
            if (this.isPageVisible) {
              this.ngZone.run(() => {
                this.changeDetectorRef.detectChanges();
              });
              this.scrollToBottom();
            } else {
              this.pendingUpdates = true;
            }
          }

          this.isStreaming = false;
        },
        complete: () => {
          console.log("Stream completed. Final message:", messageContent);

          const messages = this.chatData[this.selectedTabIndex].messages;
          const lastMessageIndex = messages.length - 1;

          if (lastMessageIndex >= 0) {
            messages[lastMessageIndex].content = messageContent;
            messages[lastMessageIndex].parsedContent =
              this.parseMarkdown(messageContent);

            if (
              this.currentSessionId &&
              messageContent !== "thinking..." &&
              !hasAddedToUnsaved
            ) {
              this.chatService.addUnsavedMessage(
                messages[lastMessageIndex],
                this.selectedTabIndex,
              );
              hasAddedToUnsaved = true;
            }

            // Update UI if page is visible
            if (this.isPageVisible) {
              this.ngZone.run(() => {
                this.changeDetectorRef.detectChanges();
              });
              this.scrollToBottom();
            } else {
              this.pendingUpdates = true;
            }
          }

          this.isStreaming = false;
        },
      });
  }

  // Utility methods
  isSendButtonDisabled(): boolean {
    const basicCondition =
      (!this.currentMessage.trim() && !this.isStreaming) ||
      this.isTabDisabled();

    const limitReached = this.isLimitReached;

    return basicCondition || limitReached;
  }

  isTabDisabled(): boolean {
    return this.isStreaming && this.selectedTabIndex !== this.streamingTabIndex;
  }

  getCharacterCountDisplay(): string {
    return `EN: ${this.englishCharCount}/${CONSTANTS.ENGLISH_CHAR_LIMIT} tokens | Other: ${this.nonEnglishCharCount}/${CONSTANTS.NON_ENGLISH_CHAR_LIMIT} chars`;
  }

  // Event handlers
  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (this.isSendButtonDisabled()) {
        return;
      }

      if (
        this.isStreaming &&
        this.selectedTabIndex !== this.streamingTabIndex
      ) {
        return;
      }
      if (this.isStreaming) {
        this.stopStreaming();
        setTimeout(() => {
          this.sendMessage();
        }, 100);
      } else {
        this.sendMessage();
      }
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    this.handleKeyUp(event);
  }

  scrollToTop(): void {
    const containers = this.messageContainers.toArray();
    containers.forEach((container) => {
      if (container && container.nativeElement) {
        container.nativeElement.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    });
  }

  toggleCountdown(): void {
    this.isCountdownExpanded = !this.isCountdownExpanded;
  }

  // Copy functionality
  private filterCheckMarkSymbol(text: string): string {
    return text.replace(/✅/g, "");
  }

  copyMessageToClipboard(
    content: string,
    index: number,
    tooltip: NzTooltipDirective,
  ): void {
    // First hide the specific tooltip that triggered the action
    tooltip.hide();

    // Hide tooltip
    this.tooltips.forEach((t) => {
      if (t !== tooltip) {
        t.hide();
      }
    });

    // Filter out check mark symbols from the content
    const filteredContent = this.filterCheckMarkSymbol(content);

    // Copy the filtered content to the clipboard
    const successful = this.clipboard.copy(filteredContent);

    if (successful) {
      setTimeout(() => {
        // Set copy message ID
        this.copiedMessageId = `msg-${this.selectedTabIndex}-${index}`;

        // Reset after 2 seconds
        setTimeout(() => {
          if (
            this.copiedMessageId === `msg-${this.selectedTabIndex}-${index}`
          ) {
            this.copiedMessageId = null;
            this.changeDetectorRef.detectChanges();
          }
        }, 2000);
      }, 100); // Small delay to ensure tooltips are hidden before icon changes
    } else {
      this.message.error("Failed to copy");
    }
  }

  shouldShowCopyButton(message: ChatMessage): boolean {
    // Don't show copy button for user messages
    if (message.isUser) return false;

    // Don't show for welcome messages
    if (message.content === "Welcome to Tudor AI!") return false;

    // Don't show for thinking messages
    if (message.content === "thinking...") return false;

    // Don't show for error messages
    if (message.isError) return false;

    // Don't show if this message is currently being streamed
    if (
      this.isStreaming &&
      this.streamingTabIndex === this.selectedTabIndex &&
      message ===
        this.chatData[this.selectedTabIndex].messages[
          this.chatData[this.selectedTabIndex].messages.length - 1
        ]
    ) {
      return false;
    }

    // Show copy button for all other assistant messages
    return true;
  }

  // Try again functionality
  public tryAgain(message: ChatMessage): void {
    // Retrieve the current messages array for the selected tab
    const messages = this.chatData[this.selectedTabIndex].messages;
    // Find the index of the clicked message
    const idx = messages.findIndex((m) => m === message);
    if (idx !== -1) {
      // Create an updated copy of the message with isError cleared
      const updatedMessage: ChatMessage = {
        ...message,
        isError: false,
        content: "",
        parsedContent: this.sanitizer.bypassSecurityTrustHtml(""),
      };
      // Replace the message in the array with the updated message
      messages[idx] = updatedMessage;
      // If this message is also stored in lastAssistantMessage, update that reference
      if (this.lastAssistantMessage === message) {
        this.lastAssistantMessage = updatedMessage;
      }
      // Update the chatData for the selected tab so that change detection removes the button
      this.chatData[this.selectedTabIndex].messages = [...messages];

      // Immediately begin retrying:
      this.isLoading = true; // Set loading state when retrying
      this.isStreaming = true;
      this.streamingTabIndex = this.selectedTabIndex;

      // Resend the request using the stored request and the updated message
      if (this.lastRequest) {
        this.handleModelResponse(this.lastRequest, updatedMessage);
      }
    }
  }

  // Chat management
  confirmStartChat(): void {
    this.isConfirmStartChat = true;
    const button = document.querySelector(
      ".start-chat-overlay button",
    ) as HTMLElement;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      this.modal.confirm({
        nzTitle: "Start New Chat",
        nzCentered: true,
        nzNoAnimation: true,
        nzContent:
          "This will start a new chat. Are you sure you want to proceed?",
        nzOnOk: () => this.handleStartChat(),
        nzOnCancel: () => {
          this.isConfirmStartChat = false;
        },
        nzStyle: {
          position: "absolute",
          top: `${y}px`,
          left: `${x}px`,
          transform: "translate(-50%, -50%)",
        },
      });
    } else {
      // Fallback to centered modal if button not found
      this.modal.confirm({
        nzTitle: "Start New Chat",
        nzCentered: true,
        nzNoAnimation: true,
        nzContent:
          "This will start a new chat. Are you sure you want to proceed?",
        nzOnOk: () => this.handleStartChat(),
        nzOnCancel: () => {
          this.isConfirmStartChat = false;
        },
      });
    }
  }

  handleStartChat(): void {
    if (this.isConfirmStartChat) {
      this.chatBotService.startChat().subscribe(
        (result) => {
          if (result.code === 1) {
            this.chatStarted = true;
            this.showInputContainer = true;
            this.isConfirmStartChat = false;
            this.showThankYou = false;
            if (result.data?.endTime) {
              this.startCountdown(result.data.endTime);
            }
          } else if (result.code === -11) {
            this.message.error(
              "Your account has no activation code, please contact us to purchase",
            );
            this.chatStarted = false;
            this.showThankYou = false;
            this.isConfirmStartChat = false;
            this.showInputContainer = false;
          } else if (result.code === -2) {
            this.message.error(
              "Your activation code has already been used on another device.",
            );
            this.chatStarted = false;
            this.showThankYou = false;
            this.isConfirmStartChat = false;
            this.showInputContainer = false;
          } else if (result.code === -6) {
            this.message.info("The activation code is being used");
            this.chatStarted = true;
            this.showInputContainer = true;
            this.isConfirmStartChat = false;
            this.showThankYou = false;
            if (result.error?.extra.endTime) {
              this.startCountdown(result.error?.extra.endTime);
            }
          } else {
            this.chatStarted = false;
            this.showThankYou = false;
            this.isConfirmStartChat = false;
            this.showInputContainer = false;
          }
        },
        (error) => {
          this.message.error(error || "Failed to start chat");
        },
      );
    }
  }

  @HostListener("window:beforeunload", ["$event"])
  handleBeforeUnload(event: BeforeUnloadEvent): void {
    this.sendBeaconData();
  }
}
