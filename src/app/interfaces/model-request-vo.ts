import {ChoicesVo} from "./choices-vo";

export interface ModelRequestVo {
  created: number;
  model: string;
  id: string;
  choices: Array<ChoicesVo>;
  object: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cache_hit_tokens: number;
    prompt_cache_miss_tokens: number;
  };
}
