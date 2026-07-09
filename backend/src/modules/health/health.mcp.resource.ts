/**
 * MCP Resources Registration - Health Module
 *
 * Exposes read-only health metadata as MCP resources (URI-addressable).
 * Resources represent data the server HAS (documents, schemas, configs),
 * not actions the server CAN DO (those are Tools).
 *
 * SDK: @modelcontextprotocol/sdk
 * Transport: WebStandardStreamableHTTPServerTransport
 *
 * Reference: https://modelcontextprotocol.io/specification/2025-11-25/server/resources
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Registers health module resources to the MCP server.
 *
 * Resources exposed:
 *   - geotools://health/schema : JSON Schema for health records
 *
 * @param server - McpServer instance to register resources with
 */
export function registerHealthResources(server: McpServer): void {
  server.registerResource(
    "health-schema",
    "geotools://health/schema",
    {
      title: "Health Record Schema",
      description:
        "JSON Schema that defines the structure of health records stored in the database.",
      mimeType: "application/schema+json",
    },
    (uri: URL): ReadResourceResult => {
      const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        description: "Health record stored in the database",
        properties: {
          id: { type: "integer", description: "Unique record identifier" },
          data: {
            type: "object",
            description: "User-defined JSON data",
            additionalProperties: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "ISO 8601 creation timestamp",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "ISO 8601 last-update timestamp",
          },
        },
        required: ["id", "data", "createdAt", "updatedAt"],
      };

      return {
        contents: [{
          uri: uri.toString(),
          mimeType: "application/schema+json",
          text: JSON.stringify(schema, null, 2),
        }],
      };
    },
  );
}
