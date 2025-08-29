import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { credits, currentYear } from "@common/constants";

@Component({
  selector: "auth-layout",
  standalone: true,
  imports: [RouterModule],
  templateUrl: "./auth-layout.component.html",
  styles: ``,
})
export class AuthLayoutComponent {
  currentYear = currentYear;
  developedBy = credits.name;
}
