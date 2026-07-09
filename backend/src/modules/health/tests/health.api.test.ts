import { setupTestApp, TestAppInstance } from "@/shared/utils/test/setup.ts";
import { assertEquals, assertExists } from "@std/assert";
import type {
  HealthCreateSchema,
  HealthSelectSchema,
  HealthSelectWithDateGapSchema,
  HealthUpdateSchema,
} from "../health.dto.ts";
import type { ApiResponse } from "@/shared/types/app.type.ts";
import { closePool } from "@/db/pool.ts";
import z from "zod/v4";

let testApp: TestAppInstance;

Deno.test.beforeAll(async () => {
  testApp = await setupTestApp();
});

Deno.test.afterAll(async () => {
  await closePool();
  await testApp.close();
});

// ============================================
// POST /health — Create
// ============================================
Deno.test(
  "POST /health — should create a health record and return 201",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const body: z.infer<typeof HealthCreateSchema> = {
      data: { test: "value", score: 85 },
    };

    const { status, data } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      "/health",
      { method: "POST", body: JSON.stringify(body) },
      testApp.token,
    );

    assertEquals(status, 201);
    assertEquals(data?.ok, true);
    assertExists(data?.data);
    assertEquals(data?.data?.data, body.data);
    assertExists(data?.data?.id);
    assertEquals(typeof data?.data?.id, "number");
  },
);

Deno.test(
  "POST /health — should return 400 when body is missing required fields",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status, data } = await testApp.fetchClient<ApiResponse<null>>(
      "/health",
      { method: "POST", body: JSON.stringify({}) },
      testApp.token,
    );

    assertEquals(status, 400);
    assertEquals(data?.ok, false);
    assertEquals(data?.error?.code, "VALIDATION_ERROR");
  },
);

Deno.test(
  "POST /health — should return 401 when unauthenticated",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      "/health",
      { method: "POST", body: JSON.stringify({ data: { value: 80 } }) },
    );

    assertEquals(status, 401);
  },
);

// ============================================
// GET /health — List
// ============================================
Deno.test(
  "GET /health — should list health records with default pagination",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status, data } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>[]>
    >(
      "/health",
      {},
      testApp.token,
    );

    assertEquals(status, 200);
    assertEquals(data?.ok, true);
    assertEquals(Array.isArray(data?.data), true);
    assertEquals(typeof data?.hasMore, "boolean");
  },
);

Deno.test(
  "GET /health — should respect limit query parameter",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status, data } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>[]>
    >(
      "/health?limit=5",
      {},
      testApp.token,
    );

    assertEquals(status, 200);
    assertEquals(Array.isArray(data?.data), true);
    assertEquals((data?.data?.length ?? 0) <= 5, true);
  },
);

Deno.test(
  "GET /health — should return 400 when limit is less than 1",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status, data } = await testApp.fetchClient<ApiResponse<null>>(
      "/health?limit=0",
      {},
      testApp.token,
    );

    assertEquals(status, 400);
    assertEquals(data?.ok, false);
    assertEquals(data?.error?.code, "VALIDATION_ERROR");
  },
);

Deno.test(
  "GET /health — should return 401 when unauthenticated",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>[]>
    >(
      "/health",
    );

    assertEquals(status, 401);
  },
);

// ============================================
// GET /health/:id — Single Record
// ============================================
Deno.test(
  "GET /health/:id — should return a single health record by ID",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    // First create a record
    const createRes = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      "/health",
      { method: "POST", body: JSON.stringify({ data: { test: "find-me" } }) },
      testApp.token,
    );
    const recordId = createRes.data?.data?.id;

    // Then fetch it
    const { status, data } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      `/health/${recordId}`,
      {},
      testApp.token,
    );

    assertEquals(status, 200);
    assertEquals(data?.ok, true);
    assertEquals(data?.data?.id, recordId);
  },
);

Deno.test(
  "GET /health/:id — should return 404 when record does not exist",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status, data } = await testApp.fetchClient<ApiResponse<null>>(
      "/health/999999",
      {},
      testApp.token,
    );

    assertEquals(status, 404);
    assertEquals(data?.error?.code, "NOT_FOUND");
  },
);

// ============================================
// PATCH /health/:id — Update
// ============================================
Deno.test(
  "PATCH /health/:id — should update an existing health record",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    // Create
    const createRes = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      "/health",
      { method: "POST", body: JSON.stringify({ data: { original: true } }) },
      testApp.token,
    );
    const recordId = createRes.data?.data?.id;

    // Update
    const updateBody: z.infer<typeof HealthUpdateSchema> = {
      data: { updated: true, score: 100 },
    };
    const { status, data } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      `/health/${recordId}`,
      { method: "PATCH", body: JSON.stringify(updateBody) },
      testApp.token,
    );

    assertEquals(status, 200);
    assertEquals(data?.ok, true);
    assertEquals((data?.data?.data as Record<string, unknown>)?.updated, true);
  },
);

Deno.test(
  "PATCH /health/:id — should return 404 when record does not exist",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status, data } = await testApp.fetchClient<ApiResponse<null>>(
      "/health/999998",
      { method: "PATCH", body: JSON.stringify({ data: { value: 70 } }) },
      testApp.token,
    );

    assertEquals(status, 404);
    assertEquals(data?.error?.code, "NOT_FOUND");
  },
);

// ============================================
// DELETE /health/:id — Delete
// ============================================
Deno.test(
  "DELETE /health/:id — should delete an existing health record and return 204",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    // Create
    const createRes = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      "/health",
      { method: "POST", body: JSON.stringify({ data: { delete: "me" } }) },
      testApp.token,
    );
    const recordId = createRes.data?.data?.id;

    // Delete
    const { status, data, response } = await testApp.fetchClient<
      ApiResponse<null>
    >(
      `/health/${recordId}`,
      { method: "DELETE" },
      testApp.token,
    );

    assertEquals(status, 204);
    assertEquals(data, null);
    assertEquals(response.headers.get("content-type"), null);
  },
);

Deno.test(
  "DELETE /health/:id — should return 404 when record does not exist",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status, data } = await testApp.fetchClient<ApiResponse<null>>(
      "/health/999997",
      { method: "DELETE" },
      testApp.token,
    );

    assertEquals(status, 404);
    assertEquals(data?.error?.code, "NOT_FOUND");
  },
);

Deno.test(
  "DELETE /health/:id — should return 401 when unauthenticated",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    const { status } = await testApp.fetchClient<ApiResponse<null>>(
      "/health/1",
      { method: "DELETE" },
    );

    assertEquals(status, 401);
  },
);

// ============================================
// GET /health/:id/gap-test — Test only
// ============================================
Deno.test(
  "GET /health/:id/gap-test — should return the date gap for a health record",
  { sanitizeResources: false, sanitizeOps: false },
  async () => {
    // Create a record first
    const createRes = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectSchema>>
    >(
      "/health",
      { method: "POST", body: JSON.stringify({ data: { test: "gap-test" } }) },
      testApp.token,
    );
    const recordId = createRes.data?.data?.id;

    // Then test the gap-test endpoint
    const { status, data } = await testApp.fetchClient<
      ApiResponse<z.infer<typeof HealthSelectWithDateGapSchema>>
    >(
      `/health/${recordId}/gap-test`,
      {},
      testApp.token,
    );
    assertEquals(status, 200);
    assertEquals(data?.ok, true);
    assertExists(data?.data);
    assertEquals(typeof data?.data?.dateGap, "number");
  },
);
