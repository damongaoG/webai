import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ThirdPartyLoginComponent } from '@components/third-party-login/third-party-login.component'

@Component({
  selector: 'app-qr-login',
  standalone: true,
  imports: [ThirdPartyLoginComponent, RouterLink],
  templateUrl: './qr-login.component.html',
  styles: ``,
})
export class QrLoginComponent {}
