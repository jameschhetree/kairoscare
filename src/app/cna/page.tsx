import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function CnaHome() {
  const user = await getSessionUser();
  // CNA homepage shows today's assignments based on real data (Phase 1 shell
  // can already pull from Prisma; full visit-log flow ships in Phase 2).
  const today = await prisma.cNAClientAssignment.findMany({
    where: { cna: { userId: user?.id } },
    include: { client: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
          Good morning, {user?.fullName.split(" ")[0]}
        </p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
          Today&apos;s clients
        </h1>
        <p className="mt-2 max-w-[560px] text-[color:var(--color-warm-ink)]">
          One-tap mood, meal, activity, and end-of-shift logging arrives in Phase
          2. For now: a calm read-only view of who&apos;s on your day.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {today.length === 0 ? (
          <div className="card p-6 text-[color:var(--color-warm-ink)]">
            No assignments yet. Your agency owner will assign clients to you in the
            agency portal.
          </div>
        ) : (
          today.map((a) => (
            <div key={a.id} className="card p-5">
              <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
                {a.client.state ?? "—"}
              </p>
              <p className="mt-1 font-display text-[1.2rem] font-semibold text-[color:var(--color-navy-900)]">
                {a.client.fullName}
              </p>
              <p className="mt-1 text-[0.9rem] text-[color:var(--color-warm-ink)]">
                {a.client.address ?? "Address on file"}
              </p>
              <p className="mt-3 text-[0.82rem] italic text-[color:var(--color-warm-muted)]">
                Visit start UI coming in Phase 2.
              </p>
            </div>
          ))
        )}
      </div>

      <ComingSoonCard
        phase="Phase 2"
        title="Visit-log flow"
        body="One-tap check-in, mood, meal, activity, photo, end-of-shift — designed for a 30-second log on a phone. EN + ES toggle on the caregiver flow."
      />
    </div>
  );
}
