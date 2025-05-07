import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from "@angular/core";
import {
  ToastMessageComponent,
  ToastType,
} from "../components/toast-message/toast-message.component";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  private applicationRef = inject(ApplicationRef);
  private environmentInjector = inject(EnvironmentInjector);
  private toastRefs: ComponentRef<ToastMessageComponent>[] = [];

  success(message: string, duration = 3000) {
    this.show(message, "success", duration);
  }

  error(message: string, duration = 4000) {
    this.show(message, "error", duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, "info", duration);
  }

  warning(message: string, duration = 3500) {
    this.show(message, "warning", duration);
  }

  private show(message: string, type: ToastType, duration: number) {
    // Create toast component dynamically
    const toastComponentRef = createComponent(ToastMessageComponent, {
      environmentInjector: this.environmentInjector,
    });

    // Set input properties
    toastComponentRef.instance.message = message;
    toastComponentRef.instance.type = type;
    toastComponentRef.instance.duration = duration;

    // Add to the DOM
    document.body.appendChild(toastComponentRef.location.nativeElement);

    // Attach and detect changes
    this.applicationRef.attachView(toastComponentRef.hostView);

    // Store reference
    this.toastRefs.push(toastComponentRef);

    // Clean up after the toast is hidden
    setTimeout(() => {
      this.cleanupToast(toastComponentRef);
    }, duration + 500);
  }

  private cleanupToast(toastRef: ComponentRef<ToastMessageComponent>) {
    const index = this.toastRefs.indexOf(toastRef);
    if (index > -1) {
      // Remove from array
      this.toastRefs.splice(index, 1);

      // Detach and destroy
      this.applicationRef.detachView(toastRef.hostView);
      toastRef.destroy();
    }
  }
}
