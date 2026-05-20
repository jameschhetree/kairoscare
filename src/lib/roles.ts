import type { UserRole } from "@prisma/client";

export type PortalScope = "cna" | "family" | "agency" | "admin";

export const ROLE_TO_PORTAL: Record<UserRole, PortalScope> = {
  KairosSuperAdmin: "admin",
  KairosSupportAdmin: "admin",
  AgencyOwner: "agency",
  AgencyStaff: "agency",
  CNA: "cna",
  FamilyPrimary: "family",
  FamilyViewer: "family",
  HealthcareProxy: "family",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  KairosSuperAdmin: "KairosCare Admin",
  KairosSupportAdmin: "KairosCare Support",
  AgencyOwner: "Agency Owner",
  AgencyStaff: "Agency Staff",
  CNA: "Caregiver",
  FamilyPrimary: "Primary Family",
  FamilyViewer: "Family Viewer",
  HealthcareProxy: "Healthcare Proxy",
};

export function pickPrimaryRole(roles: UserRole[]): UserRole | null {
  if (roles.length === 0) return null;
  // Admin > Agency > CNA > Family — display preference for badge + portal landing.
  const order: UserRole[] = [
    "KairosSuperAdmin",
    "KairosSupportAdmin",
    "AgencyOwner",
    "AgencyStaff",
    "CNA",
    "FamilyPrimary",
    "HealthcareProxy",
    "FamilyViewer",
  ];
  for (const r of order) if (roles.includes(r)) return r;
  return roles[0];
}

export function portalForRole(role: UserRole): PortalScope {
  return ROLE_TO_PORTAL[role];
}
