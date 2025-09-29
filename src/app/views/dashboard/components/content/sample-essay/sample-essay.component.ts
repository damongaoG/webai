import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  effect,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { LucideAngularModule } from "lucide-angular";
import { DashboardSharedService } from "../dashboard-shared.service";
import { Subject } from "rxjs";
import { marked } from "marked";
import { Router } from "@angular/router";

@Component({
  selector: "app-sample-essay",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: "./sample-essay.component.html",
  styleUrls: ["./sample-essay.component.scss"],
})
export class SampleEssayComponent implements OnInit, OnDestroy, AfterViewInit {
  dashboardService = inject(DashboardSharedService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  isLoading = false;

  @ViewChild("bottomAnchor") bottomAnchor?: ElementRef<HTMLDivElement>;

  // Auto-scroll to bottom whenever essay content updates
  private autoScrollEffect = effect(() => {
    const isGenerated = this.dashboardService.getIsGenerated()();
    const content = this.dashboardService.getEssayContent()()?.content ?? "";
    if (!isGenerated) return;
    // Defer until DOM updates render
    setTimeout(() => this.scrollToBottom(), 0);
  });

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    // Initial scroll if content already exists
    setTimeout(() => this.scrollToBottom(), 0);
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

  private scrollToBottom(): void {
    const el = this.bottomAnchor?.nativeElement;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }

  onEditAndExport(): void {
    this.router.navigate(["/editor"], {
      queryParams: {
        title: this.dashboardService.getEssayContent()()?.title ?? "",
      },
    });
  }

  get isContentGenerating(): boolean {
    // Disable Edit & Export until body stream completes
    const generated = this.dashboardService.getIsGenerated()();
    const completed = this.dashboardService.getBodyCompleted()();
    const streaming = this.dashboardService.getBodyStreaming()();
    // If not generated yet, keep disabled. If streaming or not completed, keep disabled.
    return !generated || streaming || !completed;
  }
}
