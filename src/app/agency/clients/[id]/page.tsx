import { notFound } from "next/navigation";
import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { recordAudit } from "@/lib/audit";

export default async function AgencyClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      familyMemberships: { include: { familyMember: { include: { user: true } } } },
      cnaAssignments: { include: { cna: { include: { user: true } } } },
    },
  });
  if (!client || client.agencyId !== user?.agencyId) notFound();

  // PHI read — log it.
  await recordAudit({
    actorUserId: user.id,
    action: "client.viewed",
    entityType: "Client",
    entityId: client.id,
    agencyId: client.agencyId,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
          Client profile
        </p>
        <h1 className="mt-1 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          {client.fullName}
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">{client.address ?? ""}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            Care notes
          </p>
          <p className="mt-2 text-[color:var(--color-warm-ink)]">
            {client.careNotes ?? "No care notes yet."}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            Emergency contact
          </p>
          <p className="mt-2 text-[color:var(--color-warm-ink)]">
            {client.emergencyContact ?? "Not provided."}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            Assigned caregivers
          </p>
          <ul className="mt-2 space-y-1 text-[color:var(--color-warm-ink)]">
            {client.cnaAssignments.map((a) => (
              <li key={a.id}>{a.cna.user.fullName}</li>
            ))}
          </ul>
        </div>
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            Family
          </p>
          <ul className="mt-2 space-y-1 text-[color:var(--color-warm-ink)]">
            {client.familyMemberships.map((m) => (
              <li key={m.id}>
                {m.familyMember.fullName} <span className="text-[color:var(--color-warm-muted)]">— {m.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ComingSoonCard
        phase="Phase 4"
        title="Edit + assign UI"
        body="Edit client profile, add or remove caregivers and family members, view the family-visible timeline of recent updates."
      />
    </div>
  );
}
