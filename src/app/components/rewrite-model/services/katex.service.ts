import { Injectable } from "@angular/core";

declare var katex: any;

@Injectable({
  providedIn: "root",
})
export class KatexService {
  constructor() {
    // Ensure KaTeX is available in the global scope
    if (typeof katex === "undefined") {
      console.warn("KaTeX is not loaded. Math rendering will not work.");
    }
  }

  // Render mathematical expressions in text
  renderMath(text: string): string {
    if (!text) return "";

    // Regular expression to find inline and block math expressions
    const mathRegex = /(\$\$[^\$]+\$\$)|(\$[^\$]+\$)/g;

    return text.replace(mathRegex, (match) => {
      try {
        // Check if this is a block equation ($$...$$) or inline ($...$)
        const isBlock = match.startsWith("$$");

        // Extract the math expression without the delimiters
        const math = isBlock ? match.slice(2, -2) : match.slice(1, -1);

        // Render the math expression
        const html = katex.renderToString(math, {
          displayMode: isBlock,
          throwOnError: false,
        });

        return html;
      } catch (error) {
        console.error("Error rendering math:", error);
        return match; // Return the original text if rendering fails
      }
    });
  }
}
