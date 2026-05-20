-- KairosCare RLS helper functions.
--
-- Apply this to the Supabase Postgres AFTER `prisma migrate deploy`.
-- These functions read claims out of the Supabase Auth JWT and are used by
-- every row-level policy in 0002_rls_policies.sql.
--
-- The JWT shape we expect (set via Supabase Auth custom claims hook or by
-- writing them to auth.users.raw_app_meta_data at sign-up / role grant time):
--
--   {
--     "sub": "<auth.users.id>",
--     "agency_id": "<Organization.id or null>",
--     "kairos_role": "KairosSuperAdmin | KairosSupportAdmin | AgencyOwner | AgencyStaff | CNA | FamilyPrimary | FamilyViewer | HealthcareProxy",
--     "cna_profile_id": "<CNAProfile.id or null>",
--     "family_member_id": "<FamilyMember.id or null>"
--   }

create schema if not exists kairoscare;

create or replace function kairoscare.current_user_id()
returns text
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub',
    nullif(current_setting('request.jwt.claim.sub', true), '')
  );
$$;

create or replace function kairoscare.current_agency_id()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'agency_id';
$$;

create or replace function kairoscare.current_role()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'kairos_role';
$$;

create or replace function kairoscare.current_cna_profile_id()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'cna_profile_id';
$$;

create or replace function kairoscare.current_family_member_id()
returns text
language sql stable
as $$
  select nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'family_member_id';
$$;

create or replace function kairoscare.is_kairos_admin()
returns boolean
language sql stable
as $$
  select kairoscare.current_role() in ('KairosSuperAdmin', 'KairosSupportAdmin');
$$;

create or replace function kairoscare.is_agency_member(target_agency_id text)
returns boolean
language sql stable
as $$
  select kairoscare.is_kairos_admin()
      or (kairoscare.current_agency_id() is not null
          and kairoscare.current_agency_id() = target_agency_id);
$$;

create or replace function kairoscare.is_agency_staff(target_agency_id text)
returns boolean
language sql stable
as $$
  select kairoscare.is_kairos_admin()
      or (kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
          and kairoscare.current_agency_id() = target_agency_id);
$$;

create or replace function kairoscare.is_cna_assigned(target_client_id text)
returns boolean
language sql stable
as $$
  select exists (
    select 1
    from "CNAClientAssignment" a
    where a."clientId" = target_client_id
      and a."cnaId" = kairoscare.current_cna_profile_id()
      and (a."endDate" is null or a."endDate" > now())
  );
$$;

create or replace function kairoscare.is_family_for_client(target_client_id text)
returns boolean
language sql stable
as $$
  select exists (
    select 1
    from "ClientFamilyMembership" m
    where m."clientId" = target_client_id
      and m."familyMemberId" = kairoscare.current_family_member_id()
  );
$$;
