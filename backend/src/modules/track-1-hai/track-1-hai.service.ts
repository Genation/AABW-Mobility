import { haiAiService } from "@/intenals/hai-ai/hai-ai.service.ts";
import type { IntentSearchRequest } from "./track-1-hai.dto.ts";

export const track1HaiService = {
  understand(input: IntentSearchRequest) {
    return haiAiService.intentSearch(input);
  },
};
