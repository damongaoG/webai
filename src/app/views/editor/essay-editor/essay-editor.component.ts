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
import Quill from "quill";
import { DashboardSharedService } from "../../dashboard/components/content/dashboard-shared.service";
import { EssayStateService } from "@/app/services/essay-state.service";

const FONT_FAMILY_WHITELIST: readonly string[] = [
  "Arial",
  "Georgia",
  "Helvetica",
  "Times New Roman",
  "Courier New",
];

const FONT_SIZE_WHITELIST: readonly string[] = [
  "12px",
  "14px",
  "16px",
  "18px",
  "24px",
  "32px",
];

const TOOLBAR_FONT_OPTIONS: (string | false)[] = [
  false,
  ...FONT_FAMILY_WHITELIST,
];
const TOOLBAR_SIZE_OPTIONS: (string | false)[] = [
  false,
  ...FONT_SIZE_WHITELIST,
];

const FONT_FAMILY_MAP: Record<string, string> = {
  Arial: '"Arial", sans-serif',
  Georgia: '"Georgia", serif',
  Helvetica: '"Helvetica", sans-serif',
  "Times New Roman": '"Times New Roman", serif',
  "Courier New": '"Courier New", monospace',
};

const SIZE_ALIAS_TO_VALUE: Record<string, number> = {
  small: 10,
  large: 18,
  huge: 32,
};

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

const registerWhitelistedAttributor = (
  path: string,
  whitelist: readonly string[],
) => {
  const attributor: any = Quill.import(path);
  if (!attributor) {
    return;
  }

  attributor.whitelist = [...whitelist];
  Quill.register(attributor, true);
};

if (isBrowser) {
  registerWhitelistedAttributor(
    "attributors/style/font",
    FONT_FAMILY_WHITELIST,
  );
  registerWhitelistedAttributor("attributors/style/size", FONT_SIZE_WHITELIST);
}

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

  readonly quillFormats: string[] = [
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "list",
    "header",
  ];

  readonly quillModules: { toolbar: any[] } = {
    toolbar: [
      [
        // { font: [...TOOLBAR_FONT_OPTIONS] },
        { size: [...TOOLBAR_SIZE_OPTIONS] },
      ],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  @ViewChild("printArea") printArea?: ElementRef<HTMLDivElement>;
  @ViewChild("editable") editable?: ElementRef<HTMLDivElement>;
  private quill?: any;
  private toolbarObservers: MutationObserver[] = [];
  private toolbarCleanup: Array<() => void> = [];

  ngOnInit(): void {
    const essay = this.dashboardService.getEssayContent()();
    this.titleControl.setValue(this.essayStateService.essayTitle() ?? "");

    const rawContent = essay?.content ?? "";
    this.initialContentHtml = this.convertMarkdownToHtml(rawContent);
    this.contentControl.setValue(this.initialContentHtml);
  }

  ngAfterViewInit(): void {}

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

    this.decorateToolbarPickers(editor);

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
              ...styled,
            });
          } else {
            flushList();
            result.push({
              ...styled,
              margin: [0, 0, 0, 8],
            });
          }
        } else if (baseText) {
          // middle line without trailing newline
          if (currentList !== null && currentList.items) {
            currentList.items.push({
              ...styled,
            });
          } else {
            result.push({
              ...styled,
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

    const resolvedSize = this.resolveFontSize(attrs.size);
    if (resolvedSize) {
      out.fontSize = resolvedSize;
    }

    // Prepare for font family mapping.
    if (typeof attrs.font === "string" && attrs.font) {
      const pdfFont = this.resolvePdfMakeFont(attrs.font);
      if (pdfFont) {
        out.font = pdfFont;
      }
    }

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

  ngOnDestroy(): void {
    this.toolbarObservers.forEach((observer) => observer.disconnect());
    this.toolbarObservers = [];

    this.toolbarCleanup.forEach((dispose) => dispose());
    this.toolbarCleanup = [];
  }

  private decorateToolbarPickers(editor: any): void {
    if (!isBrowser) {
      return;
    }

    const toolbarModule = editor?.getModule?.("toolbar");
    const toolbarEl = toolbarModule?.container as HTMLElement | undefined;
    if (!toolbarEl) {
      return;
    }

    this.decoratePicker(toolbarEl, "font", "Default", (el, value) => {
      const family = FONT_FAMILY_MAP[value] ?? value;
      el.style.fontFamily = family;
    });

    this.decoratePicker(toolbarEl, "size", "Normal", (el, value) => {
      el.style.fontSize = value;
    });
  }

  private decoratePicker(
    toolbarEl: HTMLElement,
    format: "font" | "size",
    fallbackLabel: string,
    applyStyle: (el: HTMLElement, value: string) => void,
  ): void {
    const picker = toolbarEl.querySelector<HTMLElement>(
      `.ql-picker.ql-${format}`,
    );
    if (!picker) {
      return;
    }

    const updateLabel = (element: HTMLElement | null) => {
      if (!element) {
        return;
      }

      const datasetValue = element.dataset?.["value"];
      const value = datasetValue ?? element.getAttribute("data-value");
      const label = !value || value === "false" ? fallbackLabel : value;

      element.setAttribute("data-label", label);

      if (!value || value === "false") {
        element.style.removeProperty(
          format === "font" ? "font-family" : "font-size",
        );
        return;
      }

      applyStyle(element, value);
    };

    const labelElement = picker.querySelector<HTMLElement>(".ql-picker-label");
    updateLabel(labelElement);

    picker.querySelectorAll<HTMLElement>(".ql-picker-item").forEach((item) => {
      updateLabel(item);
    });

    if (labelElement) {
      const observer = new MutationObserver(() => updateLabel(labelElement));
      observer.observe(labelElement, {
        attributes: true,
        attributeFilter: ["data-value"],
      });
      this.toolbarObservers.push(observer);
    }

    const scheduleRefresh = () => {
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => updateLabel(labelElement));
      } else {
        updateLabel(labelElement);
      }
    };

    picker.addEventListener("click", scheduleRefresh);
    picker.addEventListener("keydown", scheduleRefresh);

    this.toolbarCleanup.push(() => {
      picker.removeEventListener("click", scheduleRefresh);
      picker.removeEventListener("keydown", scheduleRefresh);
    });
  }

  private resolveFontSize(size: unknown): number | undefined {
    if (size == null) {
      return undefined;
    }

    if (typeof size === "number" && Number.isFinite(size)) {
      return size;
    }

    if (typeof size === "string") {
      const aliasValue = SIZE_ALIAS_TO_VALUE[size.toLowerCase()];
      if (aliasValue) {
        return aliasValue;
      }

      const pxMatch = size.match(/^(\d+(?:\.\d+)?)px$/i);
      if (pxMatch) {
        return Number.parseFloat(pxMatch[1]);
      }

      const numericValue = Number.parseFloat(size);
      if (!Number.isNaN(numericValue)) {
        return numericValue;
      }
    }

    return undefined;
  }

  private resolvePdfMakeFont(fontName: string): string | undefined {
    return undefined;
  }
}
