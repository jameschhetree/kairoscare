import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Camera,
  Cloud,
  ClipboardCheck,
  HeartHandshake,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { TimelinePreview } from "@/components/timeline-preview";
import { WordmarkOnDark } from "@/components/wordmark";

// Real copy throughout — no Lorem, no "[placeholder]", no AI-clean SaaS hero.
// The page intentionally avoids dead-center symmetry; the hero is an editorial
// asymmetric two-column with the live timeline preview on the right.

export default function Home() {
  return (
    <main className="surface-grain">
      <MarketingNav />

      {/* HERO */}
      <section className="relative px-6 pb-20 pt-8 md:px-10 md:pt-14">
        <div className="mx-auto max-w-[1240px]">
          <div className="editorial-grid">
            <div className="max-w-[600px]">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-warm-hairline)] bg-white/60 px-3 py-1 text-[0.74rem] font-medium tracking-wide uppercase text-[color:var(--color-warm-muted)]">
                <Sparkles size={12} className="text-[color:var(--color-sky-700)]" />
                Real-time care visibility · Built for home care
              </p>

              <h1 className="font-display text-[2.6rem] leading-[1.04] text-[color:var(--color-navy-900)] md:text-[3.6rem]">
                Every visit, <span className="italic text-[color:var(--color-sky-700)]">finally</span> shared.
              </h1>

              <p className="mt-5 max-w-[520px] text-lg leading-relaxed text-[color:var(--color-warm-ink)]">
                KairosCare helps caregivers share simple visit moments — a check-in,
                a meal, a mood — so families feel close to the people they love and
                home care agencies stop losing clients to silence.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/request-demo" className="btn-primary">
                  Request a demo
                  <ArrowUpRight size={16} />
                </Link>
                <Link href="/login" className="btn-secondary">
                  Caregiver / family log in
                </Link>
              </div>

              <dl className="mt-10 grid max-w-[480px] grid-cols-3 gap-6 border-t border-[color:var(--color-warm-hairline)] pt-6">
                <Stat label="Avg visit log" value="< 30s" />
                <Stat label="HIPAA-aware" value="Day one" />
                <Stat label="EN + ES" value="Caregiver UI" />
              </dl>
            </div>

            <div className="md:pl-6">
              <TimelinePreview />
              <p className="mt-4 text-center text-[0.78rem] italic text-[color:var(--color-warm-muted)] md:text-right">
                Sample timeline from a BrightPath Home Care morning visit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-50)] py-8">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-10 gap-y-3 px-6 text-[0.76rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)] md:px-10">
          <span>Designed with HIPAA-aware architecture</span>
          <span>Sits alongside HHAeXchange · WellSky · AxisCare</span>
          <span>Caregivers never charged</span>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 md:grid-cols-[0.4fr_0.6fr] md:gap-16">
            <div>
              <p className="mb-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
                How it works
              </p>
              <h2 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
                Three roles. <br />
                One quiet loop.
              </h2>
              <p className="mt-5 max-w-[460px] text-[color:var(--color-warm-ink)]">
                KairosCare doesn&apos;t replace your scheduling, EVV, or payroll. It
                fills the gap those tools never closed: the moment between a
                caregiver clocking in and a family hearing what actually happened.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <StepCard
                step="01"
                icon={<ClipboardCheck size={20} />}
                title="Caregivers log moments"
                body="One-tap mood, meal, activity, photo, note. Friendly, never clinical. EN + ES on the caregiver flow."
              />
              <StepCard
                step="02"
                icon={<HeartHandshake size={20} />}
                title="Families feel close"
                body="Warm, photo-rich timeline. Send a thank-you. Comment to the agency, not the caregiver."
              />
              <StepCard
                step="03"
                icon={<CalendarDays size={20} />}
                title="Agencies see proof"
                body="Engagement dashboards, clients-without-updates flags, family sentiment — every signal a buyer will ask for."
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOR AGENCIES */}
      <section id="for-agencies" className="bg-[color:var(--color-cream-50)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <div>
              <p className="mb-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
                For agencies
              </p>
              <h2 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
                The communication layer agencies keep promising and never ship.
              </h2>
              <p className="mt-5 max-w-[520px] text-[color:var(--color-warm-ink)]">
                Most home care churn isn&apos;t about the care — it&apos;s about the silence.
                KairosCare gives operators the receipts: an auditable record of
                every reassurance the family received, every reaction they sent
                back, and which clients are at risk of going quiet.
              </p>
              <ul className="mt-6 space-y-3 text-[0.96rem] text-[color:var(--color-warm-ink)]">
                <BulletRow>Auto-publish CNA updates on, off, or per-shift.</BulletRow>
                <BulletRow>&quot;Clients with no updates today&quot; alert on the dashboard.</BulletRow>
                <BulletRow>Family comments route to staff, never to caregivers directly.</BulletRow>
                <BulletRow>No surveillance scoring. Caregivers stay protected.</BulletRow>
              </ul>
            </div>
            <AgencyMockup />
          </div>
        </div>
      </section>

      {/* FAMILIES */}
      <section id="families" className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
            <FamilyMockup />
            <div>
              <p className="mb-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
                For families
              </p>
              <h2 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
                The reassurance you keep checking your phone for.
              </h2>
              <p className="mt-5 max-w-[520px] text-[color:var(--color-warm-ink)]">
                A timeline of small, honest moments — what Mom ate, how she felt,
                what she did today. Send a thank-you. Loop in a sibling. Talk to
                the agency, not the caregiver, when something needs follow-up.
              </p>
              <ul className="mt-6 space-y-3 text-[0.96rem] text-[color:var(--color-warm-ink)]">
                <BulletRow>Primary, viewer, and healthcare proxy roles — invite the whole family.</BulletRow>
                <BulletRow>Photos optional but encouraged. Stored encrypted, signed URLs only.</BulletRow>
                <BulletRow>No PHI in push notifications. Just &quot;a new update is ready&quot;.</BulletRow>
                <BulletRow>Free for families, always.</BulletRow>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section
        id="compliance"
        className="bg-[color:var(--color-navy-900)] px-6 py-24 text-[color:var(--color-cream-100)] md:px-10"
      >
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-10 md:grid-cols-[0.45fr_0.55fr] md:gap-16">
            <div>
              <p className="mb-4 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-300)]">
                Compliance-safe by design
              </p>
              <h2 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-cream-50)] md:text-[2.6rem]">
                Healthcare-grade plumbing. Family-grade warmth.
              </h2>
              <p className="mt-5 max-w-[480px] text-[color:var(--color-cream-300)]">
                Photos, mood notes, and meal logs are PHI. KairosCare is built like
                they are — encrypted storage, signed URLs, agency-scoped row level
                security, and an audit log on every PHI read and write. BAA-ready
                vendor stack from day one.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ComplianceCard
                icon={<Lock size={18} />}
                title="Encrypted by default"
                body="All photo uploads land in an encrypted Supabase Storage bucket. No public URLs — signed access only."
              />
              <ComplianceCard
                icon={<ShieldCheck size={18} />}
                title="Row-level isolation"
                body="Every PHI table is RLS-scoped by agencyId. CNAs see only assigned clients. Families see only linked clients."
              />
              <ComplianceCard
                icon={<MessageSquareText size={18} />}
                title="No PHI in messages"
                body="Push, SMS, and email notifications use generic language — 'a care update is ready' — never names or details."
              />
              <ComplianceCard
                icon={<Camera size={18} />}
                title="Auditable photo trail"
                body="Every photo viewed, every update read, every comment escalated — logged with actor, timestamp, and scope."
              />
            </div>
          </div>
        </div>
      </section>

      {/* PILOT CTA */}
      <section className="px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="card relative overflow-hidden p-10 md:p-14">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 opacity-70"
              style={{
                background:
                  "radial-gradient(circle at 12% 18%, rgba(125, 183, 232, 0.18), transparent 38%), radial-gradient(circle at 88% 92%, rgba(95, 169, 120, 0.14), transparent 42%)",
              }}
            />
            <div className="grid gap-10 md:grid-cols-[0.55fr_0.45fr] md:items-end">
              <div>
                <p className="mb-3 text-[0.76rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
                  Pilot program · Now accepting agencies
                </p>
                <h2 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
                  Run KairosCare with three of your highest-touch clients. Free for
                  90 days.
                </h2>
                <p className="mt-4 max-w-[500px] text-[color:var(--color-warm-ink)]">
                  We&apos;ll onboard your CNAs in a 25-minute training, invite the
                  families, and review engagement with you weekly. If your families
                  don&apos;t tell you it changed how they feel, you walk away.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Link href="/request-demo" className="btn-primary text-base">
                  Apply for the pilot
                  <ArrowUpRight size={16} />
                </Link>
                <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">
                  20-minute call · BAA on request · No engineering required
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[color:var(--color-navy-950)] px-6 py-14 text-[color:var(--color-cream-300)] md:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[420px]">
            <WordmarkOnDark />
            <p className="mt-4 text-sm leading-relaxed">
              Real-time care visibility for families and home care agencies.
              KairosCare does not replace EVV, payroll, or clinical documentation
              systems — it works alongside them.
            </p>
          </div>
          <div className="grid gap-8 text-sm md:grid-cols-3 md:text-right">
            <div>
              <p className="mb-2 uppercase text-[0.72rem] tracking-[0.18em] text-[color:var(--color-sky-300)]">
                Product
              </p>
              <a href="#how-it-works" className="block hover:text-white">How it works</a>
              <a href="#compliance" className="block hover:text-white">Compliance</a>
              <Link href="/login" className="block hover:text-white">Log in</Link>
            </div>
            <div>
              <p className="mb-2 uppercase text-[0.72rem] tracking-[0.18em] text-[color:var(--color-sky-300)]">
                Agencies
              </p>
              <Link href="/request-demo" className="block hover:text-white">Request demo</Link>
              <a href="mailto:hello@kairoscare.com" className="block hover:text-white">hello@kairoscare.com</a>
            </div>
            <div>
              <p className="mb-2 uppercase text-[0.72rem] tracking-[0.18em] text-[color:var(--color-sky-300)]">
                Legal
              </p>
              <span className="block">BAA available on request</span>
              <span className="flex items-center gap-1 md:justify-end">
                <Cloud size={12} /> Hosted in US-East
              </span>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[1240px] border-t border-white/10 pt-6 text-[0.74rem] text-[color:var(--color-cream-300)]">
          © {new Date().getFullYear()} KairosCare. Designed for the families we wish we&apos;d had time to call.
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.74rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">{label}</dt>
      <dd className="mt-1 font-display text-xl text-[color:var(--color-navy-900)]">{value}</dd>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  body,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between text-[color:var(--color-warm-muted)]">
        <span className="font-display text-[0.78rem] tracking-[0.2em] uppercase">{step}</span>
        <span className="text-[color:var(--color-sky-700)]">{icon}</span>
      </div>
      <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">{title}</p>
      <p className="text-[0.92rem] text-[color:var(--color-warm-ink)]">{body}</p>
    </div>
  );
}

function BulletRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-sky-700)]" />
      <span>{children}</span>
    </li>
  );
}

function AgencyMockup() {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[color:var(--color-warm-hairline)] px-5 py-3.5">
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
          BrightPath dashboard
        </p>
        <p className="text-[0.74rem] text-[color:var(--color-warm-muted)]">Last 7 days</p>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5">
        <KpiCell label="Active clients" value="24" trend="+3" trendPositive />
        <KpiCell label="Updates posted" value="142" trend="+18" trendPositive />
        <KpiCell label="Families engaged" value="86%" trend="+4%" trendPositive />
        <KpiCell label="Quiet clients" value="2" trend="needs follow-up" />
      </div>
      <div className="hairline" />
      <div className="space-y-3 p-5">
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
          Recent family signals
        </p>
        <SignalRow client="Eleanor W." note="Sarah sent thanks · 11:50 AM" />
        <SignalRow client="Robert J." note="Lisa asked about medication timing · 9:12 AM" needsAttention />
        <SignalRow client="Margaret C." note="Kevin reacted to the morning photo · 8:48 AM" />
      </div>
    </div>
  );
}

function KpiCell({
  label,
  value,
  trend,
  trendPositive,
}: {
  label: string;
  value: string;
  trend: string;
  trendPositive?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-50)] p-4">
      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">{label}</p>
      <p className="mt-1 font-display text-2xl text-[color:var(--color-navy-900)]">{value}</p>
      <p
        className={`mt-1 text-[0.74rem] ${
          trendPositive
            ? "text-[color:var(--color-positive)]"
            : "text-[color:var(--color-mood-anxious)]"
        }`}
      >
        {trend}
      </p>
    </div>
  );
}

function SignalRow({
  client,
  note,
  needsAttention,
}: {
  client: string;
  note: string;
  needsAttention?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-[0.88rem]">
      <span className="font-medium text-[color:var(--color-navy-900)]">{client}</span>
      <span
        className={`${
          needsAttention
            ? "text-[color:var(--color-mood-anxious)]"
            : "text-[color:var(--color-warm-muted)]"
        }`}
      >
        {note}
      </span>
    </div>
  );
}

function FamilyMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-5 -z-10 rounded-[34px] bg-gradient-to-tl from-[#FAF7F2] via-[#FDF2E2] to-[#E3EFFB] blur-2xl opacity-90"
      />
      <div className="card overflow-hidden">
        <div className="border-b border-[color:var(--color-warm-hairline)] px-5 py-4">
          <p className="text-[0.74rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            Mom&apos;s week
          </p>
          <p className="mt-1 font-display text-xl text-[color:var(--color-navy-900)]">Eleanor Williams</p>
        </div>
        <div className="grid grid-cols-7 gap-2 px-5 py-4">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[0.7rem] text-[color:var(--color-warm-muted)]">{d}</span>
              <span
                className="h-7 w-7 rounded-full"
                style={{
                  background: ["#5FA978", "#7DB7E8", "#5FA978", "#C9A146", "#7DB7E8", "#5FA978", "#5FA978"][i],
                  opacity: 0.85,
                }}
                title="Mood"
              />
            </div>
          ))}
        </div>
        <div className="hairline" />
        <div className="space-y-3 p-5 text-[0.88rem] text-[color:var(--color-warm-ink)]">
          <p className="font-medium text-[color:var(--color-navy-900)]">
            &quot;Mom ate well today and laughed when I played the old records.&quot;
          </p>
          <p className="text-[color:var(--color-warm-muted)]">— Maria, end-of-shift note</p>
        </div>
      </div>
    </div>
  );
}

function ComplianceCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-2 text-[color:var(--color-sky-300)]">{icon}</div>
      <p className="font-display text-[1rem] font-semibold text-[color:var(--color-cream-50)]">{title}</p>
      <p className="mt-1 text-[0.88rem] text-[color:var(--color-cream-300)]">{body}</p>
    </div>
  );
}
