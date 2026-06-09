import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, demoAdminAgencies } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";

// Daily improvement 2026-06-09 — admin cross-agency list previously showed only
// name / email / phone / client count / user count / tier. Now each agency
// row also surfaces a weekly health snapshot:
//   - Visits this week (Visit count last 7 days)
//   - Stale clients (clients with zero visits in last 7 days)
//   - Latest activity (timestamp of most recent CareUpdate)
//   - Red dot on the agency name when no visits at all in the last 7 days
//     (signals a fully idle agency that admin should follow up on).

function formatRelativeDate(d: Date | null): string {
  if (!d) return "No updates yet";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AdminAgencies() {
  const isDemo = !!(await getDemoRole());

  if (isDemo) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Agencies</h1>
          <p className="mt-1 text-[color:var(--color-warm-ink)]">Every agency on KairosCare and their pilot status.</p>
        </div>
        <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
          {demoAdminAgencies.map((a) => (
            <div key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
              <div>
                <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">{a.name}</p>
                <p className="text-[0.84rem] text-[color:var(--color-warm-muted)]">{a.email} · {a.phone}</p>
              </div>
              <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">{a.clientCount} clients · {a.userCount} users · {a.tier}</p>
            </div>
          ))}
        </div>
        <ComingSoonCard phase="Phase 5" title="Agency management" body="Create, edit, suspend; view plan + usage; force-rotate API keys; audit drilldown per agency." />
      </div>
    );
  }

  const agencies = await prisma.organization.findMany({
    include: { subscriptionPlans: true, _count: { select: { clients: true, users: true } } },
    orderBy: { createdAt: "desc" },
  });

  // Per-agency weekly snapshot — single set of scoped queries, no N+1.
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const agencyIds = agencies.map((a) => a.id);

  const [recentVisits, latestUpdates, clientsPerAgency] = await Promise.all([
    agencyIds.length > 0
      ? prisma.visit.findMany({
          where: { agencyId: { in: agencyIds }, scheduledStart: { gte: weekAgo } },
          select: { agencyId: true, clientId: true },
        })
      : Promise.resolve([] as { agencyId: string; clientId: string }[]),
    agencyIds.length > 0
      ? prisma.careUpdate.findMany({
          where: { agencyId: { in: agencyIds } },
          select: { agencyId: true, timestamp: true },
          orderBy: { timestamp: "desc" },
          take: 500,
        })
      : Promise.resolve([] as { agencyId: string; timestamp: Date }[]),
    agencyIds.length > 0
      ? prisma.client.findMany({
          where: { agencyId: { in: agencyIds } },
          select: { id: true, agencyId: true },
        })
      : Promise.resolve([] as { id: string; agencyId: string }[]),
  ]);

  const snapshot = new Map<
    string,
    { visitsThisWeek: number; clientsTouchedThisWeek: Set<string>; latestActivity: Date | null }
  >();
  for (const a of agencies) {
    snapshot.set(a.id, { visitsThisWeek: 0, clientsTouchedThisWeek: new Set(), latestActivity: null });
  }
  for (const v of recentVisits) {
    const s = snapshot.get(v.agencyId);
    if (!s) continue;
    s.visitsThisWeek++;
    s.clientsTouchedThisWeek.add(v.clientId);
  }
  for (const u of latestUpdates) {
    const s = snapshot.get(u.agencyId);
    if (!s || s.latestActivity) continue;
    s.latestActivity = u.timestamp;
  }

  const clientsByAgency = new Map<string, string[]>();
  for (const c of clientsPerAgency) {
    if (!clientsByAgency.has(c.agencyId)) clientsByAgency.set(c.agencyId, []);
    clientsByAgency.get(c.agencyId)!.push(c.id);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Agencies</h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">Every agency on KairosCare and their pilot status.</p>
      </div>
      <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
        {agencies.map((a) => {
          const s = snapshot.get(a.id) ?? { visitsThisWeek: 0, clientsTouchedThisWeek: new Set<string>(), latestActivity: null };
          const allClientIds = clientsByAgency.get(a.id) ?? [];
          const staleClients = allClientIds.filter((id) => !s.clientsTouchedThisWeek.has(id)).length;
          const fullyIdle = s.visitsThisWeek === 0 && allClientIds.length > 0;
          return (
            <div key={a.id} className="flex flex-col gap-2 px-5 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  {fullyIdle && (
                    <span
                      className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-mood-unwell,#B85450)]"
                      title="No visits in the past 7 days"
                      aria-label="Idle agency"
                    />
                  )}
                  <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">{a.name}</p>
                </div>
                <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">
                  {a._count.clients} client{a._count.clients === 1 ? "" : "s"} · {a._count.users} user{a._count.users === 1 ? "" : "s"} · {a.subscriptionPlans[0]?.tier ?? "Pilot"}
                </p>
              </div>
              <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">{a.email ?? "-"} · {a.phone ?? "-"}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.78rem] text-[color:var(--color-warm-muted)]">
                <span>
                  {s.visitsThisWeek} visit{s.visitsThisWeek === 1 ? "" : "s"} this week
                </span>
                {staleClients > 0 && (
                  <span className="text-[color:var(--color-mood-anxious,#E0846B)]">
                    {staleClients} stale client{staleClients === 1 ? "" : "s"}
                  </span>
                )}
                <span>Last activity: {formatRelativeDate(s.latestActivity)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <ComingSoonCard phase="Phase 5" title="Agency management" body="Create, edit, suspend; view plan + usage; force-rotate API keys; audit drilldown per agency." />
    </div>
  );
}
