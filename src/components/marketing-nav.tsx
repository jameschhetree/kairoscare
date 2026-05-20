import Link from "next/link";
import { WordmarkLight } from "./wordmark";

export function MarketingNav() {
  return (
    <header className="relative z-10">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <WordmarkLight />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-[color:var(--color-warm-muted)] md:flex">
          <a href="#how-it-works" className="hover:text-[color:var(--color-navy-900)]">
            How it works
          </a>
          <a href="#for-agencies" className="hover:text-[color:var(--color-navy-900)]">
            For agencies
          </a>
          <a href="#families" className="hover:text-[color:var(--color-navy-900)]">
            For families
          </a>
          <a href="#compliance" className="hover:text-[color:var(--color-navy-900)]">
            Compliance
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[color:var(--color-navy-900)] hover:underline">
            Log in
          </Link>
          <Link href="/request-demo" className="btn-primary text-sm">
            Request demo
          </Link>
        </div>
      </div>
    </header>
  );
}
