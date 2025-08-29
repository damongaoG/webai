import { Component } from "@angular/core";
import { pricingPlans } from "../data";
import { currency } from "@common/constants";

@Component({
  selector: "pricing-plans",
  standalone: true,
  imports: [],
  templateUrl: "./pricing-plans.component.html",
  styles: ``,
})
export class PricingPlansComponent {
  pricingPlans = pricingPlans;
  currency = currency;
}
