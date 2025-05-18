import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-dashboard-sidebar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="sidebar h-screen w-64 bg-black text-white">
      <!-- Logo section -->
      <div class="flex items-center p-4">
        <div
          class="logo-container h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center"
        >
          <lucide-angular
            name="leaf"
            class="h-6 w-6 text-white"
          ></lucide-angular>
        </div>
        <div class="ml-2 text-white/70">xxxx</div>
      </div>

      <!-- Navigation -->
      <nav class="mt-6">
        <!-- Project section -->
        <div class="px-4 py-2">
          <div class="flex items-center">
            <lucide-angular
              name="folder"
              class="h-5 w-5 text-white/70"
            ></lucide-angular>
            <span class="ml-2 text-sm text-white/70">项目</span>
          </div>
        </div>

        <!-- Tasks section -->
        <div class="mt-4 px-4 py-2 bg-green-500/20">
          <div class="flex items-center">
            <lucide-angular
              name="circle"
              class="h-5 w-5 text-green-500"
            ></lucide-angular>
            <span class="ml-2 text-sm text-white">随机任务</span>
            <lucide-angular
              name="chevron-right"
              class="h-5 w-5 ml-auto text-white"
            ></lucide-angular>
          </div>
        </div>

        <!-- Sections with icons -->
        <div class="mt-2 px-4 py-2">
          <div class="flex items-center">
            <lucide-angular
              name="settings"
              class="h-5 w-5 text-white/70"
            ></lucide-angular>
            <span class="ml-2 text-sm text-white/70">使用记录</span>
          </div>
        </div>

        <div class="mt-2 px-4 py-2">
          <div class="flex items-center">
            <lucide-angular
              name="book"
              class="h-5 w-5 text-white/70"
            ></lucide-angular>
            <span class="ml-2 text-sm text-white/70">学术Review</span>
          </div>
        </div>

        <div class="mt-2 px-4 py-2">
          <div class="flex items-center">
            <lucide-angular
              name="image"
              class="h-5 w-5 text-white/70"
            ></lucide-angular>
            <span class="ml-2 text-sm text-white/70">相关案例</span>
          </div>
        </div>

        <!-- Documents List -->
        <div class="mt-6">
          <div class="px-4 py-2 border-l-2 border-l-transparent">
            <div class="flex items-center">
              <lucide-angular
                name="file-text"
                class="h-5 w-5 text-white/70"
              ></lucide-angular>
              <span class="ml-2 text-sm text-white/70">Essay01</span>
            </div>
          </div>
          <div class="px-4 py-2 border-l-2 border-l-green-500 bg-green-500/10">
            <div class="flex items-center">
              <lucide-angular
                name="file-text"
                class="h-5 w-5 text-green-500"
              ></lucide-angular>
              <span class="ml-2 text-sm text-white">Essay02</span>
            </div>
          </div>
          <div class="px-4 py-2 border-l-2 border-l-transparent">
            <div class="flex items-center">
              <lucide-angular
                name="file-text"
                class="h-5 w-5 text-white/70"
              ></lucide-angular>
              <span class="ml-2 text-sm text-white/70">Example Essay</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  `,
  styles: [
    `
      .sidebar {
        border-right: 1px solid rgba(255, 255, 255, 0.1);
      }
    `,
  ],
})
export class DashboardSidebarComponent {}
