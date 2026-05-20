import { prisma } from "./prisma";

// HIPAA audit hand-off. Every PHI read/write goes through here.
// Failures are logged but do NOT throw — auditing must never break the
// underlying request, just leave a trace investigators can follow.

export type AuditPayload = {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  agencyId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  payload?: Record<string, unknown> | null;
};

export async function recordAudit(entry: AuditPayload) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: entry.actorUserId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        agencyId: entry.agencyId ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        payload: (entry.payload ?? {}) as object,
      },
    });
  } catch (err) {
    // Last-resort: surface to server logs so we can find missed writes.
    console.error("[audit] failed to persist", entry.action, err);
  }
}
