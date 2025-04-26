import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ThirdPartyLoginComponent } from '@components/third-party-login/third-party-login.component'
import { AuthImageComponent } from '@components/auth-image/auth-image.component'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ThirdPartyLoginComponent, AuthImageComponent],
  templateUrl: './register.component.html',
  styles: ``,
})
export class RegisterComponent {}
