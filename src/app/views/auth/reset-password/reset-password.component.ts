import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthImageComponent } from '@components/auth-image/auth-image.component'

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [AuthImageComponent, RouterLink],
  templateUrl: './reset-password.component.html',
  styles: ``,
})
export class ResetPasswordComponent {}
