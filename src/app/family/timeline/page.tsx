// /family/timeline — reverse-chronological feed of every visible visit moment
// for the family's linked clients. Pulled from CareUpdate where
// visibility=FamilyVisible AND isPublished=true.
//
// Replaces the prior ComingSoonCard placeholder. Daily improvement cycle
// 2026-06-04 — builds on yesterday's /cna/visits list page (8cf680e) so the
// loop is now visible to both sides: CNA logs the moment → family sees it.

import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { getDemoRole, getDemoUser } from "@/lib/demo-seed";
import { getSessionUser } from "@/lib/session";

const MOOD_LABEL: Record<string, string> = {
  Happy: "Happy",
  Calm: "Calm",
  Tired: "Tired",
  Anxious: "Anxious",
  Unwell: "Unwell",
};

const MOOD_DOT: Record<string, string> = {
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

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDayLabel(d: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round((startOfDate.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

type TimelineUpdate = {
  id: string;
  updateType: string;
  mood: string | null;
  mealStatus: string | null;
  activityType: string | null;
  note: string | null;
  photoStoragePath: string | null;
  timestamp: Date;
  clientName: string;
  cnaName: string;
};

async function loadUpdatesForClientIds(clientIds: string[]): Promise<TimelineUpdate[]> {
  if (clientIds.length === 0) return [];
  const rows = await prisma.careUpdate.findMany({
    where: {
      visibility: "FamilyVisible",
      isPublished: true,
      visit: { clientId: { in: clientIds } },
    },
    orderBy: { timestamp: "desc" },
    take: 60,
    include: {
      visit: {
        include: {
          client: { select: { fullName: true } },
          cna: { include: { user: { select: { fullName: true } } } },
        },
      },
    },
  });
  return rows
    .filter((r) => r.visit !== null && r.visit !== undefined)
    .map((r) => ({
      id: r.id,
      updateType: r.updateType,
      mood: r.mood,
      mealStatus: r.mealStatus,
      activityType: r.activityType,
      note: r.note,
      photoStoragePath: r.photoStoragePath,
      timestamp: r.timestamp,
      clientName: r.visit!.client.fullName,
      cnaName: r.visit!.cna.user.fullName,
    }));
}

async function loadUpdatesForFamilyUserId(userId: string): Promise<TimelineUpdate[]> {
  const fm = await prisma.familyMember.findFirst({
    where: { userId },
    include: { clientMemberships: { select: { clientId: true } } },
  });
  const clientIds = (fm?.clientMemberships ?? []).map((m) => m.clientId);
  return loadUpdatesForClientIds(clientIds);
}

async function loadDemoUpdates(): Promise<TimelineUpdate[]> {
  // Demo mode: family seed defines only "Eleanor Williams" — match by fullName.
  const clients = await prisma.client.findMany({
    where: { fullName: "Eleanor Williams" },
    select: { id: true },
  });
  return loadUpdatesForClientIds(clients.map((c) => c.id));
}

function groupByDay(updates: TimelineUpdate[]): { dayLabel: string; entries: TimelineUpdate[] }[] {
  const buckets = new Map<string, { dayLabel: string; entries: TimelineUpdate[] }>();
  for (const u of updates) {
    const d = u.timestamp;
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!buckets.has(key)) {
      buckets.set(key, { dayLabel: formatDayLabel(d), entries: [] });
    }
    buckets.get(key)!.entries.push(u);
  }
  return Array.from(buckets.values());
}

function MoodChip({ mood }: { mood: string | null }) {
  if (!mood) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-ink)]">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: MOOD_DOT[mood] ?? "var(--color-warm-muted, #98897a)" }}
        aria-hidden
      />
      {MOOD_LABEL[mood] ?? mood}
    </span>
  );
}

function UpdateCard({ u }: { u: TimelineUpdate }) {
  const kindLabel = UPDATE_KIND_LABEL[u.updateType] ?? u.updateType;
  const subBits: string[] = [];
  if (u.mealStatus) subBits.push(u.mealStatus);
  if (u.activityType) subBits.push(u.activityType);

  return (
    <article className="card p-5">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            {kindLabel} · {formatTime(u.timestamp)}
          </p>
          <p className="mt-1 text-[0.95rem] text-[color:var(--color-warm-ink)]">
            <span className="font-medium text-[color:var(--color-navy-900)]">{u.cnaName}</span>
            {" "}
            <span className="text-[color:var(--color-warm-muted)]">with</span>
            {" "}
            <span className="text-[color:var(--color-navy-900)]">{u.clientName}</span>
          </p>
          {subBits.length > 0 && (
            <p className="mt-0.5 text-[0.82rem] text-[color:var(--color-warm-muted)]">{subBits.join(" · ")}</p>
          )}
        </div>
        <MoodChip mood={u.mood} />
      </header>

      {u.note && (
        <p className="text-[0.95rem] leading-relaxed text-[color:var(--color-warm-ink)] whitespace-pre-wrap">
          {u.note}
        </p>
      )}

      {u.photoStoragePath && (
        <div className="mt-3 rounded-md border border-dashed border-[color:var(--color-sky-300,#cfd9e8)] bg-[color:var(--color-sky-50,#f3f6fb)] px-3 py-2 text-[0.78rem] text-[color:var(--color-warm-muted)]">
          Photo attached · viewer coming in Phase 3
        </div>
      )}
    </article>
  );
}

export default async function FamilyTimeline() {
  const demoRole = await getDemoRole();
  const isDemo = demoRole === "family";

  let updates: TimelineUpdate[] = [];
  let viewerName = "";
  if (isDemo) {
    viewerName = getDemoUser("family").fullName.split(" ")[0];
    updates = await loadDemoUpdates();
  } else {
    const user = await getSessionUser();
    if (user?.id) {
      viewerName = user.fullName.split(" ")[0];
      updates = await loadUpdatesForFamilyUserId(user.id);
    }
  }

  const grouped = groupByDay(updates);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.4rem]">
          Timeline
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          {updates.length === 0
            ? "No updates yet. The next time a caregiver logs a visit moment, you’ll see it here."
            : `${viewerName ? viewerName + ", h" : "H"}ere are the ${updates.length} most recent moments from your loved ones’ caregivers.`}
        </p>
      </div>

      {grouped.map((day) => (
        <section key={day.dayLabel} className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[1.4rem] text-[color:var(--color-navy-900)]">{day.dayLabel}</h2>
            <span className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
              {day.entries.length} moment{day.entries.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {day.entries.map((u) => (
              <UpdateCard key={u.id} u={u} />
            ))}
          </div>
        </section>
      ))}

      {updates.length === 0 && (
        <ComingSoonCard
          phase="Phase 3"
          title="Reactions + comments"
          body="Send a thank-you. Add a comment that routes to the agency, never the caregiver directly. Photo viewer arrives alongside this."
        />
      )}
    </div>
  );
}
