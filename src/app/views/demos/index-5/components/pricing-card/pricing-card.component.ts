import { Component } from "@angular/core";
import { pricingPlans } from "../data";
import { LucideAngularModule } from "lucide-angular";
import { currency } from "@common/constants";

@Component({
  selector: "pricing-card",
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: "./pricing-card.component.html",
  styles: ``,
})
export class PricingCardComponent {
  pricingPlans = pricingPlans;
  currency = currency;
}
