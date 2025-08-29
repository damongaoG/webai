import { Component } from "@angular/core";
import { aiTools } from "../data";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "ai-tools",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./tools.component.html",
  styles: ``,
})
export class ToolsComponent {
  aiTools = aiTools;
}
