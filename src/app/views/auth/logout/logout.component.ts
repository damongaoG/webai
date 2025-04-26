import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthImageComponent } from '@components/auth-image/auth-image.component'

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [AuthImageComponent, RouterLink],
  templateUrl: './logout.component.html',
  styles: ``,
})
export class LogoutComponent {}
