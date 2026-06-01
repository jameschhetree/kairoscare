"use client";

import { useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock4,
  Coffee,
  Heart,
  HeartHandshake,
  MessageSquareText,
  Music,
  PencilLine,
  Plus,
  Smile,
  Sparkles,
  StickyNote,
  Sun,
  Utensils,
} from "lucide-react";
import type { DemoLog, DemoLogKind, DemoPatient, Mood } from "@/data/demo-patients";

// Interactive CNA portal mock for the /demo page. State is *local-only*: any
// "log mood / log meal / log note" click prepends a synthetic card to the
// timeline. Resetting the patient via the picker drops back to the seed logs.
//
// We intentionally do NOT animate height of the timeline with a measured
// transition — keeps CLS at zero. New cards fade+rise via the .demo-pop class
// defined in globals.css (gated behind prefers-reduced-motion).

const MOOD_LABEL: Record<Mood, string> = {
  happy: "Happy",
  calm: "Calm",
  tired: "Tired",
  anxious: "Anxious",
  unwell: "Unwell",
};

const MOOD_COLOR: Record<Mood, string> = {
  happy: "var(--color-mood-happy)",
  calm: "var(--color-mood-calm)",
  tired: "var(--color-mood-tired)",
  anxious: "var(--color-mood-anxious)",
  unwell: "var(--color-mood-unwell)",
};

const KIND_ICON: Record<DemoLogKind, React.ReactNode> = {
  checkin: <Clock4 size={16} />,
  mood: <Smile size={16} />,
  meal: <Utensils size={16} />,
  activity: <Music size={16} />,
  note: <StickyNote size={16} />,
  photo: <Camera size={16} />,
  endshift: <Sun size={16} />,
};

const KIND_ACCENT: Record<DemoLogKind, string> = {
  checkin: "var(--color-mood-calm)",
  mood: "var(--color-mood-happy)",
  meal: "var(--color-positive)",
  activity: "var(--color-sky-700)",
  note: "var(--color-warm-muted)",
  photo: "var(--color-mood-tired)",
  endshift: "var(--color-mood-happy)",
};

function nowLabel(): string {
  const d = new Date();
  const hours = d.getHours();
  const mins = d.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = ((hours + 11) % 12) + 1;
  return `${h12}:${mins} ${period}`;
}

export function DemoCnaPortal({ patient }: { patient: DemoPatient }) {
  // Reset state when patient changes — keyed by id at parent so this is fine.
  const [extraLogs, setExtraLogs] = useState<DemoLog[]>([]);
  const [moodToast, setMoodToast] = useState<string | null>(null);

  const logs = useMemo(
    () => [...extraLogs, ...patient.logs],
    [extraLogs, patient.logs],
  );

  function addLog(partial: Omit<DemoLog, "id" | "time">) {
    const id = `local-${Date.now()}`;
    const newLog: DemoLog = { id, time: nowLabel(), ...partial };
    setExtraLogs((prev) => [newLog, ...prev]);
    setMoodToast(partial.label);
    window.setTimeout(() => setMoodToast(null), 1800);
  }

  function logMood(mood: Mood) {
    addLog({
      kind: "mood",
      label: `Mood: ${MOOD_LABEL[mood]}`,
      body: `Logged ${MOOD_LABEL[mood].toLowerCase()} mood for ${patient.short}.`,
      mood,
    });
  }

  function logMeal() {
    addLog({
      kind: "meal",
      label: "Snack",
      body: "Logged a small snack and water. Ate most of it.",
    });
  }

  function logActivity() {
    addLog({
      kind: "activity",
      label: "Activity",
      body: `${patient.short} and I sat by the window and talked for a few minutes.`,
    });
  }

  function logNote() {
    addLog({
      kind: "note",
      label: "Note for office",
      body: "Quick note logged from the demo. In production this routes to your agency dashboard, not the family.",
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.78fr]">
      {/* LEFT: live timeline (the CNA's own view of their shift) */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-100)] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: patient.status === "in-progress" ? "var(--color-positive)" : "var(--color-warm-muted)" }}
            />
            <p className="text-[0.74rem] font-medium tracking-wide uppercase text-[color:var(--color-warm-muted)]">
              {patient.status === "in-progress" ? "Visit in progress" : "Visit complete"} · started {patient.startedAt}
            </p>
          </div>
          <p className="text-[0.74rem] text-[color:var(--color-warm-muted)]">
            {logs.length} {logs.length === 1 ? "log" : "logs"}
          </p>
        </div>

        <div className="divide-y divide-[color:var(--color-warm-hairline)]">
          {logs.map((log, idx) => (
            <TimelineRow
              key={log.id}
              log={log}
              fresh={log.id.startsWith("local-") && idx === 0}
            />
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[color:var(--color-warm-hairline)] px-5 py-3.5 text-[0.78rem] text-[color:var(--color-warm-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={13} /> Auto-shared with {patient.familyMessage.name}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[color:var(--color-positive)]">
            <Heart size={13} fill="currentColor" /> {patient.familyMessage.name} sent thanks
          </span>
        </div>
      </div>

      {/* RIGHT: action panel — the CNA's one-tap logging surface */}
      <div className="flex flex-col gap-4">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[0.74rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
              Log a moment
            </p>
            <span className="role-badge">{patient.cna}, CNA</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MoodButton mood="happy" onClick={() => logMood("happy")} />
            <MoodButton mood="calm" onClick={() => logMood("calm")} />
            <MoodButton mood="tired" onClick={() => logMood("tired")} />
            <MoodButton mood="anxious" onClick={() => logMood("anxious")} />
            <MoodButton mood="unwell" onClick={() => logMood("unwell")} />
            <button
              type="button"
              onClick={() => logMood("happy")}
              className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-warm-hairline)] px-2 py-3 text-[0.74rem] text-[color:var(--color-warm-muted)] hover:border-[color:var(--color-navy-700)] hover:text-[color:var(--color-navy-900)]"
            >
              <Plus size={12} className="mx-auto" />
              <span className="mt-1 block">More</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <QuickAction icon={<Utensils size={14} />} label="Log meal" onClick={logMeal} />
            <QuickAction icon={<Music size={14} />} label="Log activity" onClick={logActivity} />
            <QuickAction icon={<PencilLine size={14} />} label="Note for office" onClick={logNote} />
            <QuickAction icon={<Camera size={14} />} label="Add photo" onClick={() => addLog({ kind: "photo", label: "Photo added", body: "Photo would attach here. In the live app it's encrypted on upload." })} />
          </div>

          {moodToast && (
            <p className="demo-toast mt-3 text-[0.78rem] text-[color:var(--color-positive)]">
              <Sparkles size={12} className="mr-1 inline" /> {moodToast} added to the timeline
            </p>
          )}
        </div>

        <div className="card p-5">
          <p className="text-[0.74rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            Family reply
          </p>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-sky-100)] font-display text-[0.86rem] text-[color:var(--color-sky-700)]">
              {patient.familyMessage.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.86rem] font-medium text-[color:var(--color-navy-900)]">
                {patient.familyMessage.name} · {patient.familyMessage.relation}
              </p>
              <p className="mt-1 text-[0.88rem] leading-snug text-[color:var(--color-warm-ink)]">
                &ldquo;{patient.familyMessage.body}&rdquo;
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[0.72rem] text-[color:var(--color-warm-muted)]">
                <HeartHandshake size={12} /> Family reactions never reach the caregiver&apos;s phone. Only the agency portal.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--color-warm-hairline)] p-4">
          <p className="inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">
            <MessageSquareText size={12} /> Demo mode
          </p>
          <p className="mt-1 text-[0.82rem] text-[color:var(--color-warm-ink)]">
            This is a sample shift. No data leaves your browser. Switch patients to see how the same surface carries different shifts of a real day.
          </p>
        </div>
      </div>
    </div>
  );
}

function MoodButton({ mood, onClick }: { mood: Mood; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-1 rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-white px-2 py-3 transition hover:-translate-y-0.5 hover:border-[color:var(--color-navy-700)]"
    >
      <span
        className="h-5 w-5 rounded-full"
        style={{ background: MOOD_COLOR[mood], opacity: 0.85 }}
      />
      <span className="text-[0.74rem] text-[color:var(--color-navy-900)]">{MOOD_LABEL[mood]}</span>
    </button>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-50)] px-2 py-2.5 text-[0.82rem] text-[color:var(--color-navy-900)] transition hover:border-[color:var(--color-navy-700)] hover:bg-white"
    >
      <span className="text-[color:var(--color-sky-700)]">{icon}</span>
      {label}
    </button>
  );
}

function TimelineRow({ log, fresh }: { log: DemoLog; fresh: boolean }) {
  const accent = log.mood ? MOOD_COLOR[log.mood] : KIND_ACCENT[log.kind];
  const icon = KIND_ICON[log.kind];
  return (
    <div className={`flex gap-3 px-5 py-4 ${fresh ? "demo-pop" : ""}`}>
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="font-display text-[0.95rem] font-semibold text-[color:var(--color-navy-900)]">
            {log.label}
          </p>
          <p className="text-[0.72rem] text-[color:var(--color-warm-muted)]">{log.time}</p>
        </div>
        <p className="mt-1 text-[0.86rem] leading-snug text-[color:var(--color-warm-ink)]">{log.body}</p>
        {log.reaction && (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[0.72rem] italic text-[color:var(--color-warm-muted)]">
            <Heart size={11} /> {log.reaction}
          </p>
        )}
      </div>
    </div>
  );
}
