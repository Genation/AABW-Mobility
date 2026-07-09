import { autocompleteEngine } from "./track-4-autocomplete.engine.ts";
import { buildSnapshot } from "./track-4-autocomplete.builder.ts";
import { logger } from "@/configs/logger.ts";

export const track4Service = {
  async init() {
    try {
      const snapshot = await buildSnapshot();
      await autocompleteEngine.load(snapshot);
      logger.info("Track 4 engine initialized from fresh build");
    } catch (err) {
      logger.error(err, "Track 4 engine init failed");
    }
  },

  suggest(
    input: string,
    options?: { lat?: number; lng?: number; limit?: number },
  ) {
    return autocompleteEngine.suggest(input, options);
  },
};
