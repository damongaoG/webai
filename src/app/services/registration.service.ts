import { ResendValidateEmailDto } from "./../interfaces/resend-validate-email-dto";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { RegistryCustomerDto } from "../interfaces/registry-customer-dto";
import { Observable } from "rxjs";
import { Result } from "../interfaces/result";
import { environment } from "@environment/environment";

@Injectable({
  providedIn: "root",
})
export class RegistrationService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  registerUser(data: RegistryCustomerDto): Observable<Result<any>> {
    return this.authService.signup(data);
  }

  resendVerificationEmail(
    data: ResendValidateEmailDto
  ): Observable<Result<any>> {
    return this.authService.resendValidateEmail(data);
  }

  getVerificationCaptcha(): Observable<Blob> {
    const headers = new HttpHeaders({
      "Content-Type": "image/jpeg",
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    });

    return this.http.get(
      `${environment.securityServiceUrl}/anon/kaptcha/validation-email?t=${Date.now()}`,
      { headers: headers, responseType: "blob" }
    );
  }
}
