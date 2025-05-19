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
        <div class="ml-2 text-white/70">Tudor AI</div>
      </div>

      <!-- Navigation -->
      <nav class="mt-6">
        <!-- Project section -->
        <div class="px-4 py-4">
          <div class="flex items-center">
            <img class="w-8" src="/assets/images/icon/data.svg" alt="" />
            <span class="ml-2 text-sm text-white/70">Projects</span>
          </div>
        </div>

        <!-- Documents List -->
        <div class="mt-1">
          <div class="px-4 py-4 border-l-2 border-l-transparent">
            <div class="flex items-center">
              <img class="w-8" src="/assets/images/icon/notes.svg" alt="" />
              <span class="ml-2 text-sm text-white/70">Essay01</span>
            </div>
          </div>
          <div class="px-4 py-4 border-l-2 border-l-green-500 bg-green-500/10">
            <div
              class="flex items-center"
              style="justify-content: space-between"
            >
              <div class="flex items-center">
                <div class="activate-note">
                  <img class="w-5" src="/assets/images/icon/note-unactivate.svg" alt="" />
                </div>
                <span class="ml-2 text-sm text-white">Essay02</span>
              </div>

              <img src="/assets/images/icon/dark-arrow.svg" alt="" />
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

      .activate-note {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;

        background: #05a76f;
        border-radius: 8px;
        stroke: rgba(255, 255, 255, 0.3);
        filter: drop-shadow(0px 5px 8px rgba(0, 8, 26, 0.4));
      }
    `,
  ],
})
export class DashboardSidebarComponent {}
