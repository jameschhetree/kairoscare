import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, demoCNAs } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// Daily improvement 2026-06-05 — agency CNA cards previously showed only name,
// email, language, and total assignments. Now they also show "visits this week",
// last-visit-date, and a small dot summary of recent moods so the agency owner
// can scan their roster for who's active / who has flagged updates.

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

export default async function AgencyCnas() {
  const isDemo = !!(await getDemoRole());

  if (isDemo) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Caregivers</h1>
          <p className="mt-1 text-[color:var(--color-warm-ink)]">The CNAs on your team and the clients they support.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {demoCNAs.map((cna) => (
            <div key={cna.id} className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)]">{cna.fullName}</p>
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">{cna.clientCount} client{cna.clientCount === 1 ? "" : "s"}</span>
              </div>
              <p className="text-[0.84rem] text-[color:var(--color-warm-muted)]">{cna.email}</p>
              <p className="mt-3 text-[0.86rem] text-[color:var(--color-warm-ink)]">{cna.languages}</p>
            </div>
          ))}
        </div>
        <ComingSoonCard phase="Phase 4" title="Caregiver management" body="Add and deactivate caregivers, see submitted updates, set agency-default languages, manage certifications." />
      </div>
    );
  }

  const user = await getSessionUser();
  const agencyId = user?.agencyId ?? "";
  const cnas = await prisma.cNAProfile.findMany({
    where: { agencyId },
    include: { user: true, clientAssignments: true },
    orderBy: { createdAt: "asc" },
  });

  // Pull last-7-day activity for all CNAs in this agency in two queries instead of N+1.
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const cnaIds = cnas.map((c) => c.id);
  const [recentVisits, recentUpdates] = await Promise.all([
    cnaIds.length > 0
      ? prisma.visit.findMany({
          where: { cnaId: { in: cnaIds }, scheduledStart: { gte: weekAgo } },
          select: { cnaId: true, scheduledStart: true, actualEnd: true, status: true },
        })
      : Promise.resolve([] as { cnaId: string; scheduledStart: Date; actualEnd: Date | null; status: string }[]),
    cnaIds.length > 0
      ? prisma.careUpdate.findMany({
          where: { cnaId: { in: cnaIds }, timestamp: { gte: weekAgo }, mood: { not: null } },
          select: { cnaId: true, mood: true, timestamp: true },
        })
      : Promise.resolve([] as { cnaId: string; mood: string | null; timestamp: Date }[]),
  ]);

  // Build per-CNA aggregates.
  const byCna = new Map<
    string,
    { visitCount: number; lastVisit: Date | null; moodCounts: Record<string, number> }
  >();
  for (const c of cnas) {
    byCna.set(c.id, { visitCount: 0, lastVisit: null, moodCounts: {} });
  }
  for (const v of recentVisits) {
    const a = byCna.get(v.cnaId);
    if (!a) continue;
    a.visitCount++;
    if (!a.lastVisit || v.scheduledStart > a.lastVisit) {
      a.lastVisit = v.scheduledStart;
    }
  }
  for (const u of recentUpdates) {
    const a = byCna.get(u.cnaId);
    if (!a || !u.mood) continue;
    a.moodCounts[u.mood] = (a.moodCounts[u.mood] ?? 0) + 1;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Caregivers</h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">The CNAs on your team and the clients they support.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cnas.map((cna) => {
          const a = byCna.get(cna.id) ?? { visitCount: 0, lastVisit: null, moodCounts: {} };
          const moods = Object.entries(a.moodCounts).sort((x, y) => y[1] - x[1]);
          return (
            <div key={cna.id} className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)]">{cna.user.fullName}</p>
                <span className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">
                  {cna.clientAssignments.length} client{cna.clientAssignments.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-[0.84rem] text-[color:var(--color-warm-muted)]">{cna.user.email}</p>
              <p className="mt-3 text-[0.86rem] text-[color:var(--color-warm-ink)]">{cna.languagesSpoken.join(", ")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[color:var(--color-sky-200,#e3eaf2)] pt-3">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">Visits this week</p>
                  <p className="mt-0.5 text-[0.95rem] text-[color:var(--color-navy-900)]">{a.visitCount}</p>
                </div>
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">Last visit</p>
                  <p className="mt-0.5 text-[0.95rem] text-[color:var(--color-navy-900)]">{formatRelativeDate(a.lastVisit)}</p>
                </div>
              </div>
              {moods.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">Recent moods:</p>
                  {moods.map(([mood, count]) => (
                    <span
                      key={mood}
                      className="inline-flex items-center gap-1 text-[0.75rem] text-[color:var(--color-warm-ink)]"
                      title={`${count} ${mood} update${count === 1 ? "" : "s"} in last 7 days`}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: MOOD_DOT_COLOR[mood] ?? "var(--color-warm-muted, #98897a)" }}
                        aria-hidden
                      />
                      {mood} <span className="text-[color:var(--color-warm-muted)]">×{count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ComingSoonCard phase="Phase 4" title="Caregiver management" body="Add and deactivate caregivers, see submitted updates, set agency-default languages, manage certifications." />
    </div>
  );
}
