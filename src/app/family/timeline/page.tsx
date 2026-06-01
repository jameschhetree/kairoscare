import { ComingSoonCard } from "@/components/app-shell";

export default function FamilyTimeline() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Timeline
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          A warm, honest record of every visit.
        </p>
      </div>
      <ComingSoonCard
        phase="Phase 3"
        title="Photo-rich visit feed"
        body="Each card shows the caregiver, time, mood, meal, activity, and any photo. Pulled live from CareUpdate rows where visibility = FamilyVisible and isPublished = true."
      />
    </div>
  );
}
