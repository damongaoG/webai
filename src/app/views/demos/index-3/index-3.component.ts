import { Component } from "@angular/core";
import { HeroComponent } from "./components/hero/hero.component";
import { TopNavbarComponent } from "../../../components/top-navbar/top-navbar.component";
import { HeroSwiperComponent } from "./components/hero-swiper/hero-swiper.component";
import { FeaturesComponent } from "./components/features/features.component";
import { Features2Component } from "./components/features-2/features-2.component";
import { GeneratorComponent } from "./components/generator/generator.component";
import { PricingComponent } from "./components/pricing/pricing.component";
import { FaqsComponent } from "./components/faqs/faqs.component";
import { ActionBoxComponent } from "./components/action-box/action-box.component";
import { Footer4Component } from "./components/footer-4/footer-4.component";

@Component({
  selector: "app-index-3",
  standalone: true,
  imports: [
    HeroComponent,
    TopNavbarComponent,
    HeroSwiperComponent,
    FeaturesComponent,
    Features2Component,
    GeneratorComponent,
    PricingComponent,
    FaqsComponent,
    ActionBoxComponent,
    Footer4Component,
  ],
  templateUrl: "./index-3.component.html",
  styles: ``,
})
export class Index3Component {
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
      label: "Generator",
      link: "#generator",
    },
    {
      label: "Price",
      link: "#price",
    },
    {
      label: "Faq",
      link: "#faq",
    },
  ];
}
