// /cna/visits — CNA-scoped list of today's, upcoming, and completed visits.
// Replaces the prior ComingSoonCard placeholder. Each row links to /cna/visits/[id]
// where the detailed visit log already lives (shipped 2026-06-02).
//
// Daily improvement cycle 2026-06-03 — bridges the placeholder list to the detail page.

import Link from "next/link";
import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getDemoRole, getDemoUser } from "@/lib/demo-seed";
import { getSessionUser } from "@/lib/session";

const STATUS_LABEL: Record<string, string> = {
  NotStarted: "Not started",
  InProgress: "In progress",
  Completed: "Completed",
  Missed: "Missed",
  Cancelled: "Cancelled",
};

const STATUS_DOT: Record<string, string> = {
  NotStarted: "var(--color-warm-muted, #98897a)",
  InProgress: "var(--color-mood-calm, #7DB7E8)",
  Completed: "var(--color-mood-happy, #5FA978)",
  Missed: "var(--color-mood-unwell, #B85450)",
  Cancelled: "var(--color-warm-muted, #98897a)",
};

function formatDayLabel(d: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round((startOfDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";
  if (dayDiff === -1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatWindow(start: Date, end: Date): string {
  const fmt: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${start.toLocaleTimeString("en-US", fmt)} – ${end.toLocaleTimeString("en-US", fmt)}`;
}

type VisitRow = {
  id: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  status: string;
  clientFullName: string;
  clientAddress: string | null;
};

async function loadVisitsForUserId(userId: string): Promise<VisitRow[]> {
  const cna = await prisma.cNAProfile.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (!cna) return [];

  const rows = await prisma.visit.findMany({
    where: { cnaId: cna.id },
    orderBy: { scheduledStart: "asc" },
    select: {
      id: true,
      scheduledStart: true,
      scheduledEnd: true,
      status: true,
      client: { select: { fullName: true, address: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    scheduledStart: r.scheduledStart,
    scheduledEnd: r.scheduledEnd,
    status: r.status,
    clientFullName: r.client.fullName,
    clientAddress: r.client.address,
  }));
}

function bucket(visits: VisitRow[]): { today: VisitRow[]; upcoming: VisitRow[]; completed: VisitRow[] } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfToday.getDate() + 1);

  const today: VisitRow[] = [];
  const upcoming: VisitRow[] = [];
  const completed: VisitRow[] = [];

  for (const v of visits) {
    if (v.status === "Completed" || v.status === "Missed" || v.status === "Cancelled") {
      completed.push(v);
    } else if (v.scheduledStart >= startOfToday && v.scheduledStart < startOfTomorrow) {
      today.push(v);
    } else if (v.scheduledStart >= startOfTomorrow) {
      upcoming.push(v);
    } else {
      // Past, still NotStarted/InProgress — keep in today bucket so the CNA can finish logging it.
      today.push(v);
    }
  }
  // Completed shown newest-first
  completed.reverse();
  return { today, upcoming, completed };
}

function VisitCard({ visit }: { visit: VisitRow }) {
  const dot = STATUS_DOT[visit.status] ?? STATUS_DOT.NotStarted;
  return (
    <Link
      href={`/cna/visits/${visit.id}`}
      className="card block p-5 transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            {formatWindow(visit.scheduledStart, visit.scheduledEnd)}
          </p>
          <p className="mt-1 font-display text-[1.2rem] font-semibold text-[color:var(--color-navy-900)]">
            {visit.clientFullName}
          </p>
          {visit.clientAddress && (
            <p className="mt-1 text-[0.9rem] text-[color:var(--color-warm-ink)]">{visit.clientAddress}</p>
          )}
        </div>
        <div className="shrink-0 inline-flex items-center gap-1.5 text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-ink)]">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: dot }} aria-hidden />
          {STATUS_LABEL[visit.status] ?? visit.status}
        </div>
      </div>
    </Link>
  );
}

function Section({ title, label, visits }: { title: string; label: string; visits: VisitRow[] }) {
  if (visits.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[1.4rem] text-[color:var(--color-navy-900)]">{title}</h2>
        <span className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">{label}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {visits.map((v) => (
          <VisitCard key={v.id} visit={v} />
        ))}
      </div>
    </section>
  );
}

export default async function CnaVisits() {
  const demoRole = await getDemoRole();
  const isDemo = demoRole === "cna";

  const userId = isDemo ? getDemoUser("cna").id : (await getSessionUser())?.id ?? null;
  const visits = userId ? await loadVisitsForUserId(userId) : [];
  const groups = bucket(visits);

  const totalScheduled = groups.today.length + groups.upcoming.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.4rem]">
          Visits
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          {visits.length === 0
            ? "No visits assigned yet. Your agency owner schedules visits in the agency portal."
            : `${totalScheduled} scheduled, ${groups.completed.length} completed. Tap a visit to log mood, meal, activity, and end-of-shift.`}
        </p>
      </div>

      <Section title="Today" label={formatDayLabel(new Date())} visits={groups.today} />
      <Section title="Upcoming" label={`${groups.upcoming.length} visit${groups.upcoming.length === 1 ? "" : "s"}`} visits={groups.upcoming} />
      <Section title="Completed" label={`${groups.completed.length} this period`} visits={groups.completed} />

      {visits.length === 0 && (
        <ComingSoonCard
          phase="Phase 2"
          title="One-tap start-visit flow"
          body="Live list of today's clients with one-tap 'Start visit'. Each visit row links to the dedicated logging screen at /cna/visits/[id]."
        />
      )}
    </div>
  );
}
