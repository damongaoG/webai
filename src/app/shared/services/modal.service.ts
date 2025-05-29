import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  Injectable,
  Injector,
} from "@angular/core";
import { ModalComponent } from "@/app/shared";

export interface ModalConfig {
  title?: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  centered?: boolean;
  maskClosable?: boolean;
  width?: string;
  customClass?: string;
  showFooter?: boolean;
  showOkButton?: boolean;
  showCancelButton?: boolean;
}

export interface ConfirmConfig extends ModalConfig {
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
}

@Injectable({
  providedIn: "root",
})
export class ModalService {
  private modals: ComponentRef<ModalComponent>[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {}

  /**
   * Create a confirmation modal
   */
  confirm(config: ConfirmConfig): void {
    const modalRef = this.createModal({
      title: config.title || "Confirm",
      centered: config.centered ?? true,
      maskClosable: config.maskClosable ?? true,
      okText: config.okText || "OK",
      cancelText: config.cancelText || "Cancel",
      showFooter: true,
      showOkButton: true,
      showCancelButton: true,
      ...config,
    });

    // Set content if provided
    if (config.content) {
      const contentElement = document.createElement("p");
      contentElement.textContent = config.content;
      contentElement.className = "text-gray-700";

      const modalElement =
        modalRef.location.nativeElement.querySelector(".px-6.py-4");
      if (modalElement) {
        modalElement.appendChild(contentElement);
      }
    }

    // Handle OK button click
    modalRef.instance.ok.subscribe(async () => {
      if (config.onOk) {
        modalRef.instance.confirmLoading = true;
        try {
          await config.onOk();
        } catch (error) {
          console.error("Modal OK handler error:", error);
        } finally {
          modalRef.instance.confirmLoading = false;
        }
      }
      this.destroyModal(modalRef);
    });

    // Handle Cancel button click
    modalRef.instance.cancel.subscribe(() => {
      if (config.onCancel) {
        config.onCancel();
      }
      this.destroyModal(modalRef);
    });

    modalRef.instance.visible = true;
  }

  /**
   * Create a simple info modal
   */
  info(config: ModalConfig): void {
    this.createSimpleModal({
      ...config,
      showCancelButton: false,
      okText: config.okText || "OK",
    });
  }

  /**
   * Create a success modal
   */
  success(config: ModalConfig): void {
    this.createSimpleModal({
      ...config,
      title: config.title || "Success",
      showCancelButton: false,
      okText: config.okText || "OK",
    });
  }

  /**
   * Create an error modal
   */
  error(config: ModalConfig): void {
    this.createSimpleModal({
      ...config,
      title: config.title || "Error",
      showCancelButton: false,
      okText: config.okText || "OK",
    });
  }

  /**
   * Create a warning modal
   */
  warning(config: ModalConfig): void {
    this.createSimpleModal({
      ...config,
      title: config.title || "Warning",
      showCancelButton: false,
      okText: config.okText || "OK",
    });
  }

  /**
   * Close all modals
   */
  closeAll(): void {
    this.modals.forEach((modal) => this.destroyModal(modal));
  }

  private createSimpleModal(config: ModalConfig): void {
    const modalRef = this.createModal(config);

    // Set content if provided
    if (config.content) {
      const contentElement = document.createElement("p");
      contentElement.textContent = config.content;
      contentElement.className = "text-gray-700";

      const modalElement =
        modalRef.location.nativeElement.querySelector(".px-6.py-4");
      if (modalElement) {
        modalElement.appendChild(contentElement);
      }
    }

    // Handle OK button click
    modalRef.instance.ok.subscribe(() => {
      this.destroyModal(modalRef);
    });

    // Handle Cancel button click
    modalRef.instance.cancel.subscribe(() => {
      this.destroyModal(modalRef);
    });

    modalRef.instance.visible = true;
  }

  private createModal(config: ModalConfig): ComponentRef<ModalComponent> {
    // Create the modal component
    const modalRef = createComponent(ModalComponent, {
      environmentInjector: this.appRef.injector,
    });

    // Configure the modal
    Object.assign(modalRef.instance, config);

    // Attach to the application
    this.appRef.attachView(modalRef.hostView);

    // Add to DOM
    document.body.appendChild(modalRef.location.nativeElement);

    // Track the modal
    this.modals.push(modalRef);

    return modalRef;
  }

  private destroyModal(modalRef: ComponentRef<ModalComponent>): void {
    const index = this.modals.indexOf(modalRef);
    if (index > -1) {
      this.modals.splice(index, 1);
    }

    this.appRef.detachView(modalRef.hostView);
    modalRef.destroy();
  }
}
