import { apiKeyRepo } from "./api-key.repo.ts";
import { AppError, ERROR_CODE } from "@/shared/errors/error-factory.ts";
import type { ApiKeyCreatedResponseSchema } from "./api-key.dto.ts";
import bcrypt from "bcryptjs";
import { z } from "zod/v4";

const KEY_PREFIX = "gtool_sk_";
const KEY_LENGTH_BYTES = 32;
const TEST_MODE = Deno.env.get("TEST_MODE") === "1";

/**
 * In TEST_MODE: uses SHA-256 (near-instant, ~1ms) instead of bcrypt.
 * In production: uses bcrypt with cost=12.
 *
 * WARNING: SHA-256 is NOT cryptographically secure for password storage.
 * Only use TEST_MODE=true in test/development environments.
 */
async function hashKey(rawKey: string): Promise<string> {
  if (TEST_MODE) {
    // SHA-256 is ~30,000x faster than bcrypt — negligible overhead in tests
    const bytes = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(rawKey),
    );
    return "test_sha256:" + btoa(String.fromCharCode(...new Uint8Array(bytes)));
  }
  return await bcrypt.hash(rawKey, 12);
}

async function verifyHash(
  rawKey: string,
  storedHash: string,
): Promise<boolean> {
  if (TEST_MODE && storedHash.startsWith("test_sha256:")) {
    const bytes = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(rawKey),
    );
    const candidate = "test_sha256:" +
      btoa(String.fromCharCode(...new Uint8Array(bytes)));
    return candidate === storedHash;
  }
  return await bcrypt.compare(rawKey, storedHash);
}

function generateApiKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(KEY_LENGTH_BYTES));
  const base64url = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return KEY_PREFIX + base64url;
}

export const apiKeyService = {
  /** Generates a new API key, hashes it, stores the hash + prefix.
   * Returns the full key to the caller (shown exactly once). */
  create: async (
    name: string,
    userId: string,
  ): Promise<
    { key: string; record: z.infer<typeof ApiKeyCreatedResponseSchema> }
  > => {
    const rawKey = generateApiKey();
    const keyPrefix = rawKey.slice(0, 12);
    const keyHash = await hashKey(rawKey);

    const record = await apiKeyRepo.create({
      name,
      keyHash,
      keyPrefix,
      userId,
    });

    return {
      key: rawKey,
      record: {
        id: record.id,
        name: record.name,
        key: rawKey,
        keyPrefix: record.keyPrefix,
        createdAt: record.createdAt.toISOString(),
      },
    };
  },

  /** Lists all API keys for a user (including revoked, for audit).
   * Never returns the hash or full key. */
  list: async (userId: string) => {
    return await apiKeyRepo.findByUser(userId);
  },

  /** Revokes an API key by id (soft delete). Verifies ownership before revoking. */
  revoke: async (id: string, userId: string): Promise<void> => {
    const keys = await apiKeyRepo.findByUser(userId);
    const key = keys.find((k) => k.id === id);
    if (!key) {
      throw new AppError(ERROR_CODE.API_KEY_NOT_FOUND, { id });
    }
    if (key.revokedAt !== null) {
      throw new AppError(ERROR_CODE.API_KEY_NOT_FOUND, {
        id,
        reason: "already revoked",
      });
    }
    await apiKeyRepo.revoke(id);
  },

  /** Verifies a raw API key against stored hash.
   * Returns the userId if valid and not revokedAt, null otherwise. */
  verify: async (rawKey: string): Promise<string | null> => {
    if (!rawKey.startsWith(KEY_PREFIX)) {
      return null;
    }
    const keyPrefix = rawKey.slice(0, 12);

    // findByPrefixAndHash already skips revoked keys
    const record = await apiKeyRepo.findByPrefixAndHash(keyPrefix);
    if (!record) {
      return null;
    }

    const valid = await verifyHash(rawKey, record.keyHash);
    return valid ? record.userId : null;
  },
};
