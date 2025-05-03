import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-centered-layout",
  templateUrl: "./centered-layout.component.html",
  standalone: true,
  imports: [CommonModule],
})
export class CenteredLayoutComponent {
  /**
   * Controls the maximum width of the centered content
   * Default is 'max-w-5xl', options: max-w-md, max-w-lg, max-w-2xl, max-w-5xl, max-w-7xl
   */
  @Input() maxWidthClass: string = "max-w-5xl";
}
