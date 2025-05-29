import {
  Injectable,
  ComponentRef,
  ApplicationRef,
  createComponent,
} from "@angular/core";
import { MessageComponent, MessageType } from "@/app/shared";

export interface MessageConfig {
  content: string;
  duration?: number;
  type?: MessageType;
  closable?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private messages: ComponentRef<MessageComponent>[] = [];
  private container?: HTMLElement;

  constructor(private appRef: ApplicationRef) {
    this.createContainer();
  }

  /**
   * Show a success message
   */
  success(content: string, duration?: number): void {
    this.createMessage({
      content,
      type: "success",
      duration: duration ?? 3000,
    });
  }

  /**
   * Show an error message
   */
  error(content: string, duration?: number): void {
    this.createMessage({
      content,
      type: "error",
      duration: duration ?? 3000,
    });
  }

  /**
   * Show a warning message
   */
  warning(content: string, duration?: number): void {
    this.createMessage({
      content,
      type: "warning",
      duration: duration ?? 3000,
    });
  }

  /**
   * Show an info message
   */
  info(content: string, duration?: number): void {
    this.createMessage({
      content,
      type: "info",
      duration: duration ?? 3000,
    });
  }

  /**
   * Show a loading message
   */
  loading(content: string, duration?: number): ComponentRef<MessageComponent> {
    return this.createMessage({
      content,
      type: "loading",
      duration: duration ?? 0, // Loading messages don't auto-close by default
    });
  }

  /**
   * Create a custom message
   */
  create(config: MessageConfig): ComponentRef<MessageComponent> {
    return this.createMessage(config);
  }

  /**
   * Remove all messages
   */
  remove(): void {
    this.messages.forEach((message) => this.destroyMessage(message));
  }

  private createMessage(config: MessageConfig): ComponentRef<MessageComponent> {
    // Create the message component
    const messageRef = createComponent(MessageComponent, {
      environmentInjector: this.appRef.injector,
    });

    // Configure the message
    messageRef.instance.type = config.type || "info";
    messageRef.instance.content = config.content;
    messageRef.instance.duration = config.duration ?? 3000;
    messageRef.instance.closable = config.closable ?? false;

    // Handle close event
    messageRef.instance.closed.subscribe(() => {
      this.destroyMessage(messageRef);
    });

    // Attach to the application
    this.appRef.attachView(messageRef.hostView);

    // Add to container
    if (this.container) {
      this.container.appendChild(messageRef.location.nativeElement);
    }

    // Track the message
    this.messages.push(messageRef);

    return messageRef;
  }

  private destroyMessage(messageRef: ComponentRef<MessageComponent>): void {
    const index = this.messages.indexOf(messageRef);
    if (index > -1) {
      this.messages.splice(index, 1);
    }

    // Add fade out animation
    const element = messageRef.location.nativeElement;
    element.style.transition = "all 0.3s ease-out";
    element.style.opacity = "0";
    element.style.transform = "translateY(-10px)";

    setTimeout(() => {
      this.appRef.detachView(messageRef.hostView);
      messageRef.destroy();
    }, 300);
  }

  private createContainer(): void {
    this.container = document.createElement("div");
    this.container.className =
      "fixed top-4 right-4 z-50 max-w-sm w-full pointer-events-none";
    this.container.style.pointerEvents = "none";

    // Make message elements interactive
    this.container.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Allow pointer events on message elements
    const style = document.createElement("style");
    style.textContent = `
      .fixed.top-4.right-4.z-50 > * {
        pointer-events: auto;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(this.container);
  }
}
