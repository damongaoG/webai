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
import { marked } from "marked";
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
  private initialContentHtml = "";

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
  private quill?: any;

  ngOnInit(): void {
    const essay = this.dashboardService.getEssayContent()();
    this.titleControl.setValue(this.essayStateService.essayTitle() ?? "");

    const rawContent = essay?.content ?? "";
    this.initialContentHtml = this.convertMarkdownToHtml(rawContent);
    this.contentControl.setValue(this.initialContentHtml);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  onBack(): void {
    this.router.navigate(["/dashboard"]);
  }

  async onExportPdf(): Promise<void> {
    const filename =
      (this.titleControl.value || "essay").replace(/\s+/g, "-") + ".pdf";
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
    const pdfMake: any =
      (pdfMakeModule as any).default || (pdfMakeModule as any);
    const pdfFonts: any =
      (pdfFontsModule as any).default || (pdfFontsModule as any);
    pdfMake.vfs = pdfFonts.vfs;

    const delta = this.getCurrentDelta();
    const content = this.deltaToPdfMake(delta);

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [20, 30, 20, 30],
      content: [
        {
          text: this.titleControl.value || "",
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 12],
        },
        ...content,
      ],
      defaultStyle: { fontSize: 12 },
    };

    pdfMake.createPdf(docDefinition).download(filename);
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

  onEditorCreated(editor: any): void {
    this.quill = editor;

    const initial = this.initialContentHtml.trim();
    if (!initial) {
      return;
    }

    const currentText =
      typeof editor?.getText === "function" ? editor.getText().trim() : "";

    if (!currentText) {
      editor?.clipboard?.dangerouslyPasteHTML(initial);
      this.contentControl.setValue(initial, { emitEvent: false });
    }
  }

  private getCurrentDelta(): any {
    if (this.quill && typeof this.quill.getContents === "function") {
      return this.quill.getContents();
    }
    // Fallback: derive from HTML in contentControl (best-effort as plain text)
    const html = this.contentControl.value || "";
    const text = html.replace(/<[^>]+>/g, "\n").replace(/\n+/, "\n");
    return { ops: [{ insert: text }] };
  }

  private deltaToPdfMake(delta: any): any[] {
    const result: any[] = [];
    let currentList: { type: "ordered" | "bullet"; items: any[] } | null = null;

    const flushList = () => {
      if (currentList && currentList.items.length) {
        if (currentList.type === "ordered") {
          result.push({ ol: currentList.items, margin: [0, 4, 0, 4] });
        } else {
          result.push({ ul: currentList.items, margin: [0, 4, 0, 4] });
        }
      }
      currentList = null;
    };

    for (const op of delta?.ops || []) {
      const insert = op.insert;
      const attrs = op.attributes || {};

      // Handle embedded newlines as separate paragraphs
      const parts = typeof insert === "string" ? insert.split("\n") : [insert];
      for (let i = 0; i < parts.length; i++) {
        const piece = parts[i];
        const isLast = i === parts.length - 1;
        const baseText = typeof piece === "string" ? piece : "";

        const styled = this.applyAttributesToText(baseText, attrs);

        if (!isLast) {
          // line ended: decide block type
          if (attrs.list === "ordered" || attrs.list === "bullet") {
            if (!currentList || currentList.type !== attrs.list) {
              flushList();
              currentList = { type: attrs.list, items: [] } as any;
            }
            currentList!.items.push({
              text: styled.text,
              bold: styled.bold,
              italics: styled.italics,
              decoration: styled.decoration,
            });
          } else {
            flushList();
            result.push({
              text: styled.text,
              bold: styled.bold,
              italics: styled.italics,
              decoration: styled.decoration,
              margin: [0, 0, 0, 8],
            });
          }
        } else if (baseText) {
          // middle line without trailing newline
          if (currentList !== null && currentList.items) {
            currentList.items.push({
              text: styled.text,
              bold: styled.bold,
              italics: styled.italics,
              decoration: styled.decoration,
            });
          } else {
            result.push({
              text: styled.text,
              bold: styled.bold,
              italics: styled.italics,
              decoration: styled.decoration,
            });
          }
        }
      }
    }

    flushList();
    return result.length ? result : [{ text: "" }];
  }

  private applyAttributesToText(text: string, attrs: any): any {
    const out: any = { text: text ?? "" };
    if (attrs.bold) out.bold = true;
    if (attrs.italic) out.italics = true;
    if (attrs.underline) out.decoration = "underline";
    if (attrs.header === 1) {
      out.fontSize = 18;
      out.bold = true;
    }
    if (attrs.header === 2) {
      out.fontSize = 16;
      out.bold = true;
    }
    return out;
  }

  private convertMarkdownToHtml(markdown: string | null | undefined): string {
    if (!markdown) {
      return "";
    }

    return (marked.parse(markdown, { async: false, breaks: true }) ||
      "") as string;
  }
}
