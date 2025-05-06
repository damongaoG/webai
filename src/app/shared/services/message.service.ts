import { Injectable } from "@angular/core";
import { NzMessageService } from "ng-zorro-antd/message";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private defaultConfig = {
    nzTop: 16, // Position messages at the top
    nzDuration: 3000, // Setting back to 3 seconds (was 30000)
    nzAnimate: true,
    nzMaxStack: 3, // Limit stacked messages
  };

  constructor(private nzMessageService: NzMessageService) {}

  /**
   * Shows a success message with consistent styling
   * @param content Message content to display
   * @param options Optional configuration overrides
   */
  success(content: string, options = {}) {
    this.nzMessageService.success(content, {
      ...this.defaultConfig,
      ...options,
    });
  }

  /**
   * Shows an error message with consistent styling
   * @param content Message content to display
   * @param options Optional configuration overrides
   */
  error(content: string, options = {}) {
    this.nzMessageService.error(content, {
      ...this.defaultConfig,
      ...options,
    });
  }

  /**
   * Shows a warning message with consistent styling
   * @param content Message content to display
   * @param options Optional configuration overrides
   */
  warning(content: string, options = {}) {
    this.nzMessageService.warning(content, {
      ...this.defaultConfig,
      ...options,
    });
  }

  /**
   * Shows an info message with consistent styling
   * @param content Message content to display
   * @param options Optional configuration overrides
   */
  info(content: string, options = {}) {
    this.nzMessageService.info(content, {
      ...this.defaultConfig,
      ...options,
    });
  }
}
