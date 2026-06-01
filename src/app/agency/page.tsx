import {
  getDemoRole,
  demoCounts,
  demoAgency,
  atRiskClients,
  sentimentTrend,
  coachingInsights,
  recentFamilySignals,
} from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import {
  AlertTriangle,
  TrendingUp,
  Users,
  Sparkles,
  MessageSquareText,
  Heart,
} from "lucide-react";

export default async function AgencyHome() {
  const isDemo = !!(await getDemoRole());

  let clientCount: number;
  let cnaCount: number;
  let careUpdateCount: number;
  let familyCount: number;
  let agencyName: string;
  let reactionCount: number;
  let commentCount: number;

  if (isDemo) {
    clientCount = demoCounts.clients;
    cnaCount = demoCounts.cnas;
    careUpdateCount = demoCounts.careUpdates;
    familyCount = demoCounts.familySeats;
    agencyName = demoAgency.name;
    reactionCount = demoCounts.reactions;
    commentCount = demoCounts.comments;
  } else {
    const user = await getSessionUser();
    const agencyId = user?.agencyId ?? "";
    const [cc, cn, cu, fc, agency, rc, cmc] = await Promise.all([
      prisma.client.count({ where: { agencyId } }),
      prisma.cNAProfile.count({ where: { agencyId } }),
      prisma.careUpdate.count({
        where: { agencyId, timestamp: { gte: new Date(Date.now() - 7 * 86400000) } },
      }),
      prisma.clientFamilyMembership.count({ where: { client: { agencyId } } }),
      prisma.organization.findUnique({ where: { id: agencyId } }),
      prisma.reaction.count({ where: { careUpdate: { agencyId } } }),
      prisma.comment.count({ where: { careUpdate: { agencyId } } }),
    ]);
    clientCount = cc;
    cnaCount = cn;
    careUpdateCount = cu;
    familyCount = fc;
    agencyName = agency?.name ?? "Your agency";
    reactionCount = rc;
    commentCount = cmc;
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
          {agencyName}
        </p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
          Dashboard
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Active clients" value={clientCount} icon={<Users size={16} />} />
        <Kpi label="Active CNAs" value={cnaCount} icon={<Users size={16} />} />
        <Kpi label="Updates this week" value={careUpdateCount} icon={<MessageSquareText size={16} />} />
        <Kpi label="Family reactions" value={reactionCount} icon={<Heart size={16} />} />
      </div>

      {/* AI INSIGHTS PANEL */}
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-sky-300)]/30 bg-gradient-to-br from-[color:var(--color-sky-100)]/30 to-[color:var(--color-cream-50)] p-1">
        <div className="flex items-center gap-2 px-5 pt-5 pb-2">
          <Sparkles size={16} className="text-[color:var(--color-sky-700)]" />
          <h2 className="font-display text-[1.2rem] font-semibold text-[color:var(--color-navy-900)]">
            AI Insights
          </h2>
          <span className="ml-auto rounded-full bg-[color:var(--color-sky-100)] px-2 py-0.5 text-[0.7rem] font-medium text-[color:var(--color-sky-700)]">
            Updated today
          </span>
        </div>

        <div className="grid gap-6 p-5 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-[color:var(--color-mood-anxious)]" />
              <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">
                At-risk clients
              </h3>
            </div>
            <div className="space-y-4">
              {atRiskClients.map((client) => (
                <div key={client.clientName} className="border-l-2 pl-3" style={{
                  borderColor: client.severity === "high"
                    ? "var(--color-mood-unwell)"
                    : client.severity === "medium"
                    ? "var(--color-mood-anxious)"
                    : "var(--color-mood-tired)"
                }}>
                  <p className="text-[0.9rem] font-medium text-[color:var(--color-navy-900)]">{client.clientName}</p>
                  <p className="mt-0.5 text-[0.82rem] text-[color:var(--color-warm-ink)]">Sentiment AI flagged: {client.reason}</p>
                  <p className="mt-0.5 text-[0.74rem] text-[color:var(--color-warm-muted)]">{client.daysSinceFlag}d ago</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-[color:var(--color-positive)]" />
              <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">
                Sentiment trends
              </h3>
            </div>
            <p className="mb-3 text-[0.82rem] text-[color:var(--color-warm-ink)]">Visit mood distribution, last 14 days</p>
            <div className="flex items-end gap-1" style={{ height: 100 }}>
              {sentimentTrend.map((day) => {
                const total = day.happy + day.calm + day.tired + day.anxious;
                const max = 7;
                return (
                  <div key={day.label} className="flex flex-1 flex-col items-center gap-0.5">
                    <div className="flex w-full flex-col gap-px" style={{ height: `${(total / max) * 100}%` }}>
                      {day.happy > 0 && <div className="rounded-t-[2px]" style={{ flex: day.happy, background: "var(--color-mood-happy)" }} />}
                      {day.calm > 0 && <div style={{ flex: day.calm, background: "var(--color-mood-calm)" }} />}
                      {day.tired > 0 && <div style={{ flex: day.tired, background: "var(--color-mood-tired)" }} />}
                      {day.anxious > 0 && <div className="rounded-b-[2px]" style={{ flex: day.anxious, background: "var(--color-mood-anxious)" }} />}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[0.64rem] text-[color:var(--color-warm-muted)]">
              <span>14 days ago</span>
              <span>Today</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-[0.72rem]">
              <Legend color="var(--color-mood-happy)" label="Happy" />
              <Legend color="var(--color-mood-calm)" label="Calm" />
              <Legend color="var(--color-mood-tired)" label="Tired" />
              <Legend color="var(--color-mood-anxious)" label="Anxious" />
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users size={14} className="text-[color:var(--color-sky-700)]" />
              <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">CNA coaching</h3>
            </div>
            <div className="space-y-4">
              {coachingInsights.map((insight) => (
                <div key={insight.cnaName} className="rounded-[var(--radius-sm)] bg-[color:var(--color-cream-50)] p-3">
                  <p className="text-[0.9rem] font-medium text-[color:var(--color-navy-900)]">{insight.cnaName}</p>
                  <p className="mt-0.5 text-[0.82rem] text-[color:var(--color-warm-ink)]">Coaching model suggests: {insight.suggestion}</p>
                  <p className="mt-1 text-[0.72rem] font-mono text-[color:var(--color-warm-muted)]">{insight.metric}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">Family seats</p>
          <p className="mt-1 font-display text-2xl text-[color:var(--color-navy-900)]">{familyCount}</p>
          <p className="mt-1 text-[0.78rem] text-[color:var(--color-positive)]">Across {clientCount} clients</p>
        </div>
        <div className="card p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">Open family comments</p>
          <p className="mt-1 font-display text-2xl text-[color:var(--color-navy-900)]">{commentCount}</p>
          <p className="mt-1 text-[0.78rem] text-[color:var(--color-mood-anxious)]">2 need follow-up</p>
        </div>
        <div className="card p-5">
          <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">Avg sentiment</p>
          <p className="mt-1 font-display text-2xl text-[color:var(--color-navy-900)]">4.2</p>
          <p className="mt-1 text-[0.78rem] text-[color:var(--color-positive)]">68% happy or calm visits</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--color-warm-hairline)] px-5 py-3.5">
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Recent family signals</p>
          <p className="text-[0.74rem] text-[color:var(--color-warm-muted)]">Last 48 hours</p>
        </div>
        <div className="divide-y divide-[color:var(--color-warm-hairline)]">
          {recentFamilySignals.map((signal, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full" style={{ background: signal.needsAttention ? "var(--color-mood-anxious)" : "var(--color-positive)" }} />
                <div>
                  <p className="text-[0.9rem] font-medium text-[color:var(--color-navy-900)]">{signal.clientName}</p>
                  <p className="text-[0.82rem] text-[color:var(--color-warm-ink)]">{signal.familyName}: {signal.action}</p>
                </div>
              </div>
              <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">{signal.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">{label}</p>
        <span className="text-[color:var(--color-warm-muted)]">{icon}</span>
      </div>
      <p className="mt-2 font-display text-[2rem] text-[color:var(--color-navy-900)]">{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[color:var(--color-warm-muted)]">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
