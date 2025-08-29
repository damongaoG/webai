import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";
import { Subject } from "rxjs";

@Component({
  selector: "app-sample-essay",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: "./sample-essay.component.html",
  styleUrls: ["./sample-essay.component.scss"],
})
export class SampleEssayComponent implements OnInit, OnDestroy {
  dashboardService = inject(DashboardSharedService);

  private destroy$ = new Subject<void>();

  isLoading = false;

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getContentParagraphs(): string[] {
    const content = this.dashboardService.getEssayContent()()?.content || "";

    // Return empty array if no content
    if (!content) return [];

    // Split content into sentences and group them into paragraphs
    const sentences = content.split(". ");
    const paragraphs: string[] = [];

    // Group sentences into paragraphs (2 sentences per paragraph)
    for (let i = 0; i < sentences.length; i += 2) {
      const paragraph = sentences.slice(i, i + 2).join(". ");
      if (paragraph.trim()) {
        paragraphs.push(paragraph);
      }
    }

    // Add additional paragraphs for demonstration purposes
    if (paragraphs.length > 0) {
      paragraphs.push(
        "The COVID-19 pandemic created an unprecedented economic shock, prompting governments across the world to adopt large-scale fiscal stimulus programs. These policies were aimed at supporting household income, preserving business operations, and maintaining aggregate demand. While monetary policy remained accommodative, fiscal actions were central to stabilizing the economy. This paper explores the extent to which fiscal policy has been effective in driving recovery and whether its consequences—particularly inflation and public debt—pose long-term risks.",
      );

      paragraphs.push(
        "This paper contributes to the growing literature on post-pandemic fiscal policy effectiveness by providing a comprehensive analysis of multiple economic indicators across different countries and time periods. The findings have important implications for future policy design and implementation.",
      );
    }

    return paragraphs;
  }

  onEditAndExport(): void {
    console.log("Edit and export action triggered");
  }

  get isContentGenerating(): boolean {
    return this.isLoading || false;
  }

  get displayTitle(): string {
    return (
      this.dashboardService.getEssayContent()()?.title ||
      "Fiscal Policy Effectiveness in a Post-Pandemic Economy: A Macroeconomic Analysis"
    );
  }
}
