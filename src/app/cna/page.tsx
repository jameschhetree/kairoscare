import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, getDemoUser, demoCnaAssignments } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function CnaHome() {
  const demoRole = await getDemoRole();
  const isDemo = demoRole === "cna";

  if (isDemo) {
    const user = getDemoUser("cna");
    return (
      <div className="space-y-6 md:space-y-8">
        <div>
          <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
            Good morning, {user.fullName.split(" ")[0]}
          </p>
          <h1 className="mt-2 font-display text-[1.8rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
            Today&apos;s clients
          </h1>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-[color:var(--color-warm-ink)] md:max-w-[560px] md:text-base">
            One-tap mood, meal, activity, and end-of-shift logging arrives in Phase 2. For now: a calm read-only view of who&apos;s on your day.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {demoCnaAssignments.map((a) => (
            <div key={a.id} className="card p-4 md:p-5">
              <p className="text-[0.74rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)] md:text-[0.78rem]">{a.clientState}</p>
              <p className="mt-1 font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)] md:text-[1.2rem]">{a.clientName}</p>
              <p className="mt-1 text-[0.86rem] leading-snug text-[color:var(--color-warm-ink)] md:text-[0.9rem]">{a.clientAddress}</p>
              <p className="mt-3 text-[0.78rem] italic text-[color:var(--color-warm-muted)] md:text-[0.82rem]">Visit start UI coming in Phase 2.</p>
            </div>
          ))}
        </div>
        <ComingSoonCard phase="Phase 2" title="Visit-log flow" body="One-tap check-in, mood, meal, activity, photo, end-of-shift. Designed for a 30-second log on a phone. EN + ES toggle on the caregiver flow." />
      </div>
    );
  }

  const user = await getSessionUser();
  const today = await prisma.cNAClientAssignment.findMany({
    where: { cna: { userId: user?.id } },
    include: { client: true },
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
          Good morning, {user?.fullName.split(" ")[0]}
        </p>
        <h1 className="mt-2 font-display text-[1.8rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
          Today&apos;s clients
        </h1>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-[color:var(--color-warm-ink)] md:max-w-[560px] md:text-base">
          One-tap mood, meal, activity, and end-of-shift logging arrives in Phase 2. For now: a calm read-only view of who&apos;s on your day.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        {today.length === 0 ? (
          <div className="card p-5 text-[0.92rem] text-[color:var(--color-warm-ink)] md:p-6">No assignments yet. Your agency owner will assign clients to you in the agency portal.</div>
        ) : today.map((a) => (
          <div key={a.id} className="card p-4 md:p-5">
            <p className="text-[0.74rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)] md:text-[0.78rem]">{a.client.state ?? "-"}</p>
            <p className="mt-1 font-display text-[1.1rem] font-semibold text-[color:var(--color-navy-900)] md:text-[1.2rem]">{a.client.fullName}</p>
            <p className="mt-1 text-[0.86rem] leading-snug text-[color:var(--color-warm-ink)] md:text-[0.9rem]">{a.client.address ?? "Address on file"}</p>
            <p className="mt-3 text-[0.78rem] italic text-[color:var(--color-warm-muted)] md:text-[0.82rem]">Visit start UI coming in Phase 2.</p>
          </div>
        ))}
      </div>
      <ComingSoonCard phase="Phase 2" title="Visit-log flow" body="One-tap check-in, mood, meal, activity, photo, end-of-shift. Designed for a 30-second log on a phone. EN + ES toggle on the caregiver flow." />
    </div>
  );
}
