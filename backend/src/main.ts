import { createApp } from "./app.ts";
import { env } from "./configs/env.ts";
import { logger } from "./configs/logger.ts";

const app = createApp();

logger.info(`API Server is running on port ${env.PORT}`);

Deno.serve({ port: env.PORT }, app.fetch);
