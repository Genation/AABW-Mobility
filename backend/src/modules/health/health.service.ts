import { healthRepo } from "./health.repo.ts";
import { AppError, ERROR_CODE } from "@/shared/errors/error-factory.ts";
import type {
  HealthCreateSchema,
  HealthQuerySchema,
  HealthSelectSchema,
  HealthSelectWithDateGapSchema,
  HealthUpdateSchema,
} from "./health.dto.ts";
import z from "zod/v4";

export const healthService = {
  create: async (
    data: z.infer<typeof HealthCreateSchema>,
  ): Promise<z.infer<typeof HealthSelectSchema>> => {
    return await healthRepo.create(data);
  },

  findMany: async (query: z.infer<typeof HealthQuerySchema>) => {
    return await healthRepo.findMany(query);
  },

  findOne: async (id: number): Promise<z.infer<typeof HealthSelectSchema>> => {
    const record = await healthRepo.findOne(id);
    if (!record) {
      throw new AppError(ERROR_CODE.NOT_FOUND, { id: String(id) });
    }
    return record;
  },

  update: async (
    id: number,
    data: z.infer<typeof HealthUpdateSchema>,
  ): Promise<z.infer<typeof HealthSelectSchema>> => {
    const existing = await healthRepo.findOne(id);
    if (!existing) {
      throw new AppError(ERROR_CODE.NOT_FOUND, { id: String(id) });
    }
    const result = await healthRepo.update(id, data);
    if (!result) {
      throw new AppError(ERROR_CODE.NOT_FOUND, { id: String(id) });
    }
    return result;
  },

  delete: async (id: number): Promise<void> => {
    const existing = await healthRepo.findOne(id);
    if (!existing) {
      throw new AppError(ERROR_CODE.NOT_FOUND, { id: String(id) });
    }
    await healthRepo.delete(id);
  },
  getDateGap: async (
    id: number,
  ): Promise<z.infer<typeof HealthSelectWithDateGapSchema>> => {
    const record = await healthRepo.findOne(id);
    if (!record) {
      throw new AppError(ERROR_CODE.NOT_FOUND, { id: String(id) });
    }
    return {
      id: record.id,
      createdAt: record.createdAt,
      dateGap: record.createdAt.getTime() - new Date().getTime(),
    };
  },
};
