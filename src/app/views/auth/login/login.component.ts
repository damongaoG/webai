import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { AuthImageComponent } from '@components/auth-image/auth-image.component'
import { ThirdPartyLoginComponent } from '@components/third-party-login/third-party-login.component'
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
  type UntypedFormGroup,
} from '@angular/forms'
import { Store } from '@ngrx/store'
import { AuthenticationService } from '@/app/services/auth.service'
import { login } from '@store/authentication/authentication.actions'
import { getError } from '@store/authentication/authentication.selector'
import { NgClass, NgIf } from '@angular/common'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    AuthImageComponent,
    ThirdPartyLoginComponent,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    NgIf,
  ],
  templateUrl: './login.component.html',
  styles: ``,
})
export class LoginComponent {
  signInForm!: UntypedFormGroup
  submitted: boolean = false

  errorMessage: string = ''

  public fb = inject(UntypedFormBuilder)
  public store = inject(Store)
  public service = inject(AuthenticationService)

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['user@demo.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
    })
  }

  get formValues() {
    return this.signInForm.controls
  }

  login() {
    this.submitted = true
    if (this.signInForm.valid) {
      const email = this.formValues['email'].value // Get the username from the form
      const password = this.formValues['password'].value // Get the password from the form

      // Login Api
      this.store.dispatch(login({ email: email, password: password }))

      this.store.select(getError).subscribe((data) => {
        if (data) {
          this.errorMessage = data.error.message

          setTimeout(() => {
            this.errorMessage = ''
          }, 3000)
        }
      })
    }
  }
}
