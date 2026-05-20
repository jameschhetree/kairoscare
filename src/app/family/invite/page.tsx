import { ComingSoonCard } from "@/components/app-shell";

export default function FamilyInvite() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Invite family
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Bring a sibling, a spouse, or a healthcare proxy into the loop.
        </p>
      </div>
      <ComingSoonCard
        phase="Phase 3"
        title="Family invite + role selection"
        body="Add a new viewer or healthcare proxy. Inviter sets canViewAllUpdates and role; invite emails go through Resend with generic body copy (no PHI per spec)."
      />
    </div>
  );
}
