import { AppShell, type NavItem } from "@/components/app-shell";
import { requirePortal } from "@/lib/guard";

const nav: NavItem[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/agencies", label: "Agencies" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/audit", label: "Audit log" },
  { href: "/admin/support", label: "Support" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal("admin");
  return (
    <AppShell user={user} nav={nav} portalLabel="KairosCare internal">
      {children}
    </AppShell>
  );
}
