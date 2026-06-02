import Link from "next/link";
import { prisma } from "@/lib/prisma";

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

const STATUS_LABEL: Record<string, string> = {
  NotStarted: "Not started",
  InProgress: "In progress",
  Completed: "Completed",
  Missed: "Missed",
  Cancelled: "Cancelled",
};

function formatTime(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function durationMinutes(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}

export default async function CnaVisitDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      client: { select: { fullName: true, address: true, state: true } },
      careUpdates: {
        orderBy: { timestamp: "asc" },
        select: {
          id: true,
          updateType: true,
          mood: true,
          mealStatus: true,
          activityType: true,
          note: true,
          photoStoragePath: true,
          timestamp: true,
        },
      },
    },
  });

  if (!visit) {
    return (
      <div className="space-y-6">
        <Link
          href="/cna"
          className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-sky-700)] hover:text-[color:var(--color-navy-900)]"
        >
          ← Back to today
        </Link>
        <div className="card p-6">
          <h1 className="font-display text-[1.6rem] text-[color:var(--color-navy-900)]">Visit not found</h1>
          <p className="mt-2 text-[color:var(--color-warm-ink)]">
            The visit you tried to open does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const updateCount = visit.careUpdates.length;
  const hasActual = visit.actualStart && visit.actualEnd;
  const durationLabel = hasActual
    ? `${durationMinutes(visit.actualStart!, visit.actualEnd!)} min`
    : visit.actualStart
    ? "In progress"
    : "—";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/cna"
          className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-sky-700)] hover:text-[color:var(--color-navy-900)]"
        >
          ← Back to today
        </Link>
        <p className="mt-3 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
          {formatDate(visit.scheduledStart)} · {STATUS_LABEL[visit.status] ?? visit.status}
        </p>
        <h1 className="mt-1 font-display text-[2.2rem] leading-[1.1] text-[color:var(--color-navy-900)] md:text-[2.6rem]">
          {visit.client.fullName}
        </h1>
        {visit.client.address && (
          <p className="mt-1 text-[0.9rem] text-[color:var(--color-warm-ink)]">{visit.client.address}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Scheduled</p>
          <p className="mt-1 font-display text-[1rem] text-[color:var(--color-navy-900)]">
            {formatTime(visit.scheduledStart)} – {formatTime(visit.scheduledEnd)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Actual</p>
          <p className="mt-1 font-display text-[1rem] text-[color:var(--color-navy-900)]">
            {visit.actualStart ? `${formatTime(visit.actualStart)} – ${formatTime(visit.actualEnd)}` : "—"}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Duration</p>
          <p className="mt-1 font-display text-[1rem] text-[color:var(--color-navy-900)]">{durationLabel}</p>
        </div>
        <div className="card p-4">
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Updates logged</p>
          <p className="mt-1 font-display text-[1rem] text-[color:var(--color-navy-900)]">{updateCount}</p>
        </div>
      </div>

      <section>
        <h2 className="font-display text-[1.3rem] text-[color:var(--color-navy-900)]">Care log</h2>
        <p className="mt-1 text-[0.85rem] text-[color:var(--color-warm-ink)]">
          {updateCount === 0
            ? "Nothing logged yet for this visit."
            : `${updateCount} entr${updateCount === 1 ? "y" : "ies"} from this visit, oldest first.`}
        </p>

        {updateCount > 0 && (
          <ol className="mt-5 space-y-3">
            {visit.careUpdates.map((u) => {
              const kindLabel = UPDATE_KIND_LABEL[u.updateType] ?? u.updateType;
              return (
                <li key={u.id} className="card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.7rem] uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
                          {kindLabel}
                        </span>
                        {u.mood && (
                          <span className="inline-flex items-center gap-1.5 text-[0.72rem] text-[color:var(--color-navy-900)]">
                            <span
                              aria-hidden
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ background: MOOD_DOT[u.mood] ?? "var(--color-warm-muted)" }}
                            />
                            {MOOD_LABEL[u.mood] ?? u.mood}
                          </span>
                        )}
                        {u.mealStatus && (
                          <span className="text-[0.72rem] text-[color:var(--color-warm-ink)]">
                            Meal: {u.mealStatus}
                          </span>
                        )}
                        {u.activityType && (
                          <span className="text-[0.72rem] text-[color:var(--color-warm-ink)]">
                            Activity: {u.activityType}
                          </span>
                        )}
                      </div>
                      {u.note && (
                        <p className="mt-2 text-[0.9rem] leading-snug text-[color:var(--color-warm-ink)]">{u.note}</p>
                      )}
                      {u.photoStoragePath && (
                        <p className="mt-2 text-[0.72rem] italic text-[color:var(--color-warm-muted)]">
                          Photo attached (signed URL minted at view time)
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-[0.72rem] text-[color:var(--color-warm-muted)]">
                      {formatTime(u.timestamp)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
