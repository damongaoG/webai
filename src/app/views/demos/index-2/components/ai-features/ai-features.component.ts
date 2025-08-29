import { Component } from "@angular/core";
import { features } from "../data";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "ai-features",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./ai-features.component.html",
  styles: ``,
})
export class AiFeaturesComponent {
  features = features;
}
