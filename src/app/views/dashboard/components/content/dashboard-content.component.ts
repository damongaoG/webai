import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-dashboard-content",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="content-container h-full p-6 bg-[#121212] flex flex-col">
      <!-- AI Assistant section with essay title -->
      <div class="flex items-center mb-8">
        <div
          class="ai-avatar flex-shrink-0 h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center"
        >
          <img
            src="assets/images/ai/robot.png"
            alt="AI Assistant"
            class="h-8 w-8"
          />
        </div>
        <div class="ml-4">
          <h2 class="text-white text-xl font-medium">
            Your Sample Essay
            <span class="ml-2 text-green-500 text-sm">✨</span
            >http://localhost:3000
          </h2>
          <p class="text-white/50 text-sm">→</p>
        </div>
      </div>

      <!-- Instructions -->
      <div class="mb-6 text-white/70 text-sm">
        Please select the appropriate item on the left and click the "Generate"
        button before the article can be viewed.
      </div>

      <!-- Empty state content area -->
      <div
        class="flex-1 flex flex-col items-center justify-center rounded-lg border border-gray-700 p-6"
      >
        <p class="text-white/70 mb-4 text-center">
          You don't have any documents yet.
        </p>
        <p class="text-white/70 mb-6 text-center">
          Start by creating a new document or uploading a file.
        </p>

        <!-- Generate button -->
        <button
          class="flex items-center bg-green-500/20 text-green-500 py-3 px-6 rounded-full hover:bg-green-500/30 transition-colors"
        >
          <lucide-angular name="download" class="h-5 w-5 mr-2"></lucide-angular>
          Generate
          <lucide-angular
            name="arrow-right"
            class="h-5 w-5 ml-2"
          ></lucide-angular>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .content-container {
        overflow-y: auto;
      }
    `,
  ],
})
export class DashboardContentComponent {}
