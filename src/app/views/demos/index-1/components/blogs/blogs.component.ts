import { Component } from "@angular/core";
import { blogs } from "../data";
import { LucideAngularModule } from "lucide-angular";

@Component({
  selector: "app-blogs",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./blogs.component.html",
  styles: ``,
})
export class BlogsComponent {
  blogs = blogs;
}
