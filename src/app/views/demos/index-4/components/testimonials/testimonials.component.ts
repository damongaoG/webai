import { Component } from "@angular/core";
import { userTestimonialData } from "../data";
import { splitArray } from "@/app/helper/utils";

@Component({
  selector: "user-testimonials",
  standalone: true,
  imports: [],
  templateUrl: "./testimonials.component.html",
  styles: ``,
})
export class TestimonialsComponent {
  userTestimonialChunks = splitArray(userTestimonialData, 3);
}
