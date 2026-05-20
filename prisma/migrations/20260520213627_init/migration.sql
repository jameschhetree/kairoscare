-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ES');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('KairosSuperAdmin', 'KairosSupportAdmin', 'AgencyOwner', 'AgencyStaff', 'CNA', 'FamilyPrimary', 'FamilyViewer', 'HealthcareProxy');

-- CreateEnum
CREATE TYPE "FamilyRelationshipRole" AS ENUM ('PrimaryContact', 'Viewer', 'HealthcareProxy', 'BillingContact');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed', 'Missed', 'Cancelled');

-- CreateEnum
CREATE TYPE "CareUpdateType" AS ENUM ('CheckIn', 'Meal', 'Mood', 'Activity', 'Note', 'Photo', 'EndOfShift');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('Happy', 'Calm', 'Tired', 'Anxious', 'Unwell', 'Other');

-- CreateEnum
CREATE TYPE "MealStatus" AS ENUM ('AteWell', 'AteSome', 'RefusedMeal', 'Hydrated', 'NeedsFollowUp');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('Conversation', 'Walk', 'LightExercise', 'HygieneSupport', 'MealPrep', 'MedicationReminder', 'Errands', 'Companionship', 'Other');

-- CreateEnum
CREATE TYPE "CareUpdateVisibility" AS ENUM ('FamilyVisible', 'AgencyOnly');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('ThankYou', 'Heart', 'Smile');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('Pending', 'Accepted', 'Expired', 'Revoked');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('Pilot', 'Starter', 'Growth');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('Trial', 'Active', 'Suspended', 'Cancelled');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryContact" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "defaultNotificationSettings" JSONB,
    "autoPublishCnaUpdates" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
    "agencyId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "scopeAgencyId" TEXT,
    "scopeClientId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "careNotes" TEXT,
    "emergencyContact" TEXT,
    "preferredLanguage" "Language" NOT NULL DEFAULT 'EN',
    "state" TEXT,
    "internalNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "relationshipToClient" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientFamilyMembership" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "familyMemberId" TEXT NOT NULL,
    "role" "FamilyRelationshipRole" NOT NULL,
    "canViewAllUpdates" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientFamilyMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CNAProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "certifications" TEXT[],
    "languagesSpoken" "Language"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CNAProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CNAClientAssignment" (
    "id" TEXT NOT NULL,
    "cnaId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "CNAClientAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "cnaId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "scheduledStart" TIMESTAMP(3) NOT NULL,
    "scheduledEnd" TIMESTAMP(3) NOT NULL,
    "actualStart" TIMESTAMP(3),
    "actualEnd" TIMESTAMP(3),
    "status" "VisitStatus" NOT NULL DEFAULT 'NotStarted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareUpdate" (
    "id" TEXT NOT NULL,
    "visitId" TEXT,
    "clientId" TEXT NOT NULL,
    "cnaId" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "updateType" "CareUpdateType" NOT NULL,
    "mood" "Mood",
    "mealStatus" "MealStatus",
    "activityType" "ActivityType",
    "note" TEXT,
    "photoStoragePath" TEXT,
    "visibility" "CareUpdateVisibility" NOT NULL DEFAULT 'FamilyVisible',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CareUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL,
    "careUpdateId" TEXT NOT NULL,
    "familyMemberId" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "careUpdateId" TEXT NOT NULL,
    "familyMemberId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "agencyEscalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'Pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'Pilot',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'Trial',
    "monthlyRate" INTEGER NOT NULL DEFAULT 0,
    "activeClientCap" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalAdminNote" (
    "id" TEXT NOT NULL,
    "agencyId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalAdminNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "agencyId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "payload" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_agencyId_idx" ON "User"("agencyId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_userId_idx" ON "UserRoleAssignment"("userId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_role_idx" ON "UserRoleAssignment"("role");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_role_scopeAgencyId_scopeClientId_key" ON "UserRoleAssignment"("userId", "role", "scopeAgencyId", "scopeClientId");

-- CreateIndex
CREATE INDEX "Client_agencyId_idx" ON "Client"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_userId_key" ON "FamilyMember"("userId");

-- CreateIndex
CREATE INDEX "ClientFamilyMembership_clientId_idx" ON "ClientFamilyMembership"("clientId");

-- CreateIndex
CREATE INDEX "ClientFamilyMembership_familyMemberId_idx" ON "ClientFamilyMembership"("familyMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientFamilyMembership_clientId_familyMemberId_key" ON "ClientFamilyMembership"("clientId", "familyMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "CNAProfile_userId_key" ON "CNAProfile"("userId");

-- CreateIndex
CREATE INDEX "CNAProfile_agencyId_idx" ON "CNAProfile"("agencyId");

-- CreateIndex
CREATE INDEX "CNAClientAssignment_cnaId_idx" ON "CNAClientAssignment"("cnaId");

-- CreateIndex
CREATE INDEX "CNAClientAssignment_clientId_idx" ON "CNAClientAssignment"("clientId");

-- CreateIndex
CREATE INDEX "CNAClientAssignment_agencyId_idx" ON "CNAClientAssignment"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "CNAClientAssignment_cnaId_clientId_startDate_key" ON "CNAClientAssignment"("cnaId", "clientId", "startDate");

-- CreateIndex
CREATE INDEX "Visit_clientId_idx" ON "Visit"("clientId");

-- CreateIndex
CREATE INDEX "Visit_cnaId_idx" ON "Visit"("cnaId");

-- CreateIndex
CREATE INDEX "Visit_agencyId_idx" ON "Visit"("agencyId");

-- CreateIndex
CREATE INDEX "Visit_scheduledStart_idx" ON "Visit"("scheduledStart");

-- CreateIndex
CREATE INDEX "CareUpdate_clientId_idx" ON "CareUpdate"("clientId");

-- CreateIndex
CREATE INDEX "CareUpdate_cnaId_idx" ON "CareUpdate"("cnaId");

-- CreateIndex
CREATE INDEX "CareUpdate_agencyId_idx" ON "CareUpdate"("agencyId");

-- CreateIndex
CREATE INDEX "CareUpdate_visitId_idx" ON "CareUpdate"("visitId");

-- CreateIndex
CREATE INDEX "CareUpdate_timestamp_idx" ON "CareUpdate"("timestamp");

-- CreateIndex
CREATE INDEX "Reaction_careUpdateId_idx" ON "Reaction"("careUpdateId");

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_careUpdateId_familyMemberId_type_key" ON "Reaction"("careUpdateId", "familyMemberId", "type");

-- CreateIndex
CREATE INDEX "Comment_careUpdateId_idx" ON "Comment"("careUpdateId");

-- CreateIndex
CREATE INDEX "Notification_recipientUserId_idx" ON "Notification"("recipientUserId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_agencyId_idx" ON "Invite"("agencyId");

-- CreateIndex
CREATE INDEX "Invite_email_idx" ON "Invite"("email");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_agencyId_idx" ON "SubscriptionPlan"("agencyId");

-- CreateIndex
CREATE INDEX "InternalAdminNote_agencyId_idx" ON "InternalAdminNote"("agencyId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_agencyId_idx" ON "AuditLog"("agencyId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFamilyMembership" ADD CONSTRAINT "ClientFamilyMembership_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientFamilyMembership" ADD CONSTRAINT "ClientFamilyMembership_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CNAProfile" ADD CONSTRAINT "CNAProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CNAProfile" ADD CONSTRAINT "CNAProfile_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CNAClientAssignment" ADD CONSTRAINT "CNAClientAssignment_cnaId_fkey" FOREIGN KEY ("cnaId") REFERENCES "CNAProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CNAClientAssignment" ADD CONSTRAINT "CNAClientAssignment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CNAClientAssignment" ADD CONSTRAINT "CNAClientAssignment_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_cnaId_fkey" FOREIGN KEY ("cnaId") REFERENCES "CNAProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareUpdate" ADD CONSTRAINT "CareUpdate_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareUpdate" ADD CONSTRAINT "CareUpdate_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareUpdate" ADD CONSTRAINT "CareUpdate_cnaId_fkey" FOREIGN KEY ("cnaId") REFERENCES "CNAProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareUpdate" ADD CONSTRAINT "CareUpdate_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_careUpdateId_fkey" FOREIGN KEY ("careUpdateId") REFERENCES "CareUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_careUpdateId_fkey" FOREIGN KEY ("careUpdateId") REFERENCES "CareUpdate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalAdminNote" ADD CONSTRAINT "InternalAdminNote_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalAdminNote" ADD CONSTRAINT "InternalAdminNote_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
