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
import { Router } from "@angular/router";
import { DashboardSharedService } from "../../dashboard/components/content/dashboard-shared.service";
import { EssayStateService } from "@/app/services/essay-state.service";

@Component({
  selector: "app-essay-editor",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: "./essay-editor.component.html",
  styleUrls: ["./essay-editor.component.scss"],
})
export class EssayEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  private router = inject(Router);
  private dashboardService = inject(DashboardSharedService);
  private essayStateService = inject(EssayStateService);

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
    this.titleControl.setValue(this.essayStateService.essayTitle() ?? "");
    this.contentControl.setValue(essay?.content ?? "");
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  onBack(): void {
    this.router.navigate(["/dashboard"]);
  }

  async onExportPdf(): Promise<void> {
    const source = this.printArea?.nativeElement;
    if (!source) return;

    // Clone the source and render off-screen to avoid visual flicker
    const clone = source.cloneNode(true) as HTMLDivElement;
    clone.classList.remove("sr-only");
    clone.setAttribute("aria-hidden", "true");
    clone.style.position = "fixed";
    clone.style.left = "200vw"; // keep it far off-screen but rendered
    clone.style.top = "0";
    clone.style.opacity = "1";
    clone.style.pointerEvents = "none";
    // Ensure consistent width for pagination
    const width = source.offsetWidth || source.clientWidth;
    if (width) clone.style.width = `${width}px`;

    document.body.appendChild(clone);

    // Wait a frame so layout/styles apply before capture
    await new Promise(requestAnimationFrame);

    try {
      const { default: html2pdf } = await import("html2pdf.js");
      const options: any = {
        filename:
          (this.titleControl.value || "essay").replace(/\s+/g, "-") + ".pdf",
        margin: 10,
        pagebreak: { mode: ["css", "legacy"] },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: clone.scrollWidth,
          windowHeight: clone.scrollHeight,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await (html2pdf as any)().set(options).from(clone).save();
    } finally {
      clone.remove();
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
