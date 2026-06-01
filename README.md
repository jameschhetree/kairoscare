# KairosCare

Real-time care visibility for home care agencies. A B2B SaaS layer that sits alongside scheduling / EVV / payroll systems and gives families a warm, photo-rich timeline of their loved one's visits.

> Live: <https://kairoscare.vercel.app>
> Status: **Phase 1 of 6 — scaffold, auth, layout, roles, database schema, seed data.**
> Phases 2–6 (CNA visit-log flow, family timeline, agency dashboard, admin backend, polish) ship as subsequent dispatches.

---

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 App Router (Turbopack) | React 19, TypeScript strict |
| Styling | Tailwind CSS v4 | `@theme` tokens in `globals.css` |
| Database | Postgres + Prisma 7 | local Postgres for dev, Supabase Postgres for prod |
| Auth | **Supabase Auth** (Phase 2) | Phase 1 uses a signed-cookie shim — see "Auth in Phase 1" below |
| Storage | Supabase Storage (Phase 2) | encrypted bucket, signed URLs only |
| Email | Resend | shared workspace key |
| Hosting | Vercel | `iad1` region, project `kairoscare` |
| i18n | next-intl 4 (scaffolded) | EN + ES dictionaries shipped; locale routing in Phase 2 |
| Icons | lucide-react | |
| PWA | manifest + sw stub | offline strategy in Phase 2 |

## Brand — Warm Trust

Tokens live in `src/app/globals.css`.

```
navy-900    #0F2A44   primary
sky-500     #7DB7E8   accent
cream-100   #FAF7F2   surface
positive    #5FA978   gentle green

mood-happy   #5FA978   mood-calm    #7DB7E8   mood-tired  #C9A146
mood-anxious #E0846B   mood-unwell  #B85450
```

Fonts: **Inter Tight** (display) + **Inter** (body), via `next/font/google`.

---

## Local setup

Prereqs: Node 20+, Postgres 17 running locally.

```bash
# 1. Install deps (includes optional native binaries for Tailwind)
npm install --include=optional

# 2. Copy env template; the defaults already point at a local Postgres `kairoscare` db
cp .env.example .env.local
# Edit DATABASE_URL if your local Postgres user/port differs.

# 3. Create the database
createdb kairoscare

# 4. Run migrations + RLS + seed
npm run db:deploy
npm run rls:apply
npm run db:seed

# 5. Start dev server
npm run dev
# → http://localhost:3000
```

## Demo credentials

Every seeded user has the password `Demo2026!` (rotate before any real pilot).

| Email | Role | Lands on |
| --- | --- | --- |
| `maria@brightpath.demo` | Caregiver (CNA) | `/cna` |
| `sarah.williams@demo.com` | Family — primary contact for Eleanor | `/family` |
| `owner@brightpath.demo` | Agency owner — BrightPath Home Care | `/agency` |
| `admin@kairoscare.com` | KairosCare super-admin | `/admin` |

Additional seeded accounts: `angela@brightpath.demo`, `denise@brightpath.demo`, `david.williams@demo.com` (viewer), `lisa.johnson@demo.com`, `kevin.chen@demo.com`.

---

## Routes (22 total)

```
Public
  /                       marketing landing — full polish, real copy
  /login                  Supabase Auth shim (Phase 2 swap)
  /request-demo           form → AuditLog + Resend if RESEND_API_KEY set

CNA portal (role-gated)
  /cna                    today
  /cna/visits             visit list (Phase 2 logging UI)
  /cna/visits/[id]        single visit
  /cna/history            past visits

Family portal (role-gated)
  /family                 overview
  /family/timeline        (Phase 3 timeline cards)
  /family/invite          (Phase 3 invite flow)
  /family/settings        (Phase 3 preferences)

Agency portal (role-gated)
  /agency                 dashboard with live counts
  /agency/clients         list
  /agency/clients/[id]    profile detail (PHI read → audit)
  /agency/cnas            caregivers
  /agency/families        family seats
  /agency/assignments     (Phase 4 schedule lite)
  /agency/settings        agency profile + auto-publish toggle state

KairosCare admin (role-gated)
  /admin                  overview
  /admin/agencies         every agency
  /admin/users            user search
  /admin/audit            last 60 audit rows
  /admin/support          (Phase 5 tooling)
```

---

## Database schema (text diagram)

```
Organization ───┬─< User ─────────< UserRoleAssignment
                ├─< Client ─────────< ClientFamilyMembership >── FamilyMember
                │   │                                                │
                │   ├─< CNAClientAssignment >── CNAProfile           │
                │   ├─< Visit >── CareUpdate ───< Reaction ──────────┘
                │   │                       \──< Comment
                │   └─< (CareUpdate, Visit cascade on delete)
                ├─< CNAProfile
                ├─< Invite
                ├─< SubscriptionPlan
                ├─< InternalAdminNote
                └─< AuditLog            (PHI-mandated)

Notification ─── User  (recipient)
AuditLog     ─── User (actor) + Organization (scope)
```

17 application tables. Enums for `UserRole`, `VisitStatus`, `CareUpdateType`, `Mood`, `MealStatus`, `ActivityType`, `CareUpdateVisibility`, `ReactionType`, `InviteStatus`, `SubscriptionTier`, `SubscriptionStatus`, `FamilyRelationshipRole`, `Language`. Full source at `prisma/schema.prisma`.

## Row Level Security

Helpers + policies live in `supabase/migrations/0001_rls_helpers.sql` and `0002_rls_policies.sql`. Apply with:

```bash
npm run rls:apply
```

Policies read claims from the Supabase Auth JWT (`sub`, `agency_id`, `kairos_role`, `cna_profile_id`, `family_member_id`).

| Role | Sees `Client` rows | Notes |
| --- | --- | --- |
| KairosSuperAdmin | every row | bypass via `kairoscare.is_kairos_admin()` |
| AgencyOwner / AgencyStaff | agency-scoped | `agencyId = jwt.agency_id` |
| CNA | only assigned clients | + `CNAClientAssignment` join |
| Family\* | only linked clients | + `ClientFamilyMembership` join |
| Anonymous | none | denies cleanly |

`CareUpdate` is the most-restricted table: family roles additionally require `visibility = 'FamilyVisible' AND isPublished = true`.

Server-side writes via the Prisma client use the Postgres role (or Supabase service role key in prod) which bypasses RLS — every server-side write writes one `AuditLog` row.

---

## Auth in Phase 1

`src/lib/session.ts` ships a signed-cookie shim:

1. Login POSTs to a Server Action.
2. Action looks up the user, finds the demo `bcrypt` hash stored in `AuditLog.payload` from the seed run, verifies, sets a signed cookie.
3. Every authed page calls `requirePortal('cna' | 'family' | 'agency' | 'admin')`.

Phase 2 replaces the Server Action body with a Supabase Auth call. **The `requirePortal` / `getSessionUser` boundary stays identical.** Every page in the codebase already reads through that boundary.

The shim is intentionally narrow: no signup flow, no password reset, no MFA — those land in Phase 2 with Supabase Auth, MFA-ready as the brief requires.

## Audit logging

`src/lib/audit.ts → recordAudit()` is the single hand-off. Called from:

- Login (`auth.login`)
- Demo-request submission (`demo_request.submitted`)
- Agency client detail view (`client.viewed`)
- Seed (`seed.user.created`, `seed.client.created`, `seed.care_update.created`, `seed.visit.created`, `seed.reaction.created`)

Phase 2+ wires it into every CareUpdate, photo view, and Storage signed-URL mint.

---

## Deploy

```bash
vercel --prod --yes
```

Project `kairoscare` is already linked. Required env vars (set via `vercel env add` or the dashboard):

```
DATABASE_URL                       postgres pooler URL
DIRECT_URL                         postgres direct URL (for migrations)
NEXT_PUBLIC_SUPABASE_URL           https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY                     (Resend workspace, shared with other OC projects)
RESEND_FROM_EMAIL
NEXT_PUBLIC_APP_URL                https://kairoscare.vercel.app
SESSION_SECRET                     32+ char random
```

### Connecting Supabase

Phase 1 was scaffolded against a local Postgres 17 so the schema, seeds, RLS, and audit pipeline are all verifiable today. To go fully live:

1. From the Vercel project → **Storage → Add Supabase**. (One-click install via the Vercel marketplace integration.)
2. Pull the env: `vercel env pull`.
3. Update the local `DATABASE_URL` to the Supabase pooler URL, then `npm run db:deploy && npm run rls:apply && npm run db:seed`.
4. Redeploy.

---

## Known limitations (Phase 1 scope, called out honestly)

1. **GitHub remote not created.** The local `gh` CLI is logged out; I committed the repo locally and deployed via `vercel --prod` directly. To push to GitHub, run `gh auth login` then `gh repo create jameschhetree/kairoscare --private --source=. --push`.
2. **Supabase project not auto-provisioned.** No stored Supabase access token, so the prod database is a placeholder env var. The marketing pages (`/`, `/login`, `/request-demo`) work on `kairoscare.vercel.app` today; authed portals require the Supabase connection step above.
3. **Auth shim, not Supabase Auth yet.** Phase 1 uses the cookie shim described above so the four demo credentials work end-to-end against a real database. Phase 2 swaps in Supabase Auth at the `session.ts` boundary.
4. **Photo upload UI deferred to Phase 2.** Schema (`CareUpdate.photoStoragePath`) is in place, encrypted Storage bucket + signed-URL mint live in `lib/supabase.ts` placeholder.
5. **Notifications**: `Notification` table seeded; UI delivery (in-app + push) lands in Phase 3.
6. **i18n is scaffolded, not wired** — EN + ES dictionaries are committed, full `useTranslations()` integration into the CNA flow lands in Phase 2.
7. **No tests yet.** Phase 1 prioritized verified end-to-end manual flows over Vitest scaffolding; we'll add Playwright + Vitest in Phase 2 once the CNA visit-log surface is real.

## Suggested Phase 2 priorities

In order:

1. **Supabase Auth wiring** at the `session.ts` boundary. Custom-claims hook to inject `agency_id`, `kairos_role`, `cna_profile_id`, `family_member_id` into the JWT.
2. **CNA visit-log flow** at `/cna/visits/[id]`. One-tap mood + meal + activity + photo + end-of-shift, in under 30 seconds per the brief. Spanish toggle on this surface specifically.
3. **Encrypted Storage bucket + signed URL helper** in `lib/storage.ts`. Audit on every signed URL minted.
4. **`isPublished` toggle UX**. Agency setting + per-update flip when auto-publish is off.
5. **PWA install prompt** + offline shell for the CNA portal.

## Founder questions still open

The 12 product questions from the brief are answered (per the dispatch). The build questions that emerged during Phase 1:

1. **Storage bucket policy**: do we mint signed URLs for the agency view too, or only for family? (Phase 2 default: same signed-URL helper for both; agency staff signing happens via service-role key path.)
2. **Custom claims hook**: do we want a Postgres function or an Edge function to inject `cna_profile_id` / `family_member_id` into the JWT at sign-in? (Default: Postgres function for simplicity, port to Edge if it gets gnarly.)
3. **Domain**: keep `kairoscare.vercel.app` for the pilot, or buy `kairoscare.com` and DNS it to Vercel?

---

## Layout

```
src/
  app/
    page.tsx                   marketing landing (full polish, real copy)
    layout.tsx                 root layout (Inter Tight + Inter fonts, manifest)
    globals.css                Warm Trust tokens
    login/                     server-action login
    request-demo/              server-action demo request
    cna/                       caregiver portal (4 routes)
    family/                    family portal (4 routes)
    agency/                    agency portal (7 routes)
    admin/                     KairosCare internal (5 routes)
  components/
    app-shell.tsx              shared shell w/ role badge + nav
    marketing-nav.tsx
    timeline-preview.tsx       sample family timeline on the marketing page
    wordmark.tsx               text-only KairosCare mark (light + dark variants)
  lib/
    prisma.ts                  Prisma client w/ pg driver adapter
    supabase.ts                browser + server Supabase helpers
    session.ts                 Phase-1 signed-cookie shim
    roles.ts                   UserRole → portal mapping
    audit.ts                   recordAudit() — single hand-off
    guard.ts                   requirePortal()
  i18n.ts                      locale loader scaffold
  messages/
    en.json
    es.json
prisma/
  schema.prisma                17 tables + 12 enums
  seed.ts                      BrightPath + 3 CNAs + 3 clients + sample visit
  migrations/
supabase/
  migrations/
    0001_rls_helpers.sql       jwt-claim accessors
    0002_rls_policies.sql      per-table policies
public/
  manifest.webmanifest
  icon-192.svg / icon-512.svg
  sw.js                        PWA stub
```

## License

Proprietary — KairosCare. All rights reserved.

<!-- GitHub mirror connected 2026-06-01T20:35:18Z -->
