import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthImageComponent } from "@components/auth-image/auth-image.component";
import { ThirdPartyLoginComponent } from "@components/third-party-login/third-party-login.component";

@Component({
  selector: "app-lock-screen",
  standalone: true,
  imports: [AuthImageComponent, ThirdPartyLoginComponent, RouterLink],
  templateUrl: "./lock-screen.component.html",
  styles: ``,
})
export class LockScreenComponent {}
