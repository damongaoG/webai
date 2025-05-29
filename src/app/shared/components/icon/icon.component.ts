import { Component, Input } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-icon",
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <lucide-icon
      [name]="name"
      [class]="iconClasses"
      [size]="size"
    ></lucide-icon>
  `,
  styles: [],
})
export class IconComponent {
  @Input() name!: string;
  @Input() size: number = 16;
  @Input() customClass = "";

  get iconClasses(): string {
    const baseClasses = ["inline-block"];
    return [...baseClasses, this.customClass].join(" ");
  }
}
