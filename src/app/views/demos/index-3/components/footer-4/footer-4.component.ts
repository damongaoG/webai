import { Component } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { footerLinks } from "../data";
import { FooterComponent } from "@components/footer/footer.component";

@Component({
  selector: "footer-4",
  standalone: true,
  imports: [LucideAngularModule, FooterComponent],
  templateUrl: "./footer-4.component.html",
  styles: ``,
})
export class Footer4Component {
  socialIcons = ["facebook", "instagram", "twitter", "linkedin"];

  footerLinks = footerLinks;
}
