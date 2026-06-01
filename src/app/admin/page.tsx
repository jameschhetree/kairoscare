import { getDemoRole, adminCrossInsights, demoCounts } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import {
  Building2, Users, FileText, Shield, Sparkles, TrendingUp, AlertTriangle, Heart,
} from "lucide-react";

export default async function AdminHome() {
  const isDemo = !!(await getDemoRole());

  let agencies: number, users: number, careUpdates: number, audits: number, visits: number, reactions: number;

  if (isDemo) {
    agencies = demoCounts.agencies;
    users = demoCounts.users;
    careUpdates = demoCounts.careUpdates;
    audits = demoCounts.auditRows;
    visits = demoCounts.visits;
    reactions = demoCounts.reactions;
  } else {
    [agencies, users, careUpdates, audits, visits, reactions] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.careUpdate.count(),
      prisma.auditLog.count(),
      prisma.visit.count(),
      prisma.reaction.count(),
    ]);
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">Internal backoffice</p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">KairosCare Admin</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Agencies" value={agencies} icon={<Building2 size={16} />} />
        <Kpi label="Total users" value={users} icon={<Users size={16} />} />
        <Kpi label="Care updates" value={careUpdates} icon={<FileText size={16} />} />
        <Kpi label="Audit events" value={audits} icon={<Shield size={16} />} />
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-sky-300)]/30 bg-gradient-to-br from-[color:var(--color-sky-100)]/30 to-[color:var(--color-cream-50)] p-1">
        <div className="flex items-center gap-2 px-5 pt-5 pb-2">
          <Sparkles size={16} className="text-[color:var(--color-sky-700)]" />
          <h2 className="font-display text-[1.2rem] font-semibold text-[color:var(--color-navy-900)]">Cross-Agency AI Insights</h2>
          <span className="ml-auto rounded-full bg-[color:var(--color-sky-100)] px-2 py-0.5 text-[0.7rem] font-medium text-[color:var(--color-sky-700)]">Platform-wide</span>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-[color:var(--color-positive)]" />
              <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">Agency health</h3>
            </div>
            <div className="space-y-3">
              <InsightRow status="positive" text={`${adminCrossInsights.agenciesTrendingPositive} agency trending positive this week`} />
              <InsightRow status={adminCrossInsights.agenciesBelowThreshold > 0 ? "warning" : "positive"} text={adminCrossInsights.agenciesBelowThreshold > 0 ? `${adminCrossInsights.agenciesBelowThreshold} agency below engagement threshold` : "All agencies above engagement threshold"} />
              <InsightRow status="neutral" text={`${adminCrossInsights.weeklyVisitCount} visits logged this week across platform`} />
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Heart size={14} className="text-[color:var(--color-mood-anxious)]" />
              <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">Family churn risk</h3>
            </div>
            <div className="space-y-3">
              <InsightRow status="warning" text={`${adminCrossInsights.familyChurnRisk} households not reacting`} />
              <p className="text-[0.82rem] text-[color:var(--color-warm-ink)]">Sentiment AI flagged: {adminCrossInsights.churnRiskDetail}</p>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-[color:var(--color-sky-700)]" />
              <h3 className="text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">Platform vitals</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Engagement rate" value={adminCrossInsights.familyEngagementRate} />
              <MiniStat label="Avg sentiment" value={adminCrossInsights.averageSentiment} />
              <MiniStat label="Total CNAs" value={String(adminCrossInsights.totalCNAs)} />
              <MiniStat label="Churn risk" value={`${adminCrossInsights.churnRiskCount} clients`} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label="Total visits" value={visits} icon={<FileText size={16} />} />
        <Kpi label="Family reactions" value={reactions} icon={<Heart size={16} />} />
        <Kpi label="Active CNAs" value={adminCrossInsights.totalCNAs} icon={<Users size={16} />} />
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

function InsightRow({ status, text }: { status: "positive" | "warning" | "neutral"; text: string }) {
  const colors = { positive: "var(--color-positive)", warning: "var(--color-mood-anxious)", neutral: "var(--color-sky-700)" };
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: colors[status] }} />
      <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">{text}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-[color:var(--color-cream-50)] p-2.5">
      <p className="text-[0.68rem] uppercase tracking-[0.12em] text-[color:var(--color-warm-muted)]">{label}</p>
      <p className="mt-0.5 text-[0.86rem] font-medium text-[color:var(--color-navy-900)]">{value}</p>
    </div>
  );
}
