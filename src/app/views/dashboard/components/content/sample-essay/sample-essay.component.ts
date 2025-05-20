import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";

@Component({
  selector: "app-sample-essay",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="sample-essay h-full rounded-lg border bg-[#1A1A1A] flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="p-4 border-b border-gray-700">
        <h2 class="text-white text-lg font-medium">Sample Essay</h2>
        <p class="text-white/50 text-sm">
          @if (!dashboardService.getIsGenerated()()) {
            Generate content to view sample essay
          } @else {
            {{ dashboardService.getEssayContent()()?.title }}
          }
        </p>
      </div>

      <!-- Essay Content -->
      <div class="flex-1 p-4 overflow-y-auto">
        @if (!dashboardService.getIsGenerated()()) {
          <!-- Empty state -->
          <div
            class="h-full flex flex-col items-center justify-center text-center"
          >
            <lucide-angular
              name="file-text"
              class="h-12 w-12 text-gray-600 mb-4"
            ></lucide-angular>
            <p class="text-white/70 mb-2">No content generated yet</p>
            <p class="text-white/50 text-sm">
              Select a task and click the Generate button to view a sample essay
            </p>
          </div>
        } @else {
          <!-- Sample essay content -->
          <div class="essay-content text-white/90">
            <p class="mb-4 text-lg font-medium">
              {{ dashboardService.getEssayContent()()?.title }}
            </p>
            <div class="space-y-4">
              @for (paragraph of getContentParagraphs(); track $index) {
                <p>{{ paragraph }}</p>
              }
            </div>
          </div>
        }
      </div>

      <!-- Actions -->
      @if (dashboardService.getIsGenerated()()) {
        <div class="p-4 border-t border-gray-700 flex justify-end">
          <button
            class="flex items-center text-white/70 hover:text-white transition-colors"
          >
            <lucide-angular name="copy" class="h-4 w-4 mr-2"></lucide-angular>
            Copy
          </button>
          <button
            class="flex items-center text-white/70 hover:text-white transition-colors ml-4"
          >
            <lucide-angular
              name="download"
              class="h-4 w-4 mr-2"
            ></lucide-angular>
            Download
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .sample-essay {
        min-width: 300px;
      }

      .essay-content {
        line-height: 1.6;
      }
    `,
  ],
})
export class SampleEssayComponent {
  dashboardService = inject(DashboardSharedService);

  getContentParagraphs(): string[] {
    const content = this.dashboardService.getEssayContent()()?.content || "";

    // Split content into paragraphs for better presentation
    // For demo purposes, we'll artificially create multiple paragraphs
    if (!content) return [];

    const sentences = content.split(". ");
    const paragraphs: string[] = [];

    for (let i = 0; i < sentences.length; i += 2) {
      const paragraph = sentences.slice(i, i + 2).join(". ");
      paragraphs.push(paragraph);
    }

    // Add some longer paragraphs for realism
    paragraphs.push(
      "This is an additional paragraph to demonstrate the flow of an academic essay. It provides further context and explanation of the concepts introduced earlier. Academic writing typically follows a structured format with clear introduction, body paragraphs, and conclusion.",
    );

    paragraphs.push(
      "The conclusion summarizes the key points discussed and may provide recommendations or implications based on the analysis. Effective academic writing is clear, concise, and well-supported with evidence.",
    );

    return paragraphs;
  }
}
