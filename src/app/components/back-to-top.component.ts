import { CommonModule } from "@angular/common";
import { Component, HostListener } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-back-to-top",
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      id="back-to-top"
      *ngIf="isVisible"
      (click)="scrollToTop()"
      class="fixed bottom-5 end-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-center text-xl text-default-950 backdrop-blur-3xl transition-all duration-500 hover:rounded-lg hover:bg-primary hover:text-white"
    >
      <lucide-icon name="chevron-up" class="h-4 w-4"></lucide-icon>
    </button>
  `,
  styles: ``,
})
export class BackToTopComponent {
  isVisible = false;

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isVisible = window.scrollY > 500;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
