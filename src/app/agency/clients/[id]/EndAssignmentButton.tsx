"use client";

// Inline End-assignment button. Shows the action only for active assignments
// (endDate === null). Confirms before submit, surfaces errors inline, and
// triggers the server action which revalidates the page so the row disappears.

import { useState, useTransition } from "react";
import { endAssignmentAction } from "./actions";

export function EndAssignmentButton({
  assignmentId,
  clientId,
  cnaName,
}: {
  assignmentId: string;
  clientId: string;
  cnaName: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    const ok = window.confirm(`End ${cnaName}'s assignment to this client?`);
    if (!ok) return;
    startTransition(async () => {
      const result = await endAssignmentAction(assignmentId, clientId);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="text-[0.72rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)] hover:text-[color:var(--color-mood-anxious,#E0846B)] disabled:opacity-50 transition-colors"
        aria-label={`End assignment for ${cnaName}`}
      >
        {pending ? "ending…" : "End"}
      </button>
      {error && (
        <span className="text-[0.72rem] text-[color:var(--color-mood-unwell,#B85450)]">
          {error}
        </span>
      )}
    </div>
  );
}
