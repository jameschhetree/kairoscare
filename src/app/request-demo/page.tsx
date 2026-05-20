import Link from "next/link";
import { WordmarkLight } from "@/components/wordmark";
import { submitDemoRequest } from "./actions";

export default async function RequestDemoPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;

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
            Pilot program
          </p>
          <h1 className="font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.8rem]">
            Run KairosCare with three of your highest-touch clients.
          </h1>
          <p className="mt-3 max-w-[460px] text-[color:var(--color-warm-ink)]">
            Tell us a little about your agency. We&apos;ll reply within a business
            day with onboarding steps and a 20-minute pilot kickoff slot.
          </p>

          {success ? (
            <div className="card mt-8 p-6">
              <p className="font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)]">
                Thanks — we&apos;ve got it.
              </p>
              <p className="mt-2 text-[color:var(--color-warm-ink)]">
                You&apos;ll hear back from our team within one business day. If
                you&apos;d like to peek at the product first,{" "}
                <Link href="/login" className="underline">
                  log in with a demo account
                </Link>{" "}
                using the credentials on the login page.
              </p>
            </div>
          ) : (
            <form action={submitDemoRequest} className="card mt-8 space-y-4 p-6">
              <Field
                id="fullName"
                label="Your name"
                placeholder="Patricia Doyle"
                required
              />
              <Field
                id="agency"
                label="Agency name"
                placeholder="BrightPath Home Care"
                required
              />
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="you@agency.com"
                required
              />
              <Field
                id="phone"
                label="Phone (optional)"
                type="tel"
                placeholder="+1 (555) 555-0123"
              />
              <Field
                id="clients"
                label="How many active clients are you serving today?"
                placeholder="e.g. 18"
              />
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-[color:var(--color-navy-900)]"
                >
                  Anything we should know?
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white px-3 py-2.5 text-[0.95rem] outline-none focus:border-[color:var(--color-sky-700)] focus:ring-2 focus:ring-[color:var(--color-sky-300)]"
                  placeholder="Biggest reason families call you. What would 'great' look like?"
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center">
                Send pilot request
              </button>
              <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">
                We never share your information. BAA available on request.
              </p>
            </form>
          )}
        </div>

        <aside className="card h-fit p-6">
          <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">
            What you&apos;ll get
          </p>
          <ul className="mt-4 space-y-3 text-[0.92rem] text-[color:var(--color-warm-ink)]">
            <Bullet>25-minute onboarding for your CNAs (Spanish-capable)</Bullet>
            <Bullet>Family invite templates and a script for the first call</Bullet>
            <Bullet>Weekly engagement review with a KairosCare lead</Bullet>
            <Bullet>90 days free. BAA-ready vendor stack.</Bullet>
          </ul>
          <p className="mt-6 text-[0.78rem] text-[color:var(--color-warm-muted)]">
            Already onboarded?{" "}
            <Link href="/login" className="text-[color:var(--color-navy-900)] underline">
              Log in here.
            </Link>
          </p>
        </aside>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  type = "text",
  placeholder,
  required,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[color:var(--color-navy-900)]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white px-3 py-2.5 text-[0.95rem] outline-none focus:border-[color:var(--color-sky-700)] focus:ring-2 focus:ring-[color:var(--color-sky-300)]"
      />
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-sky-700)]" />
      <span>{children}</span>
    </li>
  );
}
