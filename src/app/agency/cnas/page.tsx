import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function AgencyCnas() {
  const user = await getSessionUser();
  const cnas = await prisma.cNAProfile.findMany({
    where: { agencyId: user?.agencyId ?? "" },
    include: { user: true, clientAssignments: { include: { client: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Caregivers
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          The CNAs on your team and the clients they support.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cnas.map((cna) => (
          <div key={cna.id} className="card p-5">
            <p className="font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)]">
              {cna.user.fullName}
            </p>
            <p className="text-[0.84rem] text-[color:var(--color-warm-muted)]">{cna.user.email}</p>
            <p className="mt-3 text-[0.86rem] text-[color:var(--color-warm-ink)]">
              {cna.languagesSpoken.join(", ")} · {cna.clientAssignments.length} client
              {cna.clientAssignments.length === 1 ? "" : "s"}
            </p>
          </div>
        ))}
      </div>

      <ComingSoonCard
        phase="Phase 4"
        title="Caregiver management"
        body="Add and deactivate caregivers, see submitted updates, set agency-default languages, manage certifications."
      />
    </div>
  );
}
