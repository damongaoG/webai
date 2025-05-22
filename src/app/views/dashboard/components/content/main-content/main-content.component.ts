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
      <!-- File upload notification -->
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

      <!-- Keywords group with star and expand icons -->
      <div
        class="h-20 bg-white/40 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] border-2 border-white backdrop-blur-[5px] flex items-center justify-between px-6"
        style="margin-top: 2rem;"
      >
        <div class="flex items-center">
          <div class="icon-container mr-3">
            <div class="task-container mr-3">
              <img
                src="/assets/images/icon/dark-keyword.svg"
                class="w-5"
                alt="task icon"
              />
            </div>
            <div
              class="justify-start text-zinc-800 text-xl font-bold keywords-title"
            >
              Keywords
            </div>
            <img
              src="/assets/images/icon/star.svg"
              alt="Star"
              class="w-6 h-6"
            />
          </div>
        </div>
        <div
          class="cursor-pointer flex items-center  w-24 h-10 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#64E9A7_0%,_rgba(147,_238,_196,_0.50)_100%)] blur-[5px]"
        ></div>
        <div class="expand expand-icon">
          <img
            src="/assets/images/icon/expand-one.svg"
            alt="Expand"
            class="w-6 h-6"
          />
          <div
            class="justify-start text-stone-500 text-sm font-normal keywords-title"
          >
            Expand
          </div>
        </div>
      </div>

      <!-- <div
        class="h-80 bg-white/40 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] border-2 border-white backdrop-blur-[5px]"
      ></div> -->
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
        margin-top: 2rem;
        z-index: 10;
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

      /* Keywords container styles */

      .keywords-title {
        font-family: "Source Han Sans CN", sans-serif;
      }

      .expand {
        cursor: pointer;
        gap: 6px;
        display: flex;
        flex-direction: row;
        position: absolute;
        right: 32px;
      }

      .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .expand-icon {
        transition: transform 0.2s ease;
      }

      .expand-icon:hover {
        transform: scale(1.1);
      }

      .task-container {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background-color: #05a76f;

        fill: rgba(255, 255, 255, 0.4);
        stroke-width: 0.5px;
        stroke: #fff;
        filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.05));
        backdrop-filter: blur(5px);
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
