import { ComingSoonCard } from "@/components/app-shell";

export default function FamilySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Settings
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Notifications, language, and agency contact.
        </p>
      </div>
      <ComingSoonCard
        phase="Phase 3"
        title="Family settings"
        body="Email/push preferences, EN/ES language toggle, and a one-tap shortcut to the agency. We never put PHI in any notification body."
      />
    </div>
  );
}
