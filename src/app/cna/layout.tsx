import { AppShell, type NavItem } from "@/components/app-shell";
import { requirePortal } from "@/lib/guard";

const nav: NavItem[] = [
  { href: "/cna", label: "Today" },
  { href: "/cna/visits", label: "Visits" },
  { href: "/cna/history", label: "History" },
];

export default async function CnaLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal("cna");
  return (
    <AppShell user={user} nav={nav} portalLabel="Caregiver portal">
      {children}
    </AppShell>
  );
}
