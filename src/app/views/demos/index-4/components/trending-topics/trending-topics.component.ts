import { Component } from "@angular/core";
import { trendingTopics } from "../data";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "trending-topics",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./trending-topics.component.html",
  styles: ``,
})
export class TrendingTopicsComponent {
  trendingTopics = trendingTopics;
}
