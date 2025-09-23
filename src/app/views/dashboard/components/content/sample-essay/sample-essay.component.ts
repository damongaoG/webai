import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
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
export class SampleEssayComponent implements OnInit, OnDestroy, AfterViewInit {
  dashboardService = inject(DashboardSharedService);

  private destroy$ = new Subject<void>();

  isLoading = false;

  @ViewChild("bottomAnchor") bottomAnchor?: ElementRef<HTMLDivElement>;

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
    console.log("Edit and export action triggered");
  }

  get isContentGenerating(): boolean {
    return this.isLoading || false;
  }
}
