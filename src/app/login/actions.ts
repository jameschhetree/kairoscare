"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { pickPrimaryRole, portalForRole } from "@/lib/roles";

// Phase-1 login. The seed stashes a bcrypt hash inside AuditLog.payload for
// each user (action `seed.user.created`). We look that up here, verify, and
// hand back a signed cookie. Phase 2 (Supabase Auth) replaces this entire
// action — the rest of the codebase calls `getSessionUser()` and won't change.

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=invalid");

  const user = await prisma.user.findUnique({
    where: { email },
    include: { roleAssignments: true },
  });
  if (!user || !user.isActive) {
    redirect("/login?error=invalid");
  }

  // Read the hash from the seed audit row. (Schema-only Phase-1 shim — DO NOT
  // copy this pattern in production. Real Supabase Auth ships in Phase 2.)
  const seedRow = await prisma.auditLog.findFirst({
    where: {
      entityType: "User",
      entityId: user.id,
      action: "seed.user.created",
    },
  });
  const hash =
    (seedRow?.payload as { demoPasswordHash?: string } | null)?.demoPasswordHash ?? null;
  if (!hash) redirect("/login?error=invalid");

  const ok = await bcrypt.compare(password, hash);
  if (!ok) redirect("/login?error=invalid");

  await setSession(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const h = await headers();
  await recordAudit({
    actorUserId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
    agencyId: user.agencyId ?? null,
    ipAddress: h.get("x-forwarded-for") ?? h.get("x-real-ip"),
    userAgent: h.get("user-agent"),
  });

  const role = pickPrimaryRole(user.roleAssignments.map((r) => r.role));
  if (!role) redirect("/login?error=invalid");
  const portal = portalForRole(role);
  redirect(`/${portal}`);
}

export async function logoutAction() {
  const { clearSession } = await import("@/lib/session");
  await clearSession();
  redirect("/");
}
