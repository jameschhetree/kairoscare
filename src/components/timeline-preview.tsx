// Static family-timeline preview used on the marketing hero. Real timeline
// (DB-driven) lands in Phase 3 — this version is hand-composed for the
// marketing screenshot, but mirrors the actual card shape so the production
// build inherits the visual language.

import { Clock4, Coffee, Music, Heart } from "lucide-react";

export function TimelinePreview() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[34px] bg-gradient-to-br from-[#E3EFFB] via-transparent to-[#FAF7F2] blur-2xl opacity-80"
      />
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-100)] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-positive)]" />
            <p className="text-[0.72rem] font-medium tracking-wide uppercase text-[color:var(--color-warm-muted)]">
              Eleanor's day
            </p>
          </div>
          <p className="text-[0.72rem] text-[color:var(--color-warm-muted)]">Today</p>
        </div>

        <div className="divide-y divide-[color:var(--color-warm-hairline)]">
          <TimelineRow
            icon={<Clock4 size={16} />}
            time="10:04 AM"
            cna="Maria checked in"
            body="Mom was sitting in her usual chair by the window. Calm and smiling."
            accent="var(--color-mood-calm)"
          />
          <TimelineRow
            icon={<Coffee size={16} />}
            time="10:29 AM"
            cna="Breakfast"
            body="Oatmeal with blueberries and herbal tea. Ate most of the bowl."
            accent="var(--color-positive)"
          />
          <TimelineRow
            icon={<Music size={16} />}
            time="11:48 AM"
            cna="End of shift"
            body="Listened to Etta James, short walk to the kitchen, talked about the kids. Good visit."
            accent="var(--color-mood-happy)"
            withReaction
          />
        </div>

        <div className="flex items-center justify-between border-t border-[color:var(--color-warm-hairline)] px-5 py-3.5 text-[0.78rem] text-[color:var(--color-warm-muted)]">
          <span>Visit complete · 1h 44m</span>
          <span className="inline-flex items-center gap-1.5 text-[color:var(--color-positive)]">
            <Heart size={13} fill="currentColor" /> Sarah sent thanks
          </span>
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  icon,
  time,
  cna,
  body,
  accent,
  withReaction = false,
}: {
  icon: React.ReactNode;
  time: string;
  cna: string;
  body: string;
  accent: string;
  withReaction?: boolean;
}) {
  return (
    <div className="flex gap-3 px-5 py-4">
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: "color-mix(in srgb, " + accent + " 18%, transparent)", color: accent }}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="font-display text-[0.95rem] font-semibold text-[color:var(--color-navy-900)]">
            {cna}
          </p>
          <p className="text-[0.72rem] text-[color:var(--color-warm-muted)]">{time}</p>
        </div>
        <p className="mt-1 text-[0.86rem] leading-snug text-[color:var(--color-warm-ink)]">{body}</p>
        {withReaction && (
          <p className="mt-2 text-[0.72rem] italic text-[color:var(--color-warm-muted)]">
            Sarah reacted with a thank-you.
          </p>
        )}
      </div>
    </div>
  );
}
