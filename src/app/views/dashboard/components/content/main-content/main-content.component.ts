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
            <span class="ml-2 text-green-500 text-sm">✨</span>
          </h2>
          <p class="text-white/50 text-sm">Select a task and generate essay</p>
        </div>
      </div>

      <!-- Instructions or selected task info -->
      <div class="mb-6 text-white/70 text-sm">
        @if (!dashboardService.getSelectedTask()()) {
          Please select an appropriate item on the left and click the "Generate"
          button to view the article.
        } @else {
          Selected task:
          <span class="text-green-500">{{
            dashboardService.getSelectedTask()()?.name
          }}</span>
        }
      </div>

      <!-- Content area -->
      <div
        class="flex-1 flex flex-col items-center justify-center rounded-lg border border-gray-700 p-6"
      >
        @if (!dashboardService.getSelectedTask()()) {
          <!-- Empty state -->
          <p class="text-white/70 mb-4 text-center">
            You don't have any tasks selected yet.
          </p>
          <p class="text-white/70 mb-6 text-center">
            Start by selecting a task from the sidebar.
          </p>
        } @else if (!dashboardService.getIsGenerated()()) {
          <!-- Task selected but not generated yet -->
          <p class="text-white/70 mb-4 text-center">
            Task selected: {{ dashboardService.getSelectedTask()()?.name }}
          </p>
          <p class="text-white/70 mb-6 text-center">
            Click the Generate button to create a sample essay.
          </p>
        } @else {
          <!-- Content generated -->
          <p class="text-white/70 mb-4 text-center">
            Your sample essay has been generated based on the selected task.
          </p>
          <p class="text-white/70 mb-6 text-center">
            You can view it in the panel on the right.
          </p>
        }

        <!-- Generate button -->
        <button
          class="flex items-center bg-green-500/20 text-green-500 py-3 px-6 rounded-full hover:bg-green-500/30 transition-colors"
          [disabled]="!dashboardService.getSelectedTask()()"
          [class.opacity-50]="!dashboardService.getSelectedTask()()"
          (click)="generateEssay()"
        >
          <lucide-angular
            [name]="
              dashboardService.getIsGenerated()() ? 'refresh-cw' : 'download'
            "
            class="h-5 w-5 mr-2"
          >
          </lucide-angular>
          {{ dashboardService.getIsGenerated()() ? "Regenerate" : "Generate" }}
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
      .main-content {
        min-width: 400px;
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
