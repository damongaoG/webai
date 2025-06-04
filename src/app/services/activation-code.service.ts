import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Result } from "@/app/interfaces/result";
import { PageActivationCodeVo } from "@/app/interfaces/page-activation-code-vo";
import { environment } from "@environment/environment";

@Injectable({
  providedIn: "root",
})
export class ActivationCodeService {
  private readonly apiUrl = environment.modelServiceUrl;
  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  constructor(private http: HttpClient) {}

  listActivationCodes(params: any): Observable<Result<PageActivationCodeVo>> {
    return this.http.get<Result<PageActivationCodeVo>>(
      `${this.apiUrl}/auth/activation-codes` +
        "?list=" +
        btoa(JSON.stringify(params)),
      { headers: this.headers },
    );
  }
}
