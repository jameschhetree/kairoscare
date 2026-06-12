"use server";

// Daily improvement 2026-06-12 — first ACTION cycle (per the 06-09 shift away
// from pure read-enrichment). Ends a CNA-Client assignment from /agency/clients/[id].
// Sets endDate=now on the assignment row. Validates agency scope so an agency
// can't terminate another agency's assignment. Records audit. Revalidates the
// detail page so the assignment list re-renders without the ended row.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { recordAudit } from "@/lib/audit";

export type EndAssignmentResult =
  | { ok: true; endedAt: string }
  | { ok: false; error: string };

export async function endAssignmentAction(
  assignmentId: string,
  clientId: string,
): Promise<EndAssignmentResult> {
  const user = await getSessionUser();
  if (!user?.agencyId) {
    return { ok: false, error: "Not authenticated" };
  }

  const assignment = await prisma.cNAClientAssignment.findUnique({
    where: { id: assignmentId },
    include: { cna: { include: { user: true } }, client: true },
  });

  if (!assignment) return { ok: false, error: "Assignment not found" };
  if (assignment.agencyId !== user.agencyId) {
    return { ok: false, error: "Assignment is not in your agency" };
  }
  if (assignment.endDate !== null) {
    return { ok: false, error: "Assignment already ended" };
  }

  const now = new Date();
  await prisma.cNAClientAssignment.update({
    where: { id: assignmentId },
    data: { endDate: now },
  });

  await recordAudit({
    actorUserId: user.id,
    action: "cna_assignment.ended",
    entityType: "CNAClientAssignment",
    entityId: assignmentId,
    agencyId: user.agencyId,
    payload: {
      cnaName: assignment.cna.user.fullName,
      clientName: assignment.client.fullName,
      endedAt: now.toISOString(),
    },
  });

  revalidatePath(`/agency/clients/${clientId}`);
  revalidatePath("/agency/clients");

  return { ok: true, endedAt: now.toISOString() };
}
