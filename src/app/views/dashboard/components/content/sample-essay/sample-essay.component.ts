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
    const raw = this.dashboardService.getEssayContent()()?.content || "";
    if (!raw) return [];
    // Prefer newline-based splitting for reliability; fallback to paragraph-size chunks
    const byNewline = raw
      .split(/\n{2,}|\r?\n/) // split on blank lines or single newlines
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (byNewline.length > 0) {
      return byNewline;
    }

    // Fallback: sentence grouping without adding mock content
    const sentences = raw.split(/(?<=[.!?])\s+/);
    const grouped: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const paragraph = sentences
        .slice(i, i + 2)
        .join(" ")
        .trim();
      if (paragraph) grouped.push(paragraph);
    }
    return grouped;
  }

  onEditAndExport(): void {
    console.log("Edit and export action triggered");
  }

  get isContentGenerating(): boolean {
    return this.isLoading || false;
  }

  // Title is rendered directly in template when provided; no fallback here
}
