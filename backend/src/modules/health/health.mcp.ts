/**
 * MCP Module - Health (Re-exports)
 *
 * DEPRECATED - import from health.mcp.tool.ts or health.mcp.resource.ts directly.
 * This file is kept for backward compatibility only.
 *
 * To migrate:
 *   import { registerHealthTools } from "./health.mcp.tool.ts";
 *   import { registerHealthResources } from "./health.mcp.resource.ts";
 */
export {
  registerHealthTools,
  type HealthCreateInput,
  type HealthDeleteInput,
  type HealthGetInput,
  type HealthGapTestInput,
  type HealthListInput,
  type HealthSelect,
  type HealthUpdateInput,
} from "./health.mcp.tool.ts";

export { registerHealthResources } from "./health.mcp.resource.ts";
