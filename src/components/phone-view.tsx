"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Heart, Send, Sparkles } from "lucide-react";

// Two-phone split-loop demo. Inspired by CompetitorIQ's iMessage phone mockup
// (v3-styles.css .imsg-phone) — same bezel/notch/home-indicator pattern,
// rebuilt with Warm Trust tokens instead of iMessage blue.
//
// LEFT phone = CNA logging an update.
// RIGHT phone = family timeline + thank-you reply.
// Auto-cycles every 4s through 4 frames. IntersectionObserver gates the
// cycle so it only animates when in view. prefers-reduced-motion freezes
// to frame 3 (the "complete" state) so screen readers + reduced-motion
// users still see the full payoff.

type Frame = 0 | 1 | 2 | 3;

export function PhoneView() {
  const [frame, setFrame] = useState<Frame>(0);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Respect reduced motion — snap to the resolved state and stop cycling.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setFrame(3);
    }
    const handler = () => {
      if (mq.matches) setFrame(3);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // Observe scroll-into-view to gate the cycle.
  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    obs.observe(rootRef.current);
    return () => obs.disconnect();
  }, []);

  // Cycle frames. Skip if reduced-motion already pinned to frame 3.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    if (!inView) return;
    const id = window.setInterval(() => {
      setFrame((f) => ((f + 1) % 4) as Frame);
    }, 4000);
    return () => window.clearInterval(id);
  }, [inView]);

  return (
    <div ref={rootRef} className="phone-stage">
      <div className="phone-stage-inner">
        {/* LEFT — CNA logging */}
        <div className="phone-col">
          <p className="phone-col-label">
            <span className="role-badge">CNA</span>
            <span>Maria · 10:29 AM visit</span>
          </p>
          <PhoneFrame tilt="-1.4deg">
            <CnaScreen frame={frame} />
          </PhoneFrame>
        </div>

        {/* connector — only visible md+ */}
        <div aria-hidden className="phone-connector">
          <div className="phone-connector-line" />
          <div className={`phone-connector-pulse ${frame >= 1 ? "is-active" : ""}`}>
            <Sparkles size={11} />
            <span>Shared with family</span>
          </div>
        </div>

        {/* RIGHT — family timeline */}
        <div className="phone-col">
          <p className="phone-col-label">
            <span className="role-badge phone-badge-family">Family</span>
            <span>Sarah · daughter</span>
          </p>
          <PhoneFrame tilt="1.4deg">
            <FamilyScreen frame={frame} />
          </PhoneFrame>
        </div>
      </div>

      <FrameDots frame={frame} />
    </div>
  );
}

function FrameDots({ frame }: { frame: Frame }) {
  return (
    <div className="phone-dots" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`phone-dot ${i === frame ? "is-active" : ""}`} />
      ))}
    </div>
  );
}

function PhoneFrame({
  children,
  tilt,
}: {
  children: React.ReactNode;
  tilt: string;
}) {
  return (
    <div className="phone-frame" style={{ "--phone-tilt": tilt } as React.CSSProperties}>
      <div className="phone-notch" aria-hidden />
      <div className="phone-status">
        <span className="phone-time">9:41</span>
        <span className="phone-status-icons" aria-hidden>
          <span className="phone-signal" />
          <span className="phone-wifi" />
          <span className="phone-battery" />
        </span>
      </div>
      <div className="phone-screen">{children}</div>
      <div className="phone-home" aria-hidden />
    </div>
  );
}

// ---------- CNA screen — frame-driven content ----------

function CnaScreen({ frame }: { frame: Frame }) {
  return (
    <div className="phone-app">
      <header className="phone-app-header">
        <p className="phone-app-eyebrow">Eleanor Williams · in progress</p>
        <p className="phone-app-title">Today&apos;s visit</p>
      </header>

      <div className="phone-app-scroll">
        <LogCard time="10:04 AM" title="Maria checked in" body="Calm and smiling by the window." accent="calm" appear />
        <LogCard time="10:29 AM" title="Breakfast" body="Oatmeal with blueberries. Ate most of it." accent="positive" appear />

        {frame >= 1 && (
          <LogCard
            time="11:48 AM"
            title="End of shift"
            body="Listened to Etta James, short walk. Good spirits. Asked when I'd be back."
            accent="happy"
            appear
            isNew
          />
        )}

        {frame >= 2 && (
          <div className="phone-family-reaction">
            <Heart size={11} fill="currentColor" />
            <span>Sarah sent thanks</span>
          </div>
        )}

        {frame === 3 && (
          <div className="phone-office-note">
            Office acknowledged. Visit auto-archived to BrightPath dashboard.
          </div>
        )}
      </div>

      <footer className="phone-app-bar">
        <span>Tap to log a moment</span>
        <span className="phone-app-bar-cta">
          <Camera size={11} /> Add
        </span>
      </footer>
    </div>
  );
}

// ---------- Family screen — frame-driven content ----------

function FamilyScreen({ frame }: { frame: Frame }) {
  return (
    <div className="phone-app phone-app-family">
      <header className="phone-app-header">
        <p className="phone-app-eyebrow">Mom · Eleanor</p>
        <p className="phone-app-title">Today</p>
      </header>

      <div className="phone-app-scroll">
        <LogCard time="10:04 AM" title="Maria checked in" body="Calm and smiling by the window." accent="calm" appear />
        <LogCard time="10:29 AM" title="Breakfast" body="Oatmeal with blueberries." accent="positive" appear />

        {frame >= 1 && (
          <LogCard
            time="11:48 AM"
            title="End of shift"
            body="Etta James, short walk. Good spirits. Asked when Maria's back."
            accent="happy"
            appear
            isNew
          />
        )}

        {frame >= 2 && (
          <div className="phone-reply-bubble">
            <p className="phone-reply-from">You · 11:50 AM</p>
            <p className="phone-reply-text">Thank you Maria. The music part made my whole day.</p>
          </div>
        )}

        {frame >= 3 && (
          <div className="phone-thank-confirmation">
            <Heart size={11} fill="currentColor" /> Thank-you delivered
          </div>
        )}
      </div>

      <footer className="phone-app-bar phone-app-bar-family">
        <span className="phone-reply-pill">
          Send a thank-you…
          <Send size={11} />
        </span>
      </footer>
    </div>
  );
}

function LogCard({
  time,
  title,
  body,
  accent,
  appear,
  isNew = false,
}: {
  time: string;
  title: string;
  body: string;
  accent: "calm" | "happy" | "positive" | "tired";
  appear: boolean;
  isNew?: boolean;
}) {
  return (
    <div className={`phone-log ${appear ? "phone-log-show" : ""} ${isNew ? "phone-log-new" : ""}`}>
      <div className={`phone-log-dot phone-accent-${accent}`} />
      <div className="min-w-0 flex-1">
        <div className="phone-log-row">
          <p className="phone-log-title">{title}</p>
          <p className="phone-log-time">{time}</p>
        </div>
        <p className="phone-log-body">{body}</p>
      </div>
    </div>
  );
}
