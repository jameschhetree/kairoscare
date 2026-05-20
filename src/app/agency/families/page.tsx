import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function AgencyFamilies() {
  const user = await getSessionUser();
  const memberships = await prisma.clientFamilyMembership.findMany({
    where: { client: { agencyId: user?.agencyId ?? "" } },
    include: {
      client: true,
      familyMember: { include: { user: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Families
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Invited family members across your clients.
        </p>
      </div>

      <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
        {memberships.map((m) => (
          <div key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
            <div>
              <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">
                {m.familyMember.fullName}
              </p>
              <p className="text-[0.84rem] text-[color:var(--color-warm-muted)]">
                {m.familyMember.user.email}
              </p>
            </div>
            <p className="text-[0.86rem] text-[color:var(--color-warm-ink)]">
              {m.client.fullName} · <span className="text-[color:var(--color-warm-muted)]">{m.role}</span>
            </p>
          </div>
        ))}
      </div>

      <ComingSoonCard
        phase="Phase 4"
        title="Family invite + role management"
        body="Send invites, resend, revoke, and change a member's role. Comments-to-agency routing rules live here, never the caregiver."
      />
    </div>
  );
}
