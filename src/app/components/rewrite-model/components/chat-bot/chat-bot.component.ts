import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { Subscription } from "rxjs";

// Import services
import { ChatService } from "../../services/chat.service";
import { ChatBotService } from "../../services/chat-bot.service";
import { ChatEventsService } from "@/app/services/chat-events.service";

// Import interfaces
import { ChatMessage } from "@/app/interfaces/chat-dto";

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
    NzSpinModule,
  ],
})
export class ChatBotComponent implements OnInit, OnDestroy {
  // Chat state
  messages: ChatMessage[] = [];
  currentMessage = "";
  isLoading = false;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private chatService: ChatService,
    private chatBotService: ChatBotService,
    private chatEventsService: ChatEventsService,
  ) {}

  ngOnInit(): void {
    this.initializeSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private initializeSubscriptions(): void {
    // Subscribe to chat messages
    const messagesSubscription = this.chatService.chatMessages$.subscribe(
      (messages) => {
        this.messages = messages;
      },
    );
    this.subscriptions.push(messagesSubscription);

    // Subscribe to clear chat events
    const clearChatSubscription =
      this.chatEventsService.saveAndClear$.subscribe(() => {
        this.clearChat();
      });
    this.subscriptions.push(clearChatSubscription);
  }

  // Send a message
  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: this.currentMessage,
      isUser: true,
      tag: 2, // Rewrite tag
    };

    // Add user message to chat
    this.messages = [...this.messages, userMessage];
    this.chatService.updateChatMessages(this.messages);

    // Clear input
    const messageToSend = this.currentMessage;
    this.currentMessage = "";
    this.isLoading = true;

    // TODO: Implement actual API call to get AI response
    // For now, just add a placeholder response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: "assistant",
        content: `This is a rewritten version of: "${messageToSend}"`,
        isUser: false,
        tag: 2,
      };

      this.messages = [...this.messages, aiResponse];
      this.chatService.updateChatMessages(this.messages);
      this.isLoading = false;
    }, 1000);
  }

  // Clear chat
  clearChat(): void {
    this.messages = [];
    this.currentMessage = "";
    this.isLoading = false;
    this.chatService.updateChatMessages([]);
  }

  // Handle enter key press
  onEnterPress(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
