import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, getDemoUser, demoFamilyClients } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function FamilyHome() {
  const demoRole = await getDemoRole();
  const isDemo = demoRole === "family";

  if (isDemo) {
    const user = getDemoUser("family");
    return (
      <div className="space-y-8">
        <div>
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
            Welcome back, {user.fullName.split(" ")[0]}
          </p>
          <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">Your family</h1>
          <p className="mt-2 max-w-[560px] text-[color:var(--color-warm-ink)]">
            A warm, photo-rich timeline arrives in Phase 3. Today you can see which loved ones are linked to your account.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {demoFamilyClients.map((fc) => (
            <div key={fc.id} className="card p-5">
              <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">{fc.role}</p>
              <p className="mt-1 font-display text-[1.2rem] font-semibold text-[color:var(--color-navy-900)]">{fc.clientName}</p>
              <p className="mt-1 text-[0.9rem] text-[color:var(--color-warm-ink)]">{fc.clientAddress}</p>
            </div>
          ))}
        </div>
        <ComingSoonCard phase="Phase 3" title="Family timeline" body="Reverse-chronological feed of every visit moment: mood, meal, activity, photo, note. Send a thank-you reaction. Add a comment that routes to the agency, never the caregiver directly." />
      </div>
    );
  }

  const user = await getSessionUser();
  const memberships = await prisma.clientFamilyMembership.findMany({
    where: { familyMember: { userId: user?.id } },
    include: { client: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
          Welcome back, {user?.fullName.split(" ")[0]}
        </p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">Your family</h1>
        <p className="mt-2 max-w-[560px] text-[color:var(--color-warm-ink)]">
          A warm, photo-rich timeline arrives in Phase 3. Today you can see which loved ones are linked to your account.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {memberships.length === 0 ? (
          <div className="card p-6 text-[color:var(--color-warm-ink)]">No clients are linked to your account yet. Ask the agency to send an invite. They can do this from the agency portal.</div>
        ) : memberships.map((m) => (
          <div key={m.id} className="card p-5">
            <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">{m.role}</p>
            <p className="mt-1 font-display text-[1.2rem] font-semibold text-[color:var(--color-navy-900)]">{m.client.fullName}</p>
            <p className="mt-1 text-[0.9rem] text-[color:var(--color-warm-ink)]">{m.client.address ?? "Address on file"}</p>
          </div>
        ))}
      </div>
      <ComingSoonCard phase="Phase 3" title="Family timeline" body="Reverse-chronological feed of every visit moment: mood, meal, activity, photo, note. Send a thank-you reaction. Add a comment that routes to the agency, never the caregiver directly." />
    </div>
  );
}
