"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Eye } from "lucide-react";
import { MarketingNav } from "@/components/marketing-nav";
import { DemoPatientPicker } from "@/components/demo-patient-picker";
import { DemoCnaPortal } from "@/components/demo-cna-portal";
import { demoPatients, findPatient } from "@/data/demo-patients";

// /demo — fully client-side interactive sample. No DB, no auth, no API.
// Three patients, picker on top, the CNA portal surface re-renders below.
// Picking a patient remounts the portal (key={patient.id}) which resets
// local state — that's intentional so each demo flow feels fresh.

export default function DemoPage() {
  const [activeId, setActiveId] = useState<string>(demoPatients[0].id);
  const patient = findPatient(activeId) ?? demoPatients[0];

  return (
    <main className="surface-grain">
      <MarketingNav />

      <section className="px-6 pt-4 md:px-10 md:pt-8">
        <div className="mx-auto max-w-[1240px]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.82rem] text-[color:var(--color-warm-muted)] hover:text-[color:var(--color-navy-900)]"
          >
            <ArrowLeft size={13} /> Back to KairosCare
          </Link>
        </div>
      </section>

      <section className="px-6 pb-8 pt-6 md:px-10 md:pt-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-8 md:grid-cols-[0.56fr_0.44fr] md:items-end md:gap-12">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-warm-hairline)] bg-white/70 px-3 py-1 text-[0.74rem] font-medium tracking-wide uppercase text-[color:var(--color-warm-muted)]">
                <Eye size={12} className="text-[color:var(--color-sky-700)]" />
                Live demo · No data leaves your browser
              </p>
              <h1 className="font-display text-[2.2rem] leading-[1.05] text-[color:var(--color-navy-900)] md:text-[3rem]">
                A morning at <span className="italic text-[color:var(--color-sky-700)]">BrightPath</span>, in your hands.
              </h1>
              <p className="mt-4 max-w-[560px] text-[1rem] leading-relaxed text-[color:var(--color-warm-ink)]">
                Pick one of three sample patients. The CNA portal below populates with that shift&apos;s logs.
                Tap a mood, log a meal, drop a note. It&apos;s the same surface caregivers use in the live app,
                wired to local state for the demo.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-warm-hairline)] bg-white/50 p-5 text-[0.86rem] text-[color:var(--color-warm-ink)]">
              <p className="mb-2 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.16em] text-[color:var(--color-warm-muted)]">
                What you&apos;re looking at
              </p>
              <ul className="space-y-1.5">
                <li>· The CNA&apos;s view of an in-progress visit.</li>
                <li>· Family reactions shown to the agency, never the caregiver.</li>
                <li>· Auto-share, no EVV plugin, sits beside HHAeXchange/WellSky.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-10 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <p className="mb-3 text-[0.74rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
            Step 1 · Pick a sample patient
          </p>
          <DemoPatientPicker active={activeId} onSelect={setActiveId} />
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-[0.74rem] font-medium uppercase tracking-[0.18em] text-[color:var(--color-sky-700)]">
              Step 2 · The CNA portal for {patient.short}
            </p>
            <p className="text-[0.74rem] text-[color:var(--color-warm-muted)]">
              CNA: {patient.cna} · {patient.agency}
            </p>
          </div>
          <DemoCnaPortal key={patient.id} patient={patient} />
        </div>
      </section>

      <section className="border-t border-[color:var(--color-warm-hairline)] bg-[color:var(--color-cream-50)] px-6 py-16 md:px-10">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-[560px]">
            <h2 className="font-display text-[1.6rem] leading-[1.15] text-[color:var(--color-navy-900)] md:text-[2rem]">
              Want this for your agency, with your CNAs?
            </h2>
            <p className="mt-3 text-[0.96rem] text-[color:var(--color-warm-ink)]">
              We onboard caregivers in a 25-minute training and invite families ourselves. Free 90-day pilot.
            </p>
          </div>
          <Link href="/request-demo" className="btn-primary">
            Request a demo
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
