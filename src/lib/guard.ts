import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";
import { getDemoRole, getDemoUser } from "./demo-seed";
import type { PortalScope } from "./roles";

// Server-side gate used by every authed page. Checks the demo_role
// cookie first (no DB hit). Falls back to the real session cookie
// which hits Prisma. If both are absent, redirect to /login.

export async function requirePortal(scope: PortalScope): Promise<SessionUser> {
  // 1. Check demo cookie (zero Prisma)
  const demoRole = await getDemoRole();
  if (demoRole) {
    if (demoRole !== scope) {
      redirect(`/${demoRole}`);
    }
    return getDemoUser(demoRole);
  }

  // 2. Fall back to real session
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.portal !== scope) {
    redirect(user.portal ? `/${user.portal}` : "/login");
  }
  return user;
}
