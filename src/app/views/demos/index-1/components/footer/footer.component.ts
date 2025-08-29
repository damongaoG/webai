import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { credits, currentYear } from "@common/constants";
import { LucideAngularModule } from "lucide-angular";
import { footerLinks } from "../data";

@Component({
  selector: "footer-1",
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: "./footer.component.html",
  styles: ``,
})
export class FooterComponent {
  socialIcons = ["facebook", "instagram", "twitter", "linkedin"];
  currentYear = currentYear;
  developedBy = credits.name;
  footerLinks = footerLinks;
}
