import { Component } from "@angular/core";
import { credits, currentYear } from "@common/constants";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "home-footer",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./footer.component.html",
  styles: ``,
})
export class FooterComponent {
  currentYear = currentYear;
  developedBy = credits.name;
}
