import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-dashboard-header",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="header-container flex items-center justify-between p-4 border-b border-gray-700"
    >
      <!-- Title -->
      <div class="title">Essay02</div>

      <!-- Right Side Controls -->
      <div class="flex items-center space-x-4">
       
        <!-- Settings Icon -->
        <button class="text-white/70 hover:text-white">
          <img src="/assets/images/icon/system-setting.svg" alt="">
        </button>

        <!-- User Profile -->
        <div
          class="h-8 w-8 rounded-full bg-cover bg-center"
          style="background-image: url('assets/images/avatars/01.jpg');"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .title {
        color: #000;
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: normal;
      }

      .header-container {
        background-color: #fff;

        fill: rgba(255, 255, 255, 0.40);
        stroke-width: 2px;
        stroke: #FFF;
        filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
        backdrop-filter: blur(5px);
      }
    `,
  ],
})
export class DashboardHeaderComponent {}
