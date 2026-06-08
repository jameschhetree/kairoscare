import Link from "next/link";
import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, getDemoUser, demoFamilyClients } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

// Daily improvement 2026-06-08 — family dashboard previously just listed the
// loved ones linked to this account. Now each card also surfaces a per-loved-one
// snapshot from FamilyVisible + published CareUpdates: last visit relative date,
// latest mood dot, and a one-tap link to the filtered timeline.

const MOOD_DOT_COLOR: Record<string, string> = {
  Happy: "var(--color-mood-happy, #5FA978)",
  Calm: "var(--color-mood-calm, #7DB7E8)",
  Tired: "var(--color-mood-tired, #C9A146)",
  Anxious: "var(--color-mood-anxious, #E0846B)",
  Unwell: "var(--color-mood-unwell, #B85450)",
};

function formatRelativeDate(d: Date | null): string {
  if (!d) return "No updates yet";
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

  // Per-loved-one snapshot — pull latest FamilyVisible + published CareUpdate
  // per client, in a single scoped query. No N+1.
  const clientIds = memberships.map((m) => m.clientId);
  const recentUpdates = clientIds.length > 0
    ? await prisma.careUpdate.findMany({
        where: {
          clientId: { in: clientIds },
          visibility: "FamilyVisible",
          isPublished: true,
        },
        select: { clientId: true, timestamp: true, mood: true },
        orderBy: { timestamp: "desc" },
        take: 200,
      })
    : [];

  const snapshot = new Map<string, { lastUpdate: Date | null; latestMood: string | null }>();
  for (const m of memberships) {
    snapshot.set(m.clientId, { lastUpdate: null, latestMood: null });
  }
  for (const u of recentUpdates) {
    const s = snapshot.get(u.clientId);
    if (!s) continue;
    if (!s.lastUpdate || u.timestamp > s.lastUpdate) {
      s.lastUpdate = u.timestamp;
    }
    if (!s.latestMood && u.mood) {
      s.latestMood = u.mood;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
          Welcome back, {user?.fullName.split(" ")[0]}
        </p>
        <h1 className="mt-2 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">Your family</h1>
        <p className="mt-2 max-w-[560px] text-[color:var(--color-warm-ink)]">
          Snapshots of each loved one below. Tap any card for the full visit timeline.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {memberships.length === 0 ? (
          <div className="card p-6 text-[color:var(--color-warm-ink)]">
            No clients are linked to your account yet. Ask the agency to send an invite. They can do this from the agency portal.
          </div>
        ) : memberships.map((m) => {
          const s = snapshot.get(m.clientId) ?? { lastUpdate: null, latestMood: null };
          return (
            <Link
              key={m.id}
              href="/family/timeline"
              className="card p-5 block hover:bg-[color:var(--color-cream-100)] transition-colors"
            >
              <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">{m.role}</p>
              <p className="mt-1 font-display text-[1.2rem] font-semibold text-[color:var(--color-navy-900)]">{m.client.fullName}</p>
              <p className="mt-1 text-[0.9rem] text-[color:var(--color-warm-ink)]">{m.client.address ?? "Address on file"}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[color:var(--color-sky-200,#e3eaf2)] pt-3">
                <span className="text-[0.82rem] text-[color:var(--color-warm-ink)]">
                  <span className="text-[color:var(--color-warm-muted)]">Last update:</span> {formatRelativeDate(s.lastUpdate)}
                </span>
                {s.latestMood && (
                  <span className="inline-flex items-center gap-1.5 text-[0.82rem] text-[color:var(--color-warm-ink)]">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: MOOD_DOT_COLOR[s.latestMood] ?? "var(--color-warm-muted, #98897a)" }}
                      aria-hidden
                    />
                    {s.latestMood}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
