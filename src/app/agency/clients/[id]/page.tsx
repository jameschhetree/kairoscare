import { notFound } from "next/navigation";
import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, demoClients } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { recordAudit } from "@/lib/audit";

// Daily improvement 2026-06-07 — agency client detail previously stopped at
// care notes / emergency contact / caregivers / family. Now there's a Recent
// activity card showing the last 30 CareUpdates for this client (both
// FamilyVisible and AgencyOnly — agency sees the full picture). Each entry
// shows time, kind, mood dot, CNA name, note snippet, and an AgencyOnly chip
// when the update isn't shared with family.

const MOOD_DOT_COLOR: Record<string, string> = {
  Happy: "var(--color-mood-happy, #5FA978)",
  Calm: "var(--color-mood-calm, #7DB7E8)",
  Tired: "var(--color-mood-tired, #C9A146)",
  Anxious: "var(--color-mood-anxious, #E0846B)",
  Unwell: "var(--color-mood-unwell, #B85450)",
};

const UPDATE_KIND_LABEL: Record<string, string> = {
  CheckIn: "Check-in",
  Meal: "Meal",
  Mood: "Mood",
  Activity: "Activity",
  Note: "Note",
  Photo: "Photo",
  EndOfShift: "End of shift",
};

function formatStamp(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AgencyClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isDemo = !!(await getDemoRole());

  if (isDemo) {
    const client = demoClients.find((c) => c.id === id);
    if (!client) notFound();
    return (
      <div className="space-y-8">
        <div>
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Client profile</p>
          <h1 className="mt-1 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)]">{client.fullName}</h1>
          <p className="mt-1 text-[color:var(--color-warm-ink)]">{client.address}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Care notes</p>
            <p className="mt-2 text-[color:var(--color-warm-ink)]">{client.careNotes}</p>
          </div>
          <div className="card p-5">
            <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Emergency contact</p>
            <p className="mt-2 text-[color:var(--color-warm-ink)]">{client.emergencyContact}</p>
          </div>
          <div className="card p-5">
            <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Assigned caregivers</p>
            <ul className="mt-2 space-y-1 text-[color:var(--color-warm-ink)]">
              {client.cnaNames.map((name) => <li key={name}>{name}</li>)}
            </ul>
          </div>
          <div className="card p-5">
            <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Family</p>
            <ul className="mt-2 space-y-1 text-[color:var(--color-warm-ink)]">
              {client.familyMembers.length === 0 ? (
                <li className="text-[color:var(--color-warm-muted)]">No family linked yet</li>
              ) : client.familyMembers.map((fm) => (
                <li key={fm.name}>{fm.name} <span className="text-[color:var(--color-warm-muted)]">/ {fm.role}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <ComingSoonCard phase="Phase 4" title="Edit + assign UI" body="Edit client profile, add or remove caregivers and family members, view the family-visible timeline of recent updates." />
      </div>
    );
  }

  // Real DB path
  const user = await getSessionUser();
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      familyMemberships: { include: { familyMember: { include: { user: true } } } },
      cnaAssignments: { include: { cna: { include: { user: true } } } },
    },
  });
  if (!client || client.agencyId !== user?.agencyId) notFound();

  await recordAudit({
    actorUserId: user!.id,
    action: "client.viewed",
    entityType: "Client",
    entityId: client.id,
    agencyId: client.agencyId,
  });

  const recentActivity = await prisma.careUpdate.findMany({
    where: { clientId: client.id },
    orderBy: { timestamp: "desc" },
    take: 30,
    include: {
      cna: { include: { user: { select: { fullName: true } } } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Client profile</p>
        <h1 className="mt-1 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)]">{client.fullName}</h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">{client.address ?? ""}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Care notes</p>
          <p className="mt-2 text-[color:var(--color-warm-ink)]">{client.careNotes ?? "No care notes yet."}</p>
        </div>
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Emergency contact</p>
          <p className="mt-2 text-[color:var(--color-warm-ink)]">{client.emergencyContact ?? "Not provided."}</p>
        </div>
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Assigned caregivers</p>
          <ul className="mt-2 space-y-1 text-[color:var(--color-warm-ink)]">
            {client.cnaAssignments.map((a) => <li key={a.id}>{a.cna.user.fullName}</li>)}
          </ul>
        </div>
        <div className="card p-5">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Family</p>
          <ul className="mt-2 space-y-1 text-[color:var(--color-warm-ink)]">
            {client.familyMemberships.map((m) => (
              <li key={m.id}>{m.familyMember.fullName} <span className="text-[color:var(--color-warm-muted)]">/ {m.role}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <section className="card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Recent activity</p>
          <p className="text-[0.72rem] text-[color:var(--color-warm-muted)]">
            {recentActivity.length} {recentActivity.length === 1 ? "moment" : "moments"} · agency view
          </p>
        </div>
        {recentActivity.length === 0 ? (
          <p className="mt-3 text-[0.86rem] text-[color:var(--color-warm-muted)]">
            No visit activity logged yet. Updates will appear here as caregivers check in.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[color:var(--color-warm-hairline)]">
            {recentActivity.map((u) => {
              const kind = UPDATE_KIND_LABEL[u.updateType] ?? u.updateType;
              const isAgencyOnly = u.visibility === "AgencyOnly";
              const sub = [u.mealStatus, u.activityType].filter(Boolean).join(" · ");
              return (
                <li key={u.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[0.84rem] text-[color:var(--color-warm-ink)]">
                      <span className="font-medium text-[color:var(--color-navy-900)]">{kind}</span>
                      <span className="text-[color:var(--color-warm-muted)]"> · {formatStamp(u.timestamp)}</span>
                    </p>
                    <p className="text-[0.78rem] text-[color:var(--color-warm-muted)] text-right">
                      {u.cna.user.fullName}
                    </p>
                  </div>
                  {sub && (
                    <p className="mt-0.5 text-[0.78rem] text-[color:var(--color-warm-muted)]">{sub}</p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {u.mood && (
                      <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-[color:var(--color-warm-ink)]">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: MOOD_DOT_COLOR[u.mood] ?? "var(--color-warm-muted, #98897a)" }}
                          aria-hidden
                        />
                        {u.mood}
                      </span>
                    )}
                    {isAgencyOnly && (
                      <span className="inline-block text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)] border border-[color:var(--color-warm-hairline)] rounded px-1.5 py-0.5">
                        Agency only
                      </span>
                    )}
                    {!u.isPublished && (
                      <span className="inline-block text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-mood-anxious,#E0846B)] border border-[color:var(--color-mood-anxious,#E0846B)] rounded px-1.5 py-0.5">
                        Unpublished
                      </span>
                    )}
                  </div>
                  {u.note && (
                    <p className="mt-2 text-[0.86rem] leading-relaxed text-[color:var(--color-warm-ink)] whitespace-pre-wrap">
                      {u.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ComingSoonCard phase="Phase 4" title="Edit + assign UI" body="Edit client profile, add or remove caregivers and family members." />
    </div>
  );
}
