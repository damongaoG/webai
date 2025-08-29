import { Component } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { faqsData } from "../data";

@Component({
  selector: "questions",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./faqs.component.html",
  styles: ``,
})
export class FaqsComponent {
  faqsData = faqsData;
}
