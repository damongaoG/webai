import { Component } from "@angular/core";
import { TopNavbarComponent } from "@components/top-navbar/top-navbar.component";
import { HeroComponent } from "./components/hero/hero.component";
import { ToolsComponent } from "./components/tools/tools.component";
import { FeaturesComponent } from "./components/features/features.component";
import { PricingPlansComponent } from "./components/pricing-plans/pricing-plans.component";
import { FaqsComponent } from "./components/faqs/faqs.component";
import { Footer5Component } from "./components/footer/footer.component";
import { PrivacyProtectionComponent } from "./components/privacy-protection/privacy-protection.component";

@Component({
  selector: "app-index-4",
  standalone: true,
  imports: [
    TopNavbarComponent,
    HeroComponent,
    ToolsComponent,
    FeaturesComponent,
    PrivacyProtectionComponent,
    PricingPlansComponent,
    FaqsComponent,
    Footer5Component,
  ],
  templateUrl: "./index-4.component.html",
  styles: ``,
})
export class Index4Component {
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
      label: "Testimonials",
      link: "#testimonials",
    },
    {
      label: "Privacy",
      link: "#privacy",
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
