import { ComingSoonCard } from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/roles";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    include: { roleAssignments: true, agency: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Users
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Search and review every account on KairosCare.
        </p>
      </div>
      <div className="card divide-y divide-[color:var(--color-warm-hairline)]">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
            <div>
              <p className="font-display text-[1.05rem] font-semibold text-[color:var(--color-navy-900)]">{u.fullName}</p>
              <p className="text-[0.84rem] text-[color:var(--color-warm-muted)]">{u.email}</p>
            </div>
            <p className="text-[0.84rem] text-[color:var(--color-warm-ink)]">
              {u.roleAssignments.map((r) => ROLE_LABEL[r.role]).join(", ") || "No role"} · {u.agency?.name ?? "—"}
            </p>
          </div>
        ))}
      </div>
      <ComingSoonCard
        phase="Phase 5"
        title="User actions"
        body="Search, deactivate, change role, force password reset, and review the role-assignment history."
      />
    </div>
  );
}
