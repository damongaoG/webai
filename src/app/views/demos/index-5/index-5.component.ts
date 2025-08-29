import { Component } from "@angular/core";
import { TopNavbarComponent } from "../../../components/top-navbar/top-navbar.component";
import { HeroComponent } from "./components/hero/hero.component";
import { PostGeneratorComponent } from "./components/post-generator/post-generator.component";
import { ToolsComponent } from "./components/tools/tools.component";
import { FeaturesComponent } from "./components/features/features.component";
import { PricingCardComponent } from "./components/pricing-card/pricing-card.component";
import { FaqsComponent } from "./components/faqs/faqs.component";
import { Footer6Component } from "./components/footer-6/footer-6.component";

@Component({
  selector: "app-index-5",
  standalone: true,
  imports: [
    TopNavbarComponent,
    HeroComponent,
    ToolsComponent,
    PostGeneratorComponent,
    FeaturesComponent,
    PricingCardComponent,
    FaqsComponent,
    Footer6Component,
  ],
  templateUrl: "./index-5.component.html",
  styles: ``,
})
export class Index5Component {
  navLinks = [
    {
      label: "Home",
      link: "#home",
    },
    {
      label: "Tools",
      link: "#tools",
    },
    {
      label: "Features",
      link: "#features",
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
