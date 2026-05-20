-- KairosCare RLS policies.
-- Run AFTER 0001_rls_helpers.sql.
--
-- Pattern:
--   * KairosCare super-admin bypasses every table.
--   * Agency-scoped tables: row.agencyId must equal jwt.agency_id.
--   * CNAs see only Clients/Visits/CareUpdates linked to their assignments.
--   * Family members see only CareUpdates where visibility=FamilyVisible AND
--     isPublished=true AND the client is linked to them.
--
-- The service role key used by the Next.js server bypasses RLS (Supabase
-- convention) for trusted server-side writes. All client-side reads go
-- through the anon key + per-user JWT.

-- Enable RLS on every PHI-bearing table.
alter table "Organization"           enable row level security;
alter table "User"                   enable row level security;
alter table "UserRoleAssignment"     enable row level security;
alter table "Client"                 enable row level security;
alter table "FamilyMember"           enable row level security;
alter table "ClientFamilyMembership" enable row level security;
alter table "CNAProfile"             enable row level security;
alter table "CNAClientAssignment"    enable row level security;
alter table "Visit"                  enable row level security;
alter table "CareUpdate"             enable row level security;
alter table "Reaction"               enable row level security;
alter table "Comment"                enable row level security;
alter table "Notification"           enable row level security;
alter table "Invite"                 enable row level security;
alter table "SubscriptionPlan"       enable row level security;
alter table "InternalAdminNote"      enable row level security;
alter table "AuditLog"               enable row level security;

-- Organization: agency members see their own org; admins see all.
drop policy if exists organization_select on "Organization";
create policy organization_select on "Organization"
  for select using (
    kairoscare.is_kairos_admin() or id = kairoscare.current_agency_id()
  );

-- User: agency staff see same-agency users; admins see all; users see self.
drop policy if exists user_select on "User";
create policy user_select on "User"
  for select using (
    kairoscare.is_kairos_admin()
    or "id" = kairoscare.current_user_id()
    or ("agencyId" is not null and "agencyId" = kairoscare.current_agency_id())
  );

drop policy if exists user_role_assignment_select on "UserRoleAssignment";
create policy user_role_assignment_select on "UserRoleAssignment"
  for select using (
    kairoscare.is_kairos_admin()
    or "userId" = kairoscare.current_user_id()
    or (
      "scopeAgencyId" is not null
      and "scopeAgencyId" = kairoscare.current_agency_id()
    )
  );

-- Client: agency staff see all in agency. CNAs see only assigned.
-- Family see only clients they are linked to.
drop policy if exists client_select on "Client";
create policy client_select on "Client"
  for select using (
    kairoscare.is_kairos_admin()
    or (
      kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
      and "agencyId" = kairoscare.current_agency_id()
    )
    or (
      kairoscare.current_role() = 'CNA'
      and "agencyId" = kairoscare.current_agency_id()
      and kairoscare.is_cna_assigned(id)
    )
    or (
      kairoscare.current_role() in ('FamilyPrimary', 'FamilyViewer', 'HealthcareProxy')
      and kairoscare.is_family_for_client(id)
    )
  );

drop policy if exists family_member_select on "FamilyMember";
create policy family_member_select on "FamilyMember"
  for select using (
    kairoscare.is_kairos_admin()
    or "userId" = kairoscare.current_user_id()
    or exists (
      select 1 from "ClientFamilyMembership" m
      join "Client" c on c.id = m."clientId"
      where m."familyMemberId" = "FamilyMember".id
        and c."agencyId" = kairoscare.current_agency_id()
        and kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
    )
  );

drop policy if exists client_family_membership_select on "ClientFamilyMembership";
create policy client_family_membership_select on "ClientFamilyMembership"
  for select using (
    kairoscare.is_kairos_admin()
    or "familyMemberId" = kairoscare.current_family_member_id()
    or exists (
      select 1 from "Client" c
      where c.id = "ClientFamilyMembership"."clientId"
        and c."agencyId" = kairoscare.current_agency_id()
        and kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
    )
  );

drop policy if exists cna_profile_select on "CNAProfile";
create policy cna_profile_select on "CNAProfile"
  for select using (
    kairoscare.is_kairos_admin()
    or kairoscare.is_agency_member("agencyId")
    or "userId" = kairoscare.current_user_id()
  );

drop policy if exists cna_client_assignment_select on "CNAClientAssignment";
create policy cna_client_assignment_select on "CNAClientAssignment"
  for select using (
    kairoscare.is_kairos_admin()
    or (
      kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
      and "agencyId" = kairoscare.current_agency_id()
    )
    or (
      kairoscare.current_role() = 'CNA'
      and "cnaId" = kairoscare.current_cna_profile_id()
    )
  );

-- Visit: agency staff see all in agency. CNAs see only their own. Family see
-- only visits for their linked clients.
drop policy if exists visit_select on "Visit";
create policy visit_select on "Visit"
  for select using (
    kairoscare.is_kairos_admin()
    or (
      kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
      and "agencyId" = kairoscare.current_agency_id()
    )
    or (
      kairoscare.current_role() = 'CNA'
      and "cnaId" = kairoscare.current_cna_profile_id()
    )
    or (
      kairoscare.current_role() in ('FamilyPrimary', 'FamilyViewer', 'HealthcareProxy')
      and kairoscare.is_family_for_client("clientId")
    )
  );

-- CareUpdate: the key family-vs-CNA-vs-agency policy.
drop policy if exists care_update_select on "CareUpdate";
create policy care_update_select on "CareUpdate"
  for select using (
    kairoscare.is_kairos_admin()
    or (
      kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
      and "agencyId" = kairoscare.current_agency_id()
    )
    or (
      kairoscare.current_role() = 'CNA'
      and "cnaId" = kairoscare.current_cna_profile_id()
    )
    or (
      kairoscare.current_role() in ('FamilyPrimary', 'FamilyViewer', 'HealthcareProxy')
      and kairoscare.is_family_for_client("clientId")
      and visibility = 'FamilyVisible'
      and "isPublished" = true
    )
  );

drop policy if exists reaction_select on "Reaction";
create policy reaction_select on "Reaction"
  for select using (
    kairoscare.is_kairos_admin()
    or exists (
      select 1 from "CareUpdate" cu
      where cu.id = "Reaction"."careUpdateId"
        and (
          (
            kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
            and cu."agencyId" = kairoscare.current_agency_id()
          )
          or (
            kairoscare.current_role() in ('FamilyPrimary', 'FamilyViewer', 'HealthcareProxy')
            and kairoscare.is_family_for_client(cu."clientId")
          )
        )
    )
  );

drop policy if exists comment_select on "Comment";
create policy comment_select on "Comment"
  for select using (
    kairoscare.is_kairos_admin()
    or exists (
      select 1 from "CareUpdate" cu
      where cu.id = "Comment"."careUpdateId"
        and (
          (
            kairoscare.current_role() in ('AgencyOwner', 'AgencyStaff')
            and cu."agencyId" = kairoscare.current_agency_id()
          )
          or (
            kairoscare.current_role() in ('FamilyPrimary', 'FamilyViewer', 'HealthcareProxy')
            and kairoscare.is_family_for_client(cu."clientId")
          )
        )
    )
  );

drop policy if exists notification_select on "Notification";
create policy notification_select on "Notification"
  for select using (
    kairoscare.is_kairos_admin()
    or "recipientUserId" = kairoscare.current_user_id()
  );

drop policy if exists invite_select on "Invite";
create policy invite_select on "Invite"
  for select using (
    kairoscare.is_kairos_admin()
    or kairoscare.is_agency_staff("agencyId")
  );

drop policy if exists subscription_plan_select on "SubscriptionPlan";
create policy subscription_plan_select on "SubscriptionPlan"
  for select using (
    kairoscare.is_kairos_admin()
    or kairoscare.is_agency_staff("agencyId")
  );

drop policy if exists internal_admin_note_select on "InternalAdminNote";
create policy internal_admin_note_select on "InternalAdminNote"
  for select using (
    kairoscare.is_kairos_admin()
  );

-- Audit log: only KairosCare admins read; agency owners may read their own scope.
drop policy if exists audit_log_select on "AuditLog";
create policy audit_log_select on "AuditLog"
  for select using (
    kairoscare.is_kairos_admin()
    or (
      kairoscare.current_role() = 'AgencyOwner'
      and "agencyId" = kairoscare.current_agency_id()
    )
  );
