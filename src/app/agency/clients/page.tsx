import Link from "next/link";
import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, demoClients } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

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
  const clients = await prisma.client.findMany({
    where: { agencyId: user?.agencyId ?? "" },
    orderBy: { fullName: "asc" },
    include: {
      familyMemberships: { include: { familyMember: true } },
      cnaAssignments: { include: { cna: { include: { user: true } } } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Clients</h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">Active clients and the caregivers + families linked to each.</p>
      </div>
      <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
        {clients.map((c) => (
          <Link key={c.id} href={`/agency/clients/${c.id}`} className="flex flex-col gap-1 px-5 py-4 hover:bg-[color:var(--color-cream-100)]">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)]">{c.fullName}</p>
              <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">{c.state ?? "-"}</p>
            </div>
            <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">
              {c.cnaAssignments.length} caregiver{c.cnaAssignments.length === 1 ? "" : "s"} · {c.familyMemberships.length} family seat{c.familyMemberships.length === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
      </div>
      <ComingSoonCard phase="Phase 4" title="Client management UI" body="Create + edit client profiles, assign caregivers, invite family members, set agency-internal notes." />
    </div>
  );
}
