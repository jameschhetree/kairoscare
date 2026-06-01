import { ComingSoonCard } from "@/components/app-shell";

export default function AdminSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Support
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Internal tools for the KairosCare team: onboarding, billing notes, and
          escalations.
        </p>
      </div>
      <ComingSoonCard
        phase="Phase 5"
        title="Support tooling"
        body="Per-agency support notes, BAA tracking, offboarding workflow, and a data-export placeholder."
      />
    </div>
  );
}
