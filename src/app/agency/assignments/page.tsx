import { ComingSoonCard } from "@/components/app-shell";

export default function AgencyAssignments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Assignments
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Lightweight CNA ↔ client assignment. Not a replacement for EVV.
        </p>
      </div>
      <ComingSoonCard
        phase="Phase 4"
        title="Schedule lite"
        body="Date, start, end, status. Enough to remind a caregiver who's on their list today. Full scheduling stays with your existing EVV system."
      />
    </div>
  );
}
