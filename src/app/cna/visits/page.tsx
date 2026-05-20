import { ComingSoonCard } from "@/components/app-shell";

export default function CnaVisits() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Visits
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Today, upcoming, and completed visits will live here.
        </p>
      </div>
      <ComingSoonCard
        phase="Phase 2"
        title="Visit list + start-visit flow"
        body="Live list of today's clients with one-tap 'Start visit'. Each visit row links to the dedicated logging screen at /cna/visits/[id]."
      />
    </div>
  );
}
