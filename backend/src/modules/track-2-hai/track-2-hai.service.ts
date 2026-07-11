import { haiAiService } from "@/intenals/hai-ai/hai-ai.service.ts";
import type { SemanticSearchRequest } from "./track-2-hai.dto.ts";

export const track2HaiService = {
  search(input: SemanticSearchRequest) {
    return haiAiService.semanticSearch(input);
  },
};
