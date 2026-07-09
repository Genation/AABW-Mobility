/**
 * MCP Tools Registration - Health Module
 *
 * Exposes health CRUD operations as MCP tools.
 * Uses DTO schemas (health.dto.ts) as the single source of truth for input validation.
 *
 * SDK: @modelcontextprotocol/sdk
 * Transport: WebStandardStreamableHTTPServerTransport
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { logTool } from "@/types/mcp-context.ts";
import { z } from "zod/v4";

import { AppError, getJsonRpcCode } from "@/shared/errors/error-factory.ts";
import { healthService } from "./health.service.ts";
import {
  HealthCreateSchema,
  HealthParamSchema,
  HealthQuerySchema,
  HealthSelectSchema,
  HealthUpdateSchema,
} from "./health.dto.ts";

const HealthListInputSchema = HealthQuerySchema.pick({
  query: true,
  limit: true,
}).extend({
  latestAt: HealthQuerySchema.shape.latestAt
    .unwrap()
    .or(HealthQuerySchema.shape.latestAt)
    .optional()
    .describe("Cursor: ISO 8601 timestamp, return items created before this"),
});

const HealthUpdateInputSchema = z.object({
  id: HealthParamSchema.shape.id,
  data: HealthUpdateSchema.shape.data,
});

export type HealthListInput = z.infer<typeof HealthListInputSchema>;
export type HealthCreateInput = z.infer<typeof HealthCreateSchema>;
export type HealthGetInput = z.infer<typeof HealthParamSchema>;
export type HealthUpdateInput = z.infer<typeof HealthUpdateInputSchema>;
export type HealthDeleteInput = z.infer<typeof HealthParamSchema>;
export type HealthGapTestInput = z.infer<typeof HealthParamSchema>;
export type HealthSelect = z.infer<typeof HealthSelectSchema>;

export function registerHealthTools(server: McpServer): void {
  server.registerTool(
    "health_list",
    {
      title: "List Health Records",
      description:
        "Retrieves a paginated list of health records. Supports cursor-based pagination via latestAt.",
      inputSchema: HealthListInputSchema,
    },
    async (args, ctx): Promise<CallToolResult> => {
      logTool(ctx, "info", {
        tool: "health_list",
        args: { limit: args.limit, query: args.query },
      }, "Starting health_list");
      try {
        const latestAtDate = args.latestAt
          ? new Date(args.latestAt)
          : undefined;
        const result = await healthService.findMany({
          query: args.query,
          limit: args.limit,
          latestAt: latestAtDate,
        });

        logTool(
          ctx,
          "info",
          { tool: "health_list", count: result.data.length },
          "health_list complete",
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              {
                data: result.data.map((r) => ({
                  id: r.id,
                  data: r.data,
                  createdAt: r.createdAt.toISOString(),
                  updatedAt: r.updatedAt.toISOString(),
                })),
                hasMore: result.hasMore,
                nextCursor: result.nextCursor?.toISOString() ?? null,
              },
              null,
              2,
            ),
          }],
          structuredContent: {
            data: result.data.map((r) => ({
              id: r.id,
              data: r.data,
              createdAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString(),
            })),
            hasMore: result.hasMore,
            nextCursor: result.nextCursor?.toISOString() ?? null,
          },
        };
      } catch (error) {
        logTool(
          ctx,
          "error",
          { tool: "health_list", error: String(error) },
          "health_list failed",
        );
        if (error instanceof AppError) {
          const code = getJsonRpcCode(error.code);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: error.message, code }),
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              code: -32603,
            }),
          }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "health_create",
    {
      title: "Create Health Record",
      description: "Creates a new health record with the provided JSON data.",
      inputSchema: HealthCreateSchema,
    },
    async (args, ctx): Promise<CallToolResult> => {
      logTool(
        ctx,
        "info",
        { tool: "health_create", args: { data: args.data } },
        "Starting health_create",
      );
      try {
        const result = await healthService.create(args);

        logTool(
          ctx,
          "info",
          { tool: "health_create", id: result.id },
          "health_create complete",
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              {
                id: result.id,
                data: result.data,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
              },
              null,
              2,
            ),
          }],
          structuredContent: {
            id: result.id,
            data: result.data,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        logTool(
          ctx,
          "error",
          { tool: "health_create", error: String(error) },
          "health_create failed",
        );
        if (error instanceof AppError) {
          const code = getJsonRpcCode(error.code);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: error.message, code }),
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              code: -32603,
            }),
          }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "health_get",
    {
      title: "Get Health Record",
      description:
        "Retrieves a single health record by its ID. Returns error if not found.",
      inputSchema: HealthParamSchema,
    },
    async (args, ctx): Promise<CallToolResult> => {
      logTool(
        ctx,
        "info",
        { tool: "health_get", args: { id: args.id } },
        "Starting health_get",
      );
      try {
        const result = await healthService.findOne(args.id);

        logTool(
          ctx,
          "info",
          { tool: "health_get", id: result.id },
          "health_get complete",
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              {
                id: result.id,
                data: result.data,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
              },
              null,
              2,
            ),
          }],
          structuredContent: {
            id: result.id,
            data: result.data,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        logTool(
          ctx,
          "error",
          { tool: "health_get", error: String(error) },
          "health_get failed",
        );
        if (error instanceof AppError) {
          const code = getJsonRpcCode(error.code);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: error.message, code }),
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              code: -32603,
            }),
          }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "health_update",
    {
      title: "Update Health Record",
      description:
        "Updates an existing health record. Supports partial updates via the data field.",
      inputSchema: HealthUpdateInputSchema,
    },
    async (args, ctx): Promise<CallToolResult> => {
      logTool(ctx, "info", {
        tool: "health_update",
        args: { id: args.id, data: args.data },
      }, "Starting health_update");
      try {
        const updateData = args.data ? { data: args.data } : {};
        const result = await healthService.update(args.id, updateData);

        logTool(
          ctx,
          "info",
          { tool: "health_update", id: result.id },
          "health_update complete",
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              {
                id: result.id,
                data: result.data,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
              },
              null,
              2,
            ),
          }],
          structuredContent: {
            id: result.id,
            data: result.data,
            createdAt: result.createdAt.toISOString(),
            updatedAt: result.updatedAt.toISOString(),
          },
        };
      } catch (error) {
        logTool(
          ctx,
          "error",
          { tool: "health_update", error: String(error) },
          "health_update failed",
        );
        if (error instanceof AppError) {
          const code = getJsonRpcCode(error.code);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: error.message, code }),
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              code: -32603,
            }),
          }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "health_delete",
    {
      title: "Delete Health Record",
      description:
        "Permanently deletes a health record by its ID. Returns error if not found.",
      inputSchema: HealthParamSchema,
    },
    async (args, ctx): Promise<CallToolResult> => {
      logTool(
        ctx,
        "info",
        { tool: "health_delete", args: { id: args.id } },
        "Starting health_delete",
      );
      try {
        await healthService.delete(args.id);

        logTool(
          ctx,
          "info",
          { tool: "health_delete", id: args.id },
          "health_delete complete",
        );
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              {
                deleted: true,
                id: args.id,
              },
              null,
              2,
            ),
          }],
          structuredContent: { deleted: true, id: args.id },
        };
      } catch (error) {
        logTool(
          ctx,
          "error",
          { tool: "health_delete", error: String(error) },
          "health_delete failed",
        );
        if (error instanceof AppError) {
          const code = getJsonRpcCode(error.code);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: error.message, code }),
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              code: -32603,
            }),
          }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "health_gap_test",
    {
      title: "Calculate Date Gap",
      description:
        "Calculates the time gap (in milliseconds) between now and when the health record was created.",
      inputSchema: HealthParamSchema,
    },
    async (args, ctx): Promise<CallToolResult> => {
      logTool(
        ctx,
        "info",
        { tool: "health_gap_test", args: { id: args.id } },
        "Starting health_gap_test",
      );
      try {
        const result = await healthService.getDateGap(args.id);

        logTool(ctx, "info", {
          tool: "health_gap_test",
          id: result.id,
          dateGap: result.dateGap,
        }, "health_gap_test complete");
        return {
          content: [{
            type: "text",
            text: JSON.stringify(
              {
                id: result.id,
                createdAt: result.createdAt.toISOString(),
                dateGap: result.dateGap,
                description: "Record was created " +
                  Math.abs(result.dateGap) +
                  "ms ago (" +
                  Math.round(Math.abs(result.dateGap) / 1000) +
                  "s, " +
                  Math.round(Math.abs(result.dateGap) / 60000) +
                  "min)",
              },
              null,
              2,
            ),
          }],
          structuredContent: {
            id: result.id,
            createdAt: result.createdAt.toISOString(),
            dateGap: result.dateGap,
          },
        };
      } catch (error) {
        logTool(
          ctx,
          "error",
          { tool: "health_gap_test", error: String(error) },
          "health_gap_test failed",
        );
        if (error instanceof AppError) {
          const code = getJsonRpcCode(error.code);
          return {
            content: [{
              type: "text",
              text: JSON.stringify({ error: error.message, code }),
            }],
            isError: true,
          };
        }
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
              code: -32603,
            }),
          }],
          isError: true,
        };
      }
    },
  );
}
