import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";

@Component({
  selector: "app-main-content",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="main-content h-full flex flex-col">
      <!-- File upload success notification -->
      <div class="file-upload-notification">
        <div
          class="w-[520px] h-32 bg-gradient-to-l from-white/40 to-white/0 rounded-lg border-2 border-white backdrop-blur-[5px]"
          style=" display: flex;
        align-items: center;"
        >
          <div class="file-icon">
            <img src="/assets/images/icon/document.svg" alt="Document" />
          </div>
          <div class="file-info">
            <div class="file-name">XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.doc</div>
            <div class="upload-status">
              <div class="status-icon">
                <img src="/assets/images/icon/check-one.svg" alt="Success" />
              </div>
              <div class="status-text">Uploaded</div>
              <div class="upload-time">2025-05-02 14:15:12</div>

              <div class="delete-button">
                <img src="/assets/images/icon/delete.svg" alt="Delete" />
                <div class="upload-time" style="margin-left: 8px">Delete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .main-content {
        min-width: 400px;
        background-image: url("/assets/images/bg.png");
        background-size: cover;
        background-repeat: no-repeat;
        position: relative;
      }

      /* File upload notification styles */
      .file-upload-notification {
        position: absolute;
        top: 20px;
        left: 20px;
        z-index: 10;
      }

      .file-container {
        display: flex;
        align-items: center;
        background-color: white;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 520px;
        height: 128px;

        fill: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.43) 0%,
          rgba(255, 255, 255, 0) 100%
        );
        stroke-width: 2px;
        stroke: #fff;
        backdrop-filter: blur(5px);
      }

      .file-icon {
        margin-right: 12px;
      }

      .file-icon img {
        width: 79px;
        height: 69px;
      }

      .file-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 54%;
      }

      .file-name {
        color: #333;
        font-family: "Source Han Sans CN", sans-serif;
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
      }

      .upload-status {
        display: flex;
        align-items: center;
        color: #05a76f;
        font-size: 14px;
      }

      .status-icon {
        margin-right: 4px;
      }

      .status-icon img {
        width: 18px;
        height: 18px;
      }

      .status-text {
        margin-right: 8px;
      }

      .upload-time {
        color: #666;
        font-family: "Source Han Sans CN", sans-serif;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: normal;
        margin-left: 12px;

        opacity: 0.8;
      }

      .delete-button {
        cursor: pointer;
        padding: 4px;

        display: flex;
        align-items: center;
        flex-direction: row;

        margin-left: 60px;
      }

      .delete-button img {
        width: 20px;
        height: 20px;
      }
    `,
  ],
})
export class MainContentComponent {
  dashboardService = inject(DashboardSharedService);

  generateEssay() {
    this.dashboardService.generateContent();
  }
}
