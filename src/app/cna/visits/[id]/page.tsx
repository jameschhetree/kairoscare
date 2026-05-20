import { ComingSoonCard } from "@/components/app-shell";

export default async function CnaVisitDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
          Visit {id.slice(0, 8)}
        </p>
        <h1 className="mt-1 font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Visit detail
        </h1>
      </div>
      <ComingSoonCard
        phase="Phase 2"
        title="Care-update logging"
        body="One-tap moods, meals, activities, photo upload, end-of-shift summary. Updates respect the agency's auto-publish toggle and write to the audit log on insert."
      />
    </div>
  );
}
