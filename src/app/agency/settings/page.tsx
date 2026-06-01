import { ComingSoonCard } from "@/components/app-shell";
import { getDemoRole, demoAgency } from "@/lib/demo-seed";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function AgencySettings() {
  const isDemo = !!(await getDemoRole());

  const autoPublish = isDemo
    ? demoAgency.autoPublishCnaUpdates
    : (await (async () => {
        const user = await getSessionUser();
        const agency = await prisma.organization.findUnique({ where: { id: user?.agencyId ?? "" } });
        return agency?.autoPublishCnaUpdates ?? true;
      })());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">Agency settings</h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">Your organization profile and publishing defaults.</p>
      </div>
      <div className="card p-6">
        <p className="text-[0.78rem] uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">Auto-publish caregiver updates</p>
        <p className="mt-2 font-display text-[1.4rem] text-[color:var(--color-navy-900)]">{autoPublish ? "On" : "Review first"}</p>
        <p className="mt-1 text-[0.92rem] text-[color:var(--color-warm-ink)]">
          When on, every caregiver update is visible to family the moment it&apos;s logged. When off, your staff approves updates before families see them. Toggle UI lands in Phase 4.
        </p>
      </div>
      <ComingSoonCard phase="Phase 4" title="Settings UI" body="Logo upload, contact info, default notification cadence, invite templates, and compliance acknowledgements." />
    </div>
  );
}
