import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";
import type { PortalScope } from "./roles";

// Server-side gate used by every authed page. If the user is missing or
// holds the wrong portal role, we redirect — login on no-session, home on
// wrong-portal. No silent allows.

export async function requirePortal(scope: PortalScope): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.portal !== scope) {
    // Send the user to their own portal rather than a generic 403.
    redirect(user.portal ? `/${user.portal}` : "/login");
  }
  return user;
}
