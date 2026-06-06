import Link from "next/link";
import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, demoClients } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// Daily improvement 2026-06-06 — agency client roster previously showed only
// name, state, caregiver count, family seat count. Now each row also surfaces
// the per-client signal an agency owner actually scans for: visits this week,
// last-visit relative date, latest mood, and a small red flag when a client has
// gone 7+ days without a visit.

const MOOD_DOT_COLOR: Record<string, string> = {
  Happy: "var(--color-mood-happy, #5FA978)",
  Calm: "var(--color-mood-calm, #7DB7E8)",
  Tired: "var(--color-mood-tired, #C9A146)",
  Anxious: "var(--color-mood-anxious, #E0846B)",
  Unwell: "var(--color-mood-unwell, #B85450)",
};

function formatRelativeDate(d: Date | null): string {
  if (!d) return "No visits yet";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AgencyClients() {
  const isDemo = !!(await getDemoRole());

  if (isDemo) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Clients</h1>
          <p className="mt-1 text-[color:var(--color-warm-ink)]">Active clients and the caregivers + families linked to each.</p>
        </div>
        <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
          {demoClients.map((c) => (
            <Link key={c.id} href={`/agency/clients/${c.id}`} className="flex flex-col gap-1 px-5 py-4 hover:bg-[color:var(--color-cream-100)]">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)]">{c.fullName}</p>
                <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">{c.state}</p>
              </div>
              <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">
                {c.cnaCount} caregiver{c.cnaCount === 1 ? "" : "s"} · {c.familyCount} family seat{c.familyCount === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
        <ComingSoonCard phase="Phase 4" title="Client management UI" body="Create + edit client profiles, assign caregivers, invite family members, set agency-internal notes." />
      </div>
    );
  }

  const user = await getSessionUser();
  const agencyId = user?.agencyId ?? "";
  const clients = await prisma.client.findMany({
    where: { agencyId },
    orderBy: { fullName: "asc" },
    include: {
      familyMemberships: { include: { familyMember: true } },
      cnaAssignments: { include: { cna: { include: { user: true } } } },
    },
  });

  // Per-client weekly signal — two scoped queries, no N+1.
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const clientIds = clients.map((c) => c.id);
  const [recentVisits, recentMoods] = await Promise.all([
    clientIds.length > 0
      ? prisma.visit.findMany({
          where: { clientId: { in: clientIds }, scheduledStart: { gte: weekAgo } },
          select: { clientId: true, scheduledStart: true },
        })
      : Promise.resolve([] as { clientId: string; scheduledStart: Date }[]),
    clientIds.length > 0
      ? prisma.careUpdate.findMany({
          where: { clientId: { in: clientIds }, mood: { not: null } },
          select: { clientId: true, mood: true, timestamp: true },
          orderBy: { timestamp: "desc" },
          take: 200,
        })
      : Promise.resolve([] as { clientId: string; mood: string | null; timestamp: Date }[]),
  ]);

  const signal = new Map<
    string,
    { visitCount: number; lastVisit: Date | null; latestMood: string | null }
  >();
  for (const c of clients) {
    signal.set(c.id, { visitCount: 0, lastVisit: null, latestMood: null });
  }
  for (const v of recentVisits) {
    const s = signal.get(v.clientId);
    if (!s) continue;
    s.visitCount++;
    if (!s.lastVisit || v.scheduledStart > s.lastVisit) {
      s.lastVisit = v.scheduledStart;
    }
  }
  for (const u of recentMoods) {
    const s = signal.get(u.clientId);
    if (!s || s.latestMood) continue;
    if (u.mood) s.latestMood = u.mood;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Clients</h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">Active clients and the caregivers + families linked to each.</p>
      </div>
      <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
        {clients.map((c) => {
          const s = signal.get(c.id) ?? { visitCount: 0, lastVisit: null, latestMood: null };
          const staleVisit = s.visitCount === 0;
          return (
            <Link
              key={c.id}
              href={`/agency/clients/${c.id}`}
              className="flex flex-col gap-2 px-5 py-4 hover:bg-[color:var(--color-cream-100)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  {staleVisit && (
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-mood-unwell,#B85450)]"
                      title="No visit in the past 7 days"
                      aria-label="No visit in 7 days"
                    />
                  )}
                  <p className="font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)]">{c.fullName}</p>
                </div>
                <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">{c.state ?? "-"}</p>
              </div>
              <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">
                {c.cnaAssignments.length} caregiver{c.cnaAssignments.length === 1 ? "" : "s"} · {c.familyMemberships.length} family seat{c.familyMemberships.length === 1 ? "" : "s"}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-[color:var(--color-warm-muted)]">
                <span>
                  {s.visitCount} visit{s.visitCount === 1 ? "" : "s"} this week
                </span>
                <span>Last visit: {formatRelativeDate(s.lastVisit)}</span>
                {s.latestMood && (
                  <span className="inline-flex items-center gap-1.5 text-[color:var(--color-warm-ink)]">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: MOOD_DOT_COLOR[s.latestMood] ?? "var(--color-warm-muted, #98897a)" }}
                      aria-hidden
                    />
                    {s.latestMood}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      <ComingSoonCard phase="Phase 4" title="Client management UI" body="Create + edit client profiles, assign caregivers, invite family members, set agency-internal notes." />
    </div>
  );
}
