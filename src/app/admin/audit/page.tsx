import { prisma } from "@/lib/prisma";

export default async function AdminAudit() {
  const rows = await prisma.auditLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 60,
    include: { actor: true, agency: true },
  });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[2rem] leading-[1.1] text-[color:var(--color-navy-900)]">
          Audit log
        </h1>
        <p className="mt-1 text-[color:var(--color-warm-ink)]">
          Last 60 PHI access and write events. Full filter UI lands in Phase 5.
        </p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-[0.86rem]">
          <thead className="bg-[color:var(--color-cream-100)] text-left text-[0.72rem] uppercase tracking-[0.14em] text-[color:var(--color-warm-muted)]">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Agency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-warm-hairline)]">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-[color:var(--color-warm-muted)]">
                  {r.timestamp.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="px-4 py-3">{r.actor?.fullName ?? "system"}</td>
                <td className="px-4 py-3 font-mono text-[0.8rem]">{r.action}</td>
                <td className="px-4 py-3">
                  {r.entityType}
                  {r.entityId ? `:${r.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="px-4 py-3 text-[color:var(--color-warm-muted)]">{r.agency?.name ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
