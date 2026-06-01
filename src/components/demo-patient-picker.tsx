"use client";

import { demoPatients, type DemoPatient, type Mood } from "@/data/demo-patients";

// Tabbed patient picker for the /demo page. Three patients, intentionally
// asymmetric layout (long active card on the left, two stacked side cards on
// the right) so this section doesn't read like a centered SaaS toggle row.

const MOOD_COLOR: Record<Mood, string> = {
  happy: "var(--color-mood-happy)",
  calm: "var(--color-mood-calm)",
  tired: "var(--color-mood-tired)",
  anxious: "var(--color-mood-anxious)",
  unwell: "var(--color-mood-unwell)",
};

export function DemoPatientPicker({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3" role="tablist" aria-label="Sample patients">
      {demoPatients.map((p) => (
        <PatientCard
          key={p.id}
          patient={p}
          active={p.id === active}
          onSelect={() => onSelect(p.id)}
        />
      ))}
    </div>
  );
}

function PatientCard({
  patient,
  active,
  onSelect,
}: {
  patient: DemoPatient;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-[var(--radius-lg)] border p-5 text-left transition ${
        active
          ? "border-[color:var(--color-navy-900)] bg-white shadow-[var(--shadow-card)]"
          : "border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-50)] hover:border-[color:var(--color-navy-700)] hover:bg-white"
      }`}
    >
      {active && (
        <span
          aria-hidden
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-navy-900)] px-2 py-0.5 text-[0.66rem] font-medium uppercase tracking-[0.14em] text-[color:var(--color-cream-50)]"
        >
          Viewing
        </span>
      )}
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full font-display text-[0.9rem]"
          style={{
            background: "color-mix(in srgb, var(--color-sky-700) 14%, white)",
            color: "var(--color-sky-700)",
          }}
        >
          {patient.initials}
        </div>
        <div>
          <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">
            {patient.fullName}
          </p>
          <p className="text-[0.78rem] text-[color:var(--color-warm-muted)]">{patient.ageBand}</p>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">
            7-day mood
          </p>
          <div className="mt-1.5 flex gap-1">
            {patient.dayMoodTrend.map((m, i) => (
              <span
                key={i}
                className="h-3 w-3 rounded-full"
                style={{ background: MOOD_COLOR[m], opacity: 0.85 }}
              />
            ))}
          </div>
        </div>
        <p className="text-[0.74rem] text-[color:var(--color-warm-muted)]">
          {patient.status === "in-progress" ? "Visit in progress" : "Visit complete"}
        </p>
      </div>
    </button>
  );
}
