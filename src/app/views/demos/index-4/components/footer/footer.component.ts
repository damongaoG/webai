import { Component } from "@angular/core";
import { FooterComponent } from "@components/footer/footer.component";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "footer-5",
  standalone: true,
  imports: [FooterComponent, LucideAngularModule],
  templateUrl: "./footer.component.html",
  styles: ``,
})
export class Footer5Component {
  socialIcons = ["facebook", "twitter", "linkedin"];
}
