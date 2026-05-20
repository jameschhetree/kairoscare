import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { ROLE_LABEL } from "@/lib/roles";
import { WordmarkLight } from "./wordmark";
import type { SessionUser } from "@/lib/session";

export type NavItem = { href: string; label: string };

export function AppShell({
  user,
  nav,
  portalLabel,
  children,
}: {
  user: SessionUser;
  nav: NavItem[];
  portalLabel: string;
  children: React.ReactNode;
}) {
  const roleLabel = user.primaryRole ? ROLE_LABEL[user.primaryRole] : "Member";

  return (
    <div className="min-h-screen surface-grain">
      <header className="border-b border-[color:var(--color-warm-hairline)] bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-6">
            <Link href="/">
              <WordmarkLight />
            </Link>
            <span className="hidden text-[0.74rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)] md:inline">
              {portalLabel}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-[color:var(--color-navy-900)]">{user.fullName}</p>
              <p className="text-[0.74rem] text-[color:var(--color-warm-muted)]">{user.email}</p>
            </div>
            <span className="role-badge" data-testid="role-badge">{roleLabel}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-[color:var(--color-warm-muted)] hover:text-[color:var(--color-navy-900)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-10 md:grid-cols-[220px_1fr] md:gap-12 md:px-10">
        <aside className="hidden md:block">
          <nav className="sticky top-10 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-[var(--radius-md)] px-3 py-2 text-[0.92rem] text-[color:var(--color-warm-ink)] hover:bg-[color:var(--color-cream-200)] hover:text-[color:var(--color-navy-900)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </div>
    </div>
  );
}

export function ComingSoonCard({
  title,
  body,
  phase,
}: {
  title: string;
  body: string;
  phase: "Phase 2" | "Phase 3" | "Phase 4" | "Phase 5";
}) {
  return (
    <div className="card relative overflow-hidden p-8 md:p-10">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, rgba(125, 183, 232, 0.18), transparent 40%), radial-gradient(circle at 90% 90%, rgba(95, 169, 120, 0.12), transparent 45%)",
        }}
      />
      <p className="text-[0.74rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
        {phase} · Coming next
      </p>
      <h2 className="mt-3 font-display text-[1.8rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.2rem]">
        {title}
      </h2>
      <p className="mt-3 max-w-[620px] text-[color:var(--color-warm-ink)]">{body}</p>
    </div>
  );
}
