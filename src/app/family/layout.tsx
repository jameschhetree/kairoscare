import { AppShell, type NavItem } from "@/components/app-shell";
import { requirePortal } from "@/lib/guard";

const nav: NavItem[] = [
  { href: "/family", label: "Overview" },
  { href: "/family/timeline", label: "Timeline" },
  { href: "/family/invite", label: "Invite family" },
  { href: "/family/settings", label: "Settings" },
];

export default async function FamilyLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal("family");
  return (
    <AppShell user={user} nav={nav} portalLabel="Family portal">
      {children}
    </AppShell>
  );
}
