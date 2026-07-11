import { autocompleteEngine } from "../engine/engine.ts";
import { buildSnapshot } from "../builder/builder.ts";
import { logger } from "@/configs/logger.ts";

export const track4Service = {
  async init() {
    try {
      const snapshot = await buildSnapshot();
      await autocompleteEngine.load(snapshot);
      logger.info("Track 4 engine initialized from fresh build");
    } catch (err) {
      logger.error(
        err,
        "Track 4 engine init failed — attempting file fallback",
      );
      await autocompleteEngine.load();
    }
  },

  async suggest(
    input: string,
    options?: { lat?: number; lng?: number; limit?: number },
  ) {
    return await autocompleteEngine.suggest(input, options);
  },
};
