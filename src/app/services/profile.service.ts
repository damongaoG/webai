import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

import { environment } from "@environment/environment";
import {
  ChangePasswordDto,
  ApiResponse,
} from "../interfaces/profile.interface";

@Injectable({
  providedIn: "root",
})
export class ProfileService {
  private readonly auiUrl = environment.securityServiceUrl;
  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  constructor(private http: HttpClient) {}
  updateUserDetails(payload: ChangePasswordDto): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.auiUrl}/auth/users`, payload, {
      headers: this.headers,
    });
  }
}
