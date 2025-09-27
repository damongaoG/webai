import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { QuillModule } from "ngx-quill";
import { Router, ActivatedRoute } from "@angular/router";
import { DashboardSharedService } from "../../dashboard/components/content/dashboard-shared.service";

@Component({
  selector: "app-essay-editor",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: "./essay-editor.component.html",
  styleUrls: ["./essay-editor.component.scss"],
})
export class EssayEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dashboardService = inject(DashboardSharedService);

  titleControl = new FormControl<string>("");
  contentControl = new FormControl<string>("");

  // Quill configuration: keep it minimal and extensible
  quillModules: any = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ header: [1, 2, false] }],
      ["clean"],
    ],
  };

  @ViewChild("printArea") printArea?: ElementRef<HTMLDivElement>;
  @ViewChild("editable") editable?: ElementRef<HTMLDivElement>;

  ngOnInit(): void {
    const essay = this.dashboardService.getEssayContent()();
    this.titleControl.setValue(
      this.route.snapshot.queryParamMap.get("title") ?? essay?.title ?? "",
    );
    this.contentControl.setValue(essay?.content ?? "");
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  onBack(): void {
    this.router.navigate(["/dashboard"]);
  }

  async onExportPdf(): Promise<void> {
    const el = this.printArea?.nativeElement;
    if (!el) return;
    const previousClassName = el.className;
    el.classList.remove("sr-only");

    // Wait a microtask so styles/layout can apply before capture
    await Promise.resolve();

    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const options: any = {
        filename:
          (this.titleControl.value || "essay").replace(/\s+/g, "-") + ".pdf",
        margin: 10,
        pagebreak: { mode: ["css", "legacy"] },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await (html2pdf as any)().set(options).from(el).save();
    } finally {
      // Restore hidden state regardless of success/failure
      el.className = previousClassName;
    }
  }

  onContentInput(event: Event): void {
    const html = (event.target as HTMLElement).innerHTML;
    this.contentControl.setValue(html ?? "");
  }

  applyFormat(command: string, value?: string): void {
    document.execCommand(command, false, value);
    // Sync after exec
    const html = this.editable?.nativeElement.innerHTML ?? "";
    this.contentControl.setValue(html);
  }
}
