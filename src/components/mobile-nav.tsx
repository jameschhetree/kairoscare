"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./app-shell";

function Drawer({
  nav,
  portalLabel,
  pathname,
  onClose,
}: {
  nav: NavItem[];
  portalLabel: string;
  pathname: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div ref={ref} className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <nav className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-xl flex flex-col animate-slide-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-warm-hairline)]">
          <span className="text-[0.74rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-warm-muted)]">
            {portalLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-[color:var(--color-warm-muted)] hover:bg-[color:var(--color-cream-200)]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="4" y1="4" x2="14" y2="14" />
              <line x1="14" y1="4" x2="4" y2="14" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded-[var(--radius-md)] px-4 py-3 text-[0.95rem] ${
                  active
                    ? "bg-[color:var(--color-cream-200)] text-[color:var(--color-navy-900)] font-medium"
                    : "text-[color:var(--color-warm-ink)] hover:bg-[color:var(--color-cream-200)] hover:text-[color:var(--color-navy-900)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>,
    document.body
  );
}

export function MobileNav({ nav, portalLabel }: { nav: NavItem[]; portalLabel: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="md:hidden flex items-center justify-center w-10 h-10 -ml-2 rounded-[var(--radius-md)] text-[color:var(--color-navy-900)] hover:bg-[color:var(--color-cream-200)]"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <line x1="3" y1="5" x2="17" y2="5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="15" x2="17" y2="15" />
        </svg>
      </button>

      {open && (
        <Drawer
          nav={nav}
          portalLabel={portalLabel}
          pathname={pathname}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
