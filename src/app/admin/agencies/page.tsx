import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, demoAdminAgencies } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Agencies</h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">Every agency on KairosCare and their pilot status.</p>
      </div>
      <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
        {agencies.map((a) => (
          <div key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
            <div>
              <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">{a.name}</p>
              <p className="text-[0.84rem] text-[color:var(--color-warm-muted)]">{a.email ?? "-"} · {a.phone ?? "-"}</p>
            </div>
            <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">{a._count.clients} clients · {a._count.users} users · {a.subscriptionPlans[0]?.tier ?? "Pilot"}</p>
          </div>
        ))}
      </div>
      <ComingSoonCard phase="Phase 5" title="Agency management" body="Create, edit, suspend; view plan + usage; force-rotate API keys; audit drilldown per agency." />
    </div>
  );
}
