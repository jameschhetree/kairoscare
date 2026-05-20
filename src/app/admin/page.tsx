import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [agencies, users, careUpdates, audits] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.careUpdate.count(),
    prisma.auditLog.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
          Internal backoffice
        </p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
          KairosCare admin
        </h1>
        <p className="mt-2 max-w-[560px] text-[color:var(--color-warm-ink)]">
          Live system-wide counts. Full agency management, support tools, and PHI
          access logs follow in Phase 5.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Agencies" value={agencies} />
        <Kpi label="Users" value={users} />
        <Kpi label="Care updates" value={careUpdates} />
        <Kpi label="Audit rows" value={audits} />
      </div>

      <ComingSoonCard
        phase="Phase 5"
        title="Internal admin backend"
        body="Search users, suspend agencies, review PHI access logs, export data, manage subscription plans. Functional first, opinionated never — internal tools earn the right to be plain."
      />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-5">
      <p className="text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">{label}</p>
      <p className="mt-1 font-display text-2xl text-[color:var(--color-navy-900)]">{value}</p>
    </div>
  );
}
