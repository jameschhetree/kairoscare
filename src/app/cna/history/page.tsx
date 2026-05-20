import { ComingSoonCard } from "@/components/app-shell";

export default function CnaHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          History
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          A calm record of your past visits and the family thanks you&apos;ve received.
        </p>
      </div>
      <ComingSoonCard
        phase="Phase 2"
        title="Past visits + family thanks feed"
        body="Reverse-chronological list of completed visits with the family reactions attached. Built for caregiver recognition, never for performance scoring."
      />
    </div>
  );
}
