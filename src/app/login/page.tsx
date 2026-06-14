import Link from "next/link";
import { Building2, Shield, Users, Heart } from "lucide-react";
import { loginAction } from "./actions";
import { demoLoginAction } from "./demo-actions";
import { WordmarkLight } from "@/components/wordmark";

// Login page with Quick Demo Access buttons above the email form.
// Demo buttons bypass password auth entirely for frictionless demo flow.

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="surface-grain min-h-screen">
      <div className="mx-auto flex max-w-[1240px] flex-col px-4 py-6 sm:px-6 sm:py-8 md:px-10">
        <Link href="/" className="inline-flex">
          <WordmarkLight />
        </Link>
      </div>

      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 pb-24 pt-4 sm:px-6 md:grid-cols-[0.55fr_0.45fr] md:gap-20 md:px-10">
        <div>
          <p className="mb-3 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
            Welcome back
          </p>
          <h1 className="font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.8rem]">
            Log in to KairosCare
          </h1>
          <p className="mt-3 max-w-[440px] text-[color:var(--color-warm-ink)]">
            Caregivers, families, agency staff, and KairosCare team. One place,
            same door. We route you to the right portal.
          </p>

          {/* QUICK DEMO ACCESS */}
          <div className="mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-sky-300)]/40 bg-gradient-to-br from-[color:var(--color-sky-100)]/40 to-[color:var(--color-cream-50)] p-4 sm:mt-8 sm:p-6">
            <p className="mb-1 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
              Quick Demo Access
            </p>
            <p className="mb-4 text-[0.88rem] text-[color:var(--color-warm-ink)] sm:mb-5">
              Jump into any portal instantly. No password needed.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <form action={demoLoginAction}>
                <input type="hidden" name="demo_role" value="agency" />
                <button
                  type="submit"
                  className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-4 text-left transition-all hover:border-[color:var(--color-sky-500)] hover:shadow-[var(--shadow-soft)] sm:flex-col sm:items-start sm:gap-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-navy-900)] text-[color:var(--color-cream-50)] sm:h-9 sm:w-9">
                    <Building2 size={18} className="sm:h-4 sm:w-4" />
                  </span>
                  <div>
                    <span className="block font-display text-[1rem] font-semibold text-[color:var(--color-navy-900)]">
                      Enter as Agency
                    </span>
                    <span className="text-[0.78rem] text-[color:var(--color-warm-muted)]">
                      Bright Care Home Health (DMV)
                    </span>
                  </div>
                </button>
              </form>

              <form action={demoLoginAction}>
                <input type="hidden" name="demo_role" value="admin" />
                <button
                  type="submit"
                  className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-4 text-left transition-all hover:border-[color:var(--color-sky-500)] hover:shadow-[var(--shadow-soft)] sm:flex-col sm:items-start sm:gap-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-sky-700)] text-[color:var(--color-cream-50)] sm:h-9 sm:w-9">
                    <Shield size={18} className="sm:h-4 sm:w-4" />
                  </span>
                  <div>
                    <span className="block font-display text-[1rem] font-semibold text-[color:var(--color-navy-900)]">
                      Enter as Admin
                    </span>
                    <span className="text-[0.78rem] text-[color:var(--color-warm-muted)]">
                      KairosCare internal backoffice
                    </span>
                  </div>
                </button>
              </form>

              <form action={demoLoginAction}>
                <input type="hidden" name="demo_role" value="family" />
                <button
                  type="submit"
                  className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-4 text-left transition-all hover:border-[color:var(--color-sky-500)] hover:shadow-[var(--shadow-soft)] sm:flex-col sm:items-start sm:gap-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-positive)] text-[color:var(--color-cream-50)] sm:h-9 sm:w-9">
                    <Heart size={18} className="sm:h-4 sm:w-4" />
                  </span>
                  <div>
                    <span className="block font-display text-[1rem] font-semibold text-[color:var(--color-navy-900)]">
                      Enter as Family
                    </span>
                    <span className="text-[0.78rem] text-[color:var(--color-warm-muted)]">
                      Eleanor Williams&apos; daughter
                    </span>
                  </div>
                </button>
              </form>

              <form action={demoLoginAction}>
                <input type="hidden" name="demo_role" value="cna" />
                <button
                  type="submit"
                  className="group flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-4 text-left transition-all hover:border-[color:var(--color-sky-500)] hover:shadow-[var(--shadow-soft)] sm:flex-col sm:items-start sm:gap-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-mood-calm)] text-[color:var(--color-cream-50)] sm:h-9 sm:w-9">
                    <Users size={18} className="sm:h-4 sm:w-4" />
                  </span>
                  <div>
                    <span className="block font-display text-[1rem] font-semibold text-[color:var(--color-navy-900)]">
                      Enter as CNA
                    </span>
                    <span className="text-[0.78rem] text-[color:var(--color-warm-muted)]">
                      Caregiver Maria Lopez
                    </span>
                  </div>
                </button>
              </form>
            </div>
          </div>

          {/* STANDARD LOGIN FORM */}
          <div className="card mt-6 p-4 sm:mt-8 sm:p-6">
            <p className="mb-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
              Or sign in with credentials
            </p>
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
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white px-3 py-3 text-[1rem] outline-none focus:border-[color:var(--color-sky-700)] focus:ring-2 focus:ring-[color:var(--color-sky-300)] sm:py-2.5 sm:text-[0.95rem]"
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
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white px-3 py-3 text-[1rem] outline-none focus:border-[color:var(--color-sky-700)] focus:ring-2 focus:ring-[color:var(--color-sky-300)] sm:py-2.5 sm:text-[0.95rem]"
                  placeholder="Demo2026!"
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

        <aside className="card h-fit p-4 sm:p-6">
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
              role="Family (primary)"
              note="Sees Eleanor's timeline"
            />
            <DemoCred
              email="owner@brightpath.demo"
              role="Agency owner"
              note="Bright Care Home Health dashboard"
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
        {role} / {note}
      </p>
    </li>
  );
}
