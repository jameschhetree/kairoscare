import { AppShell, type NavItem } from "@/components/app-shell";
import { requirePortal } from "@/lib/guard";

const nav: NavItem[] = [
  { href: "/agency", label: "Dashboard" },
  { href: "/agency/clients", label: "Clients" },
  { href: "/agency/cnas", label: "Caregivers" },
  { href: "/agency/families", label: "Families" },
  { href: "/agency/assignments", label: "Assignments" },
  { href: "/agency/settings", label: "Settings" },
];

export default async function AgencyLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal("agency");
  return (
    <AppShell user={user} nav={nav} portalLabel="Agency portal">
      {children}
    </AppShell>
  );
}
