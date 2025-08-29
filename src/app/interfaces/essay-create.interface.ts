// Essay creation API interfaces

// Request DTO for creating an essay
export interface CreateEssayDto {
  title: string;
}

// Data returned from essay creation API
export interface EssayCreateData {
  id: string;
  title: string;
}

// Response from POST /model-processor-service/api/anon/paper
export interface CreateEssayResponse {
  timestamp: number;
  data: EssayCreateData;
  code: number;
}
