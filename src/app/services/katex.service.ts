import { Injectable } from "@angular/core";
import katex from "katex";

@Injectable({
  providedIn: "root",
})
export class KatexService {
  constructor() {}

  /**
   * Render math formula
   * @param text math formula text
   * @returns String of rendered HTML
   */
  renderMath(text: string): string {
    // Check if it is a block-level formula
    const isDisplayMode = text.startsWith("$$") || text.startsWith("\\[");

    // Remove formula separators
    let formula = text;
    if (text.startsWith("$$") && text.endsWith("$$")) {
      formula = text.slice(2, -2);
    } else if (text.startsWith("$") && text.endsWith("$")) {
      formula = text.slice(1, -1);
    } else if (text.startsWith("\\[") && text.endsWith("\\]")) {
      formula = text.slice(2, -2);
    } else if (text.startsWith("\\(") && text.endsWith("\\)")) {
      formula = text.slice(2, -2);
    }

    try {
      return katex.renderToString(formula.trim(), {
        displayMode: isDisplayMode,
        throwOnError: false,
        output: "html",
      });
    } catch (e) {
      console.error("Error rendering math:", e);
      return text;
    }
  }
}
