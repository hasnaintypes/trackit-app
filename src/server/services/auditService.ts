import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { createLogger } from "@/lib/logging";
import { encryptField } from "@shared/encryption";
import { env } from "@/env";

const logger = createLogger("audit");

const SENSITIVE_FIELDS = new Set([
  "password",
  "token",
  "secret",
  "accessToken",
  "refreshToken",
  "idToken",
  "backupCodes",
  "currentPassword",
  "newPassword",
  "confirmPassword",
]);

interface AuditEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(key)) {
      cleaned[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = sanitize(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export class AuditService {
  static async log(entry: AuditEntry): Promise<void> {
    try {
      const metadata = entry.metadata
        ? (sanitize(entry.metadata) as Prisma.InputJsonValue)
        : undefined;

      const encryptedIp = encryptField(
        entry.ipAddress,
        env.FIELD_ENCRYPTION_KEY,
      );

      await db.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          metadata,
          ipAddress: encryptedIp,
          userAgent: entry.userAgent,
        },
      });
    } catch (error) {
      logger.error("failed to write audit log", {
        action: entry.action,
        userId: entry.userId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  static extractResourceType(action: string): string {
    return action.split(".")[0] ?? "unknown";
  }
}
