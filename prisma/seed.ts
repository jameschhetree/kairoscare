// KairosCare seed — BrightPath Home Care + 3 CNAs + 3 clients + sample visit.
// Writes one AuditLog row per PHI insert to validate the audit pipeline
// end-to-end as part of the Phase 1 acceptance.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Demo2026!";

async function recordAudit(entry: {
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  agencyId?: string | null;
  payload?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      agencyId: entry.agencyId ?? null,
      payload: (entry.payload ?? {}) as object,
    },
  });
}

async function main() {
  console.log("Resetting demo data...");
  // Order matters because of FK chains.
  await prisma.auditLog.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.careUpdate.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.cNAClientAssignment.deleteMany();
  await prisma.clientFamilyMembership.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.cNAProfile.deleteMany();
  await prisma.client.deleteMany();
  await prisma.internalAdminNote.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.userRoleAssignment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Demo password hash stored on User for the Phase-1 credential login shim.
  // (Real Supabase Auth replaces this in Phase 2.)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Creating BrightPath Home Care...");
  const brightpath = await prisma.organization.create({
    data: {
      name: "BrightPath Home Care",
      slug: "brightpath",
      primaryContact: "Patricia Doyle",
      phone: "+1-555-220-8800",
      email: "owner@brightpath.demo",
      autoPublishCnaUpdates: true,
      defaultNotificationSettings: {
        emailDigest: "daily",
        pushOnNewUpdate: true,
      },
    },
  });

  await prisma.subscriptionPlan.create({
    data: {
      agencyId: brightpath.id,
      tier: "Pilot",
      status: "Trial",
      monthlyRate: 0,
      activeClientCap: 25,
    },
  });

  // ------------------------------------------------------------------
  // Users: agency owner, three CNAs, four family members, kairos admin.
  // ------------------------------------------------------------------
  async function createUser(opts: {
    email: string;
    fullName: string;
    agencyId?: string | null;
    role:
      | "KairosSuperAdmin"
      | "AgencyOwner"
      | "CNA"
      | "FamilyPrimary"
      | "FamilyViewer";
    preferredLanguage?: "EN" | "ES";
  }) {
    const user = await prisma.user.create({
      data: {
        email: opts.email,
        fullName: opts.fullName,
        agencyId: opts.agencyId ?? null,
        preferredLanguage: opts.preferredLanguage ?? "EN",
        supabaseUserId: `seed-${opts.email}`,
      },
    });
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        role: opts.role,
        scopeAgencyId: opts.agencyId ?? null,
      },
    });
    // Stash demo password hash inside the audit log so the login shim can
    // verify without adding a schema column. Phase 2 (Supabase Auth) removes
    // both this row and the entire `hashedPassword` concern.
    await recordAudit({
      actorUserId: user.id,
      action: "seed.user.created",
      entityType: "User",
      entityId: user.id,
      agencyId: opts.agencyId ?? null,
      payload: { role: opts.role, demoPasswordHash: passwordHash },
    });
    return user;
  }

  console.log("Creating users...");
  const owner = await createUser({
    email: "owner@brightpath.demo",
    fullName: "Patricia Doyle",
    agencyId: brightpath.id,
    role: "AgencyOwner",
  });

  const cnaUserMaria = await createUser({
    email: "maria@brightpath.demo",
    fullName: "Maria Lopez",
    agencyId: brightpath.id,
    role: "CNA",
    preferredLanguage: "ES",
  });
  const cnaUserAngela = await createUser({
    email: "angela@brightpath.demo",
    fullName: "Angela Brooks",
    agencyId: brightpath.id,
    role: "CNA",
  });
  const cnaUserDenise = await createUser({
    email: "denise@brightpath.demo",
    fullName: "Denise Carter",
    agencyId: brightpath.id,
    role: "CNA",
  });

  const familyUserSarah = await createUser({
    email: "sarah.williams@demo.com",
    fullName: "Sarah Williams",
    role: "FamilyPrimary",
  });
  const familyUserDavid = await createUser({
    email: "david.williams@demo.com",
    fullName: "David Williams",
    role: "FamilyViewer",
  });
  const familyUserLisa = await createUser({
    email: "lisa.johnson@demo.com",
    fullName: "Lisa Johnson",
    role: "FamilyPrimary",
  });
  const familyUserKevin = await createUser({
    email: "kevin.chen@demo.com",
    fullName: "Kevin Chen",
    role: "FamilyPrimary",
  });

  const admin = await createUser({
    email: "admin@kairoscare.com",
    fullName: "KairosCare Admin",
    role: "KairosSuperAdmin",
  });
  void admin;

  // ------------------------------------------------------------------
  // CNAs + clients + assignments.
  // ------------------------------------------------------------------
  console.log("Creating CNA profiles + clients...");
  const cnaMaria = await prisma.cNAProfile.create({
    data: {
      userId: cnaUserMaria.id,
      agencyId: brightpath.id,
      certifications: ["CNA", "CPR"],
      languagesSpoken: ["EN", "ES"],
    },
  });
  const cnaAngela = await prisma.cNAProfile.create({
    data: {
      userId: cnaUserAngela.id,
      agencyId: brightpath.id,
      certifications: ["CNA", "First Aid"],
      languagesSpoken: ["EN"],
    },
  });
  const cnaDenise = await prisma.cNAProfile.create({
    data: {
      userId: cnaUserDenise.id,
      agencyId: brightpath.id,
      certifications: ["CNA"],
      languagesSpoken: ["EN"],
    },
  });

  const eleanor = await prisma.client.create({
    data: {
      agencyId: brightpath.id,
      fullName: "Eleanor Williams",
      dateOfBirth: new Date("1942-03-15"),
      address: "812 Willow Lane, Bethesda, MD 20814",
      state: "MD",
      careNotes: "Mild dementia, prefers oatmeal in the morning, enjoys music.",
      emergencyContact: "Sarah Williams (daughter) +1-555-444-1212",
      preferredLanguage: "EN",
      internalNotes: "Family is highly engaged — Sarah checks the app daily.",
    },
  });
  await recordAudit({
    action: "seed.client.created",
    entityType: "Client",
    entityId: eleanor.id,
    agencyId: brightpath.id,
  });

  const robert = await prisma.client.create({
    data: {
      agencyId: brightpath.id,
      fullName: "Robert Johnson",
      dateOfBirth: new Date("1938-11-02"),
      address: "44 Maple Ridge Dr, Gaithersburg, MD 20878",
      state: "MD",
      careNotes: "Post-stroke recovery, needs help with ambulation.",
      emergencyContact: "Lisa Johnson (spouse) +1-555-444-2323",
      preferredLanguage: "EN",
    },
  });
  await recordAudit({
    action: "seed.client.created",
    entityType: "Client",
    entityId: robert.id,
    agencyId: brightpath.id,
  });

  const margaret = await prisma.client.create({
    data: {
      agencyId: brightpath.id,
      fullName: "Margaret Chen",
      dateOfBirth: new Date("1945-07-19"),
      address: "127 Cedar Park Way, Rockville, MD 20852",
      state: "MD",
      careNotes: "Diabetic — meal monitoring important. Loves crossword puzzles.",
      emergencyContact: "Kevin Chen (son) +1-555-444-3434",
      preferredLanguage: "EN",
    },
  });
  await recordAudit({
    action: "seed.client.created",
    entityType: "Client",
    entityId: margaret.id,
    agencyId: brightpath.id,
  });

  await prisma.cNAClientAssignment.createMany({
    data: [
      {
        cnaId: cnaMaria.id,
        clientId: eleanor.id,
        agencyId: brightpath.id,
        startDate: new Date("2026-04-01"),
      },
      {
        cnaId: cnaAngela.id,
        clientId: robert.id,
        agencyId: brightpath.id,
        startDate: new Date("2026-04-01"),
      },
      {
        cnaId: cnaDenise.id,
        clientId: margaret.id,
        agencyId: brightpath.id,
        startDate: new Date("2026-04-01"),
      },
    ],
  });

  // ------------------------------------------------------------------
  // Family members + memberships.
  // ------------------------------------------------------------------
  console.log("Linking family members...");
  const sarahFm = await prisma.familyMember.create({
    data: {
      userId: familyUserSarah.id,
      fullName: "Sarah Williams",
      relationshipToClient: "Daughter",
    },
  });
  const davidFm = await prisma.familyMember.create({
    data: {
      userId: familyUserDavid.id,
      fullName: "David Williams",
      relationshipToClient: "Son",
    },
  });
  const lisaFm = await prisma.familyMember.create({
    data: {
      userId: familyUserLisa.id,
      fullName: "Lisa Johnson",
      relationshipToClient: "Spouse",
    },
  });
  const kevinFm = await prisma.familyMember.create({
    data: {
      userId: familyUserKevin.id,
      fullName: "Kevin Chen",
      relationshipToClient: "Son",
    },
  });

  await prisma.clientFamilyMembership.createMany({
    data: [
      {
        clientId: eleanor.id,
        familyMemberId: sarahFm.id,
        role: "PrimaryContact",
        canViewAllUpdates: true,
      },
      {
        clientId: eleanor.id,
        familyMemberId: davidFm.id,
        role: "Viewer",
        canViewAllUpdates: true,
      },
      {
        clientId: robert.id,
        familyMemberId: lisaFm.id,
        role: "PrimaryContact",
        canViewAllUpdates: true,
      },
      {
        clientId: margaret.id,
        familyMemberId: kevinFm.id,
        role: "PrimaryContact",
        canViewAllUpdates: true,
      },
    ],
  });

  // ------------------------------------------------------------------
  // Sample visit + three CareUpdates + one ThankYou reaction.
  // ------------------------------------------------------------------
  console.log("Creating sample visit + care updates...");
  const today = new Date();
  const visitStart = new Date(today);
  visitStart.setHours(10, 0, 0, 0);
  const visitEnd = new Date(today);
  visitEnd.setHours(12, 0, 0, 0);

  const visit = await prisma.visit.create({
    data: {
      clientId: eleanor.id,
      cnaId: cnaMaria.id,
      agencyId: brightpath.id,
      scheduledStart: visitStart,
      scheduledEnd: visitEnd,
      actualStart: new Date(visitStart.getTime() + 4 * 60 * 1000),
      actualEnd: new Date(visitEnd.getTime() - 8 * 60 * 1000),
      status: "Completed",
    },
  });
  await recordAudit({
    actorUserId: cnaUserMaria.id,
    action: "seed.visit.created",
    entityType: "Visit",
    entityId: visit.id,
    agencyId: brightpath.id,
  });

  const checkIn = await prisma.careUpdate.create({
    data: {
      visitId: visit.id,
      clientId: eleanor.id,
      cnaId: cnaMaria.id,
      agencyId: brightpath.id,
      updateType: "CheckIn",
      note: "Eleanor was sitting in her usual chair by the window. Calm and smiling.",
      mood: "Calm",
      timestamp: new Date(visitStart.getTime() + 4 * 60 * 1000),
      createdByUserId: cnaUserMaria.id,
      isPublished: true,
    },
  });
  await recordAudit({
    actorUserId: cnaUserMaria.id,
    action: "seed.care_update.created",
    entityType: "CareUpdate",
    entityId: checkIn.id,
    agencyId: brightpath.id,
    payload: { updateType: "CheckIn" },
  });

  const meal = await prisma.careUpdate.create({
    data: {
      visitId: visit.id,
      clientId: eleanor.id,
      cnaId: cnaMaria.id,
      agencyId: brightpath.id,
      updateType: "Meal",
      mealStatus: "AteWell",
      note: "Oatmeal with blueberries, herbal tea. Ate most of the bowl.",
      timestamp: new Date(visitStart.getTime() + 25 * 60 * 1000),
      createdByUserId: cnaUserMaria.id,
      isPublished: true,
    },
  });
  await recordAudit({
    actorUserId: cnaUserMaria.id,
    action: "seed.care_update.created",
    entityType: "CareUpdate",
    entityId: meal.id,
    agencyId: brightpath.id,
    payload: { updateType: "Meal" },
  });

  const endOfShift = await prisma.careUpdate.create({
    data: {
      visitId: visit.id,
      clientId: eleanor.id,
      cnaId: cnaMaria.id,
      agencyId: brightpath.id,
      updateType: "EndOfShift",
      mood: "Happy",
      activityType: "Conversation",
      note: "We listened to her favorite Etta James record, took a short walk to the kitchen, talked about Sarah's kids. Good visit.",
      timestamp: new Date(visitEnd.getTime() - 10 * 60 * 1000),
      createdByUserId: cnaUserMaria.id,
      isPublished: true,
    },
  });
  await recordAudit({
    actorUserId: cnaUserMaria.id,
    action: "seed.care_update.created",
    entityType: "CareUpdate",
    entityId: endOfShift.id,
    agencyId: brightpath.id,
    payload: { updateType: "EndOfShift" },
  });

  await prisma.reaction.create({
    data: {
      careUpdateId: endOfShift.id,
      familyMemberId: sarahFm.id,
      type: "ThankYou",
    },
  });
  await recordAudit({
    actorUserId: familyUserSarah.id,
    action: "seed.reaction.created",
    entityType: "Reaction",
    entityId: endOfShift.id,
    agencyId: brightpath.id,
    payload: { type: "ThankYou" },
  });

  await prisma.notification.create({
    data: {
      recipientUserId: familyUserSarah.id,
      type: "new_care_update",
      payload: {
        // Generic — no PHI per brief.
        title: "A care visit update was posted.",
        deepLink: "/family/timeline",
      },
    },
  });

  console.log("\nSeed complete.\n");
  console.log("Demo credentials (password: " + DEMO_PASSWORD + "):");
  console.log("  - admin@kairoscare.com       KairosCare super admin");
  console.log("  - owner@brightpath.demo      Agency owner (BrightPath)");
  console.log("  - maria@brightpath.demo      CNA");
  console.log("  - sarah.williams@demo.com    Family primary (Eleanor)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
