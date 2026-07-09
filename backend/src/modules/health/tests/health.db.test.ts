import { healthRepo } from "../health.repo.ts";
import { closePool } from "@/db/pool.ts";
import { assertEquals } from "@std/assert/equals";
import { assertExists } from "@std/assert/exists";
import type { HealthSelectSchema } from "../health.dto.ts";
import z from "zod/v4";

Deno.test.afterAll(async () => {
  await closePool();
});

Deno.test(
  "Health Repository",
  { sanitizeResources: false, sanitizeOps: false },
  async (t) => {
    let createdData: z.infer<typeof HealthSelectSchema>;

    await t.step("Create health record", async () => {
      const data = await healthRepo.create({
        data: {
          test: "test",
        },
      });
      assertEquals(typeof data, "object");
      assertEquals(typeof data.id, "number");
      assertEquals(typeof data.data, "object");
      assertEquals((data.data as Record<string, unknown>).test, "test");
      assertExists(data.createdAt);
      assertExists(data.updatedAt);
      createdData = data;
    });

    await t.step("Find many health records", async () => {
      const result = await healthRepo.findMany({
        limit: 10,
      });
      assertEquals(Array.isArray(result.data), true);
      assertExists(result.data[0]);
      assertEquals(result.data[0]!.id, createdData.id);
      assertEquals(result.data[0]!.data, createdData.data);
      assertEquals(result.data[0]!.createdAt, createdData.createdAt);
      assertEquals(result.data[0]!.updatedAt, createdData.updatedAt);
    });

    await t.step("Find one health record", async () => {
      const data = await healthRepo.findOne(createdData.id);
      assertEquals(data, createdData);
    });

    await t.step("Update health record", async () => {
      const data = await healthRepo.update(createdData.id, {
        data: { test: "updated" },
      });
      assertEquals(data!.id, createdData.id);
      assertEquals(data!.data, { test: "updated" });
      assertEquals(data!.createdAt, createdData.createdAt);
    });

    await t.step("Delete health record", async () => {
      await healthRepo.delete(createdData.id);
      const data = await healthRepo.findOne(createdData.id);
      assertEquals(data, null);
    });
  },
);
