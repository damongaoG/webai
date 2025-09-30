import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
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
    const htmlToPdfmakeModule = await import("html-to-pdfmake");

    const pdfMake: any =
      (pdfMakeModule as any).default || (pdfMakeModule as any);
    const pdfFonts: any =
      (pdfFontsModule as any).default || (pdfFontsModule as any);
    const htmlToPdfmake: any =
      (htmlToPdfmakeModule as any).default || (htmlToPdfmakeModule as any);

    pdfMake.vfs = pdfFonts.vfs;

    const rawHtml: string =
      (this.quill?.root?.innerHTML as string) ||
      this.contentControl.value ||
      "";
    const html = this.normalizeQuillHtml(rawHtml);

    const converted = htmlToPdfmake(html, {
      defaultStyles: {
        p: { margin: [0, 0, 0, 8] },
        ul: { marginBottom: 0, marginLeft: 18 },
        ol: { marginBottom: 0, marginLeft: 18 },
        h1: { fontSize: 24, bold: true, margin: [0, 0, 0, 10] },
        h2: { fontSize: 20, bold: true, margin: [0, 0, 0, 8] },
        h3: { fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
      },
      removeExtraBlanks: false,
    });

    const content = Array.isArray(converted)
      ? converted
      : (converted?.content ?? []);
    const styles =
      !Array.isArray(converted) && converted?.styles
        ? converted.styles
        : undefined;

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
      defaultStyle: { font: "Roboto", fontSize: 14 },
      styles,
    };

    pdfMake.createPdf(docDefinition).download(filename);
  }

  private normalizeQuillHtml(html: string): string {
    if (!isBrowser || !html) {
      return html || "";
    }

    const container = document.createElement("div");
    container.innerHTML = html;

    const indentNodes = container.querySelectorAll<HTMLElement>(
      '[class*="ql-indent-"]',
    );
    indentNodes.forEach((el) => {
      const indentClass = Array.from(el.classList).find((c) =>
        c.startsWith("ql-indent-"),
      );
      if (!indentClass) return;
      const levelStr = indentClass.replace("ql-indent-", "");
      const level = Number.parseInt(levelStr, 10);
      if (Number.isFinite(level) && level > 0) {
        const emPerLevel = 3;
        el.style.marginLeft = `${level * emPerLevel}em`;
      }
    });

    const alignMap: Record<string, string> = {
      "ql-align-center": "center",
      "ql-align-right": "right",
      "ql-align-justify": "justify",
    };
    const alignNodes = container.querySelectorAll<HTMLElement>(
      ".ql-align-center, .ql-align-right, .ql-align-justify",
    );
    alignNodes.forEach((el) => {
      for (const className of Object.keys(alignMap)) {
        if (el.classList.contains(className)) {
          el.style.textAlign = alignMap[className];
        }
      }
    });

    container.querySelectorAll("p").forEach((p) => {
      if (p.innerHTML.trim().toLowerCase() === "<br>") {
        p.innerHTML = "&nbsp;";
      }
    });

    const allNodes = container.querySelectorAll<HTMLElement>("*");
    allNodes.forEach((el) => {
      const inlineFontSize = el.style?.fontSize;
      if (!inlineFontSize) {
        return;
      }

      const resolved = this.resolveFontSize(inlineFontSize);
      if (!resolved) {
        return;
      }

      // Merge with any existing data-pdfmake JSON on the element
      const existingAttr = el.getAttribute("data-pdfmake");
      let payload: Record<string, unknown> = {};
      if (existingAttr) {
        try {
          payload = JSON.parse(existingAttr);
        } catch {
          // If existing payload is invalid JSON, overwrite with a clean object
          payload = {};
        }
      }
      payload["fontSize"] = resolved;
      el.setAttribute("data-pdfmake", JSON.stringify(payload));
    });

    const olNodes = container.querySelectorAll<HTMLOListElement>("ol");
    olNodes.forEach((ol) => {
      const hasBulletClass = ol.classList.contains("ql-bullet");
      const hasBulletItem = Array.from(ol.querySelectorAll("li")).some(
        (li) =>
          li.getAttribute("data-list") === "bullet" ||
          li.classList.contains("ql-bullet"),
      );

      if (hasBulletClass || hasBulletItem) {
        const ul = document.createElement("ul");

        Array.from(ol.attributes).forEach((attr) => {
          if (attr.name === "class") return;
          if (attr.name === "data-list") return;
          ul.setAttribute(attr.name, attr.value);
        });

        Array.from(ol.classList).forEach((cls) => {
          if (cls === "ql-list" || cls === "ql-bullet") return;
          ul.classList.add(cls);
        });

        while (ol.firstChild) {
          ul.appendChild(ol.firstChild);
        }

        ol.replaceWith(ul);
      }
    });

    return container.innerHTML;
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
      el.style.fontFamily = FONT_FAMILY_MAP[value] ?? value;
    });

    this.decoratePicker(toolbarEl, "size", "Normal", (el, _value) => {
      el.style.fontSize = "16px";
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
}
