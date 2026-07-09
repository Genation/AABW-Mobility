/**
 * Hono Factory - SSOT for Hono app creation
 *
 * All Hono apps should be created using this factory
 * to ensure consistent type configuration across the app
 */

import { createFactory } from "@hono/hono/factory";
import type { Bindings } from "@/shared/types/app.type.ts";
import type { ValidatedVariables } from "@/shared/utils/validate.ts";

/**
 * Extended environment with validated request data
 */
export type AppEnv = { Bindings: Bindings; Variables: ValidatedVariables };

/**
 * Factory instance for validated app
 */
const validatedFactory = createFactory<AppEnv>();

/**
 * Create Hono app with validation support
 * Use this for apps that need validateRequest middleware
 */
export const createApp = () => validatedFactory.createApp();

/**
 * Alias for createApp - used by app.ts and main.ts
 */
export { createApp as createHonoApp };
