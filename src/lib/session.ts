// Phase-1 session shim.
//
// Phase 1 ships a thin demo-credentials login that signs an HMAC cookie
// containing the User.id. When Supabase Auth is wired up in Phase 2 this
// helper switches to reading the Supabase JWT instead — every call site
// already goes through getSessionUser(), so the swap is local.

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "./prisma";
import { pickPrimaryRole, portalForRole } from "./roles";
import type { User, UserRoleAssignment, UserRole } from "@prisma/client";

const COOKIE_NAME = "kairoscare_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8h

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET missing or too short.");
  }
  return s;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function pack(userId: string) {
  const sig = sign(userId);
  return `${userId}.${sig}`;
}

function unpack(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(userId);
  try {
    if (sig.length !== expected.length) return null;
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function setSession(userId: string) {
  const c = await cookies();
  c.set({
    name: COOKIE_NAME,
    value: pack(userId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export type SessionUser = User & {
  roleAssignments: UserRoleAssignment[];
  primaryRole: UserRole | null;
  portal: ReturnType<typeof portalForRole> | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const c = await cookies();
  const raw = c.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const userId = unpack(raw);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roleAssignments: true },
  });
  if (!user || !user.isActive) return null;
  const primaryRole = pickPrimaryRole(user.roleAssignments.map((r) => r.role));
  return {
    ...user,
    primaryRole,
    portal: primaryRole ? portalForRole(primaryRole) : null,
  };
}
