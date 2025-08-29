import { Component } from "@angular/core";
import { faqs } from "../data";
import { splitArray } from "@/app/helper/utils";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "video-faqs",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./faqs.component.html",
  styles: ``,
})
export class FaqsComponent {
  faqChunks = splitArray(faqs, 3);
}
