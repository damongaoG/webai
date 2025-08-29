import { Component } from "@angular/core";
import { HeroComponent } from "./components/hero/hero.component";
import { TopNavbarComponent } from "../../../components/top-navbar/top-navbar.component";
import { AiFeaturesComponent } from "./components/ai-features/ai-features.component";
import { AiMadeComponent } from "./components/ai-made/ai-made.component";
import { AiImagesComponent } from "./components/ai-images/ai-images.component";
import { TestimonialComponent } from "./components/testimonial/testimonial.component";
import { ActionBoxComponent } from "./components/action-box/action-box.component";
import { Footer3Component } from "./components/footer-3/footer-3.component";

@Component({
  selector: "app-index-2",
  standalone: true,
  imports: [
    HeroComponent,
    TopNavbarComponent,
    AiFeaturesComponent,
    AiMadeComponent,
    AiImagesComponent,
    TestimonialComponent,
    ActionBoxComponent,
    Footer3Component,
  ],
  templateUrl: "./index-2.component.html",
  styles: ``,
})
export class Index2Component {
  navLinks = [
    {
      label: "Home",
      link: "#home",
    },
    {
      label: "Features",
      link: "#features",
    },
    {
      label: "AI Made",
      link: "#ai_made",
    },
    {
      label: "Testimonials",
      link: "#testimonials",
    },
  ];
}
