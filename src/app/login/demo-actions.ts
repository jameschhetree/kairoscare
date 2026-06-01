"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PortalScope } from "@/lib/roles";

// Cookie-only demo login. Zero Prisma calls. Sets an HTTP-only cookie
// with the portal scope and redirects. Downstream layouts read the
// cookie and serve in-memory demo data from /lib/demo-seed.ts.

const DEMO_COOKIE = "demo_role";
const VALID_ROLES: PortalScope[] = ["agency", "admin", "family", "cna"];

export async function demoLoginAction(formData: FormData) {
  const role = String(formData.get("demo_role") ?? "") as PortalScope;
  if (!VALID_ROLES.includes(role)) redirect("/login?error=invalid");

  const c = await cookies();
  c.set({
    name: DEMO_COOKIE,
    value: role,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect(`/${role}`);
}
