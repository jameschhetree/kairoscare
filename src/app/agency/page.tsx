import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function AgencyHome() {
  const user = await getSessionUser();
  const agencyId = user?.agencyId;

  const [clients, cnas, careUpdates, families, agency] = await Promise.all([
    prisma.client.count({ where: { agencyId: agencyId ?? "" } }),
    prisma.cNAProfile.count({ where: { agencyId: agencyId ?? "" } }),
    prisma.careUpdate.count({
      where: {
        agencyId: agencyId ?? "",
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.clientFamilyMembership.count({
      where: { client: { agencyId: agencyId ?? "" } },
    }),
    prisma.organization.findUnique({ where: { id: agencyId ?? "" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
          {agency?.name ?? "Your agency"}
        </p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
          Dashboard
        </h1>
        <p className="mt-2 max-w-[560px] text-[color:var(--color-warm-ink)]">
          Live counts from your seed data. Full engagement KPIs (sentiment trend,
          quiet-client alerts, family signals) land in Phase 4.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Active clients" value={clients} />
        <Kpi label="Active CNAs" value={cnas} />
        <Kpi label="Updates this week" value={careUpdates} />
        <Kpi label="Family seats" value={families} />
      </div>

      <ComingSoonCard
        phase="Phase 4"
        title="Engagement intelligence"
        body="Family sentiment trend, clients-with-no-updates-today alert, open family comments, and CNA recognition stream. The agency dashboard is the buyer-facing ROI screen — it earns priority over feature density."
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
