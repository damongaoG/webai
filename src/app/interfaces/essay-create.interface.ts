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

// Data returned from keywords API
export interface KeywordsData {
  id: string;
  title: string;
  keywords: string;
}

// Response from GET /model-processor-service/api/anon/model/paper/action/${id}/keywords
export interface KeywordsResponse {
  timestamp: number;
  data: KeywordsData;
  code: number;
}

// Argument data structure
export interface ArgumentData {
  id: string;
  text: string;
  isSelected?: boolean;
}

// Data returned from arguments API
export interface ArgumentsData {
  id: string;
  title: string;
  keywords: string;
  arguments: ArgumentData[];
  scholars: any[];
  cases: any[];
}

// Response from GET /model-processor-service/api/anon/model/paper/action/${id}/arguments
export interface ArgumentsResponse {
  timestamp: number;
  data: ArgumentsData;
  code: number;
}
