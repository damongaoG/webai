import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";
import { Subject } from "rxjs";
import { marked } from "marked";

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

  /**
   * Render the essay markdown content as HTML
   * Angular sanitizes strings bound via [innerHTML]
   */
  contentHtml(): string {
    const raw = this.dashboardService.getEssayContent()()?.content || "";
    if (!raw) return "";
    return (marked.parse(raw, { async: false, breaks: true }) || "") as string;
  }

  onEditAndExport(): void {
    console.log("Edit and export action triggered");
  }

  get isContentGenerating(): boolean {
    return this.isLoading || false;
  }

  // Title is rendered directly in template when provided; no fallback here
}
