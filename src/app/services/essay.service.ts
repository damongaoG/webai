import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@environment/environment";
import {
  CreateEssayDto,
  CreateEssayResponse,
  KeywordsResponse,
} from "../interfaces/essay-create.interface";

@Injectable({
  providedIn: "root",
})
export class EssayService {
  private readonly http = inject(HttpClient);
  // Note: Using model-processor-service endpoint for essay creation
  private readonly apiUrl = environment.modelProcessorServiceUrl;

  private readonly headers = new HttpHeaders({
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  /**
   * Create a new essay by sending title to the API
   * @param createEssayDto - Contains the essay title
   * @returns Observable<CreateEssayResponse> - API response with essay data
   */
  createEssay(createEssayDto: CreateEssayDto): Observable<CreateEssayResponse> {
    return this.http.post<CreateEssayResponse>(
      `${this.apiUrl}/anon/paper`,
      createEssayDto,
      { headers: this.headers },
    );
  }

  /**
   * Get keywords for a specific essay
   * @param essayId - The ID of the essay
   * @returns Observable<KeywordsResponse> - API response with keywords data
   */
  getKeywords(essayId: string): Observable<KeywordsResponse> {
    return this.http.get<KeywordsResponse>(
      `${this.apiUrl}/anon/model/paper/action/${essayId}/keywords`,
      { headers: this.headers },
    );
  }
}
