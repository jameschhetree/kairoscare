// Temporary text-only wordmark per the brief. The "K" sits inside a soft
// circular mark (sunrise-over-home motif) — tiny detail, but it carries the
// brand without leaning on a stock logo.

export function WordmarkLight({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden
        className="shrink-0"
      >
        <circle cx="16" cy="16" r="15" fill="#0F2A44" />
        <path d="M11 23 V9 H14 V15 L20 9 H24 L17 16 L24 23 H20 L14 17 V23 Z" fill="#FAF7F2" />
        <circle cx="24.5" cy="10.5" r="2.2" fill="#7DB7E8" />
      </svg>
      <span className="font-display text-[1.05rem] font-semibold tracking-tight text-[color:var(--color-navy-900)]">
        KairosCare
      </span>
    </span>
  );
}

export function WordmarkOnDark({ size = 28 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <circle cx="16" cy="16" r="15" fill="#FAF7F2" />
        <path d="M11 23 V9 H14 V15 L20 9 H24 L17 16 L24 23 H20 L14 17 V23 Z" fill="#0F2A44" />
        <circle cx="24.5" cy="10.5" r="2.2" fill="#7DB7E8" />
      </svg>
      <span className="font-display text-[1.05rem] font-semibold tracking-tight text-[color:var(--color-cream-50)]">
        KairosCare
      </span>
    </span>
  );
}
