import Link from "next/link";
import { loginAction } from "./actions";
import { WordmarkLight } from "@/components/wordmark";

// Phase-1 demo login. Supabase Auth replaces this in Phase 2 — the route +
// the loginAction signature remain identical so the swap is contained.

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="surface-grain min-h-screen">
      <div className="mx-auto flex max-w-[1240px] flex-col px-6 py-8 md:px-10">
        <Link href="/" className="inline-flex">
          <WordmarkLight />
        </Link>
      </div>

      <div className="mx-auto grid max-w-[1100px] gap-12 px-6 pb-24 pt-4 md:grid-cols-[0.55fr_0.45fr] md:gap-20 md:px-10">
        <div>
          <p className="mb-3 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
            Welcome back
          </p>
          <h1 className="font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.8rem]">
            Log in to KairosCare
          </h1>
          <p className="mt-3 max-w-[440px] text-[color:var(--color-warm-ink)]">
            Caregivers, families, agency staff, and KairosCare team — one place,
            same door. We&apos;ll route you to the right home.
          </p>

          <div className="card mt-8 p-6">
            <form action={loginAction} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[color:var(--color-navy-900)]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white px-3 py-2.5 text-[0.95rem] outline-none focus:border-[color:var(--color-sky-700)] focus:ring-2 focus:ring-[color:var(--color-sky-300)]"
                  placeholder="you@agency.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[color:var(--color-navy-900)]">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white px-3 py-2.5 text-[0.95rem] outline-none focus:border-[color:var(--color-sky-700)] focus:ring-2 focus:ring-[color:var(--color-sky-300)]"
                  placeholder="••••••••"
                />
              </div>

              {error ? (
                <p className="rounded-[var(--radius-sm)] bg-[color:var(--color-mood-anxious)]/10 px-3 py-2 text-[0.85rem] text-[color:var(--color-mood-unwell)]">
                  {error === "invalid"
                    ? "That email and password didn't match an active account."
                    : "Something went wrong. Try again."}
                </p>
              ) : null}

              <button type="submit" className="btn-primary w-full justify-center">
                Log in
              </button>
            </form>
            <p className="mt-4 text-[0.78rem] text-[color:var(--color-warm-muted)]">
              No account yet?{" "}
              <Link href="/request-demo" className="text-[color:var(--color-navy-900)] underline">
                Request a demo
              </Link>{" "}
              and we&apos;ll set up your agency in 24 hours.
            </p>
          </div>
        </div>

        <aside className="card h-fit p-6">
          <p className="text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            Pilot demo credentials
          </p>
          <p className="mt-1 text-[0.86rem] text-[color:var(--color-warm-ink)]">
            Password for every demo account: <code className="rounded bg-[color:var(--color-cream-200)] px-1 py-0.5 font-mono text-[0.82rem]">Demo2026!</code>
          </p>
          <ul className="mt-4 space-y-3 text-[0.9rem]">
            <DemoCred
              email="maria@brightpath.demo"
              role="Caregiver (CNA)"
              note="Lands in the caregiver portal"
            />
            <DemoCred
              email="sarah.williams@demo.com"
              role="Family — primary"
              note="Sees Eleanor's timeline"
            />
            <DemoCred
              email="owner@brightpath.demo"
              role="Agency owner"
              note="BrightPath dashboard"
            />
            <DemoCred
              email="admin@kairoscare.com"
              role="KairosCare admin"
              note="Internal backoffice"
            />
          </ul>
        </aside>
      </div>
    </main>
  );
}

function DemoCred({ email, role, note }: { email: string; role: string; note: string }) {
  return (
    <li className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-50)] p-3">
      <p className="font-mono text-[0.84rem] text-[color:var(--color-navy-900)]">{email}</p>
      <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">
        {role} · {note}
      </p>
    </li>
  );
}
