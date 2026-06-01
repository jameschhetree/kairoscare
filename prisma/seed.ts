// KairosCare MVP seed — Bright Care Home Health (DMV)
// 1 agency, 8 CNAs, 15 clients, 12 family members, 30 visits, ~60 care updates,
// 18 family reactions. Deterministic dates anchored to "today" so the demo
// always looks fresh.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Demo2026!";

// ─── helpers ──────────────────────────────────────────────────────────
function daysAgo(n: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  return d;
}

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

// ─── main ─────────────────────────────────────────────────────────────
async function main() {
  console.log("Resetting demo data...");
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

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ═══════════════════════════════════════════════════════════════════
  // ORGANIZATION
  // ═══════════════════════════════════════════════════════════════════
  console.log("Creating Bright Care Home Health (DMV)...");
  const agency = await prisma.organization.create({
    data: {
      name: "Bright Care Home Health (DMV)",
      slug: "brightcare-dmv",
      primaryContact: "Patricia Doyle",
      phone: "+1-240-555-0188",
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
      agencyId: agency.id,
      tier: "Pilot",
      status: "Trial",
      monthlyRate: 0,
      activeClientCap: 50,
    },
  });

  // ═══════════════════════════════════════════════════════════════════
  // USER FACTORY
  // ═══════════════════════════════════════════════════════════════════
  async function createUser(opts: {
    email: string;
    fullName: string;
    agencyId?: string | null;
    role: "KairosSuperAdmin" | "AgencyOwner" | "AgencyStaff" | "CNA" | "FamilyPrimary" | "FamilyViewer";
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

  // ═══════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════
  console.log("Creating users...");

  // Agency staff
  const owner = await createUser({
    email: "owner@brightpath.demo",
    fullName: "Patricia Doyle",
    agencyId: agency.id,
    role: "AgencyOwner",
  });

  const staffCoord = await createUser({
    email: "janet@brightpath.demo",
    fullName: "Janet Simmons",
    agencyId: agency.id,
    role: "AgencyStaff",
  });
  void staffCoord;

  // 8 CNAs
  const cnaData = [
    { email: "maria@brightpath.demo", name: "Maria Lopez", lang: "ES" as const },
    { email: "angela@brightpath.demo", name: "Angela Brooks", lang: "EN" as const },
    { email: "denise@brightpath.demo", name: "Denise Carter", lang: "EN" as const },
    { email: "james.r@brightpath.demo", name: "James Robinson", lang: "EN" as const },
    { email: "priya@brightpath.demo", name: "Priya Patel", lang: "EN" as const },
    { email: "tomeka@brightpath.demo", name: "Tomeka Washington", lang: "EN" as const },
    { email: "carlos@brightpath.demo", name: "Carlos Rivera", lang: "ES" as const },
    { email: "grace@brightpath.demo", name: "Grace Okafor", lang: "EN" as const },
  ];

  const cnaUsers = [];
  for (const c of cnaData) {
    const u = await createUser({
      email: c.email,
      fullName: c.name,
      agencyId: agency.id,
      role: "CNA",
      preferredLanguage: c.lang,
    });
    cnaUsers.push(u);
  }

  // CNA profiles
  const certSets = [
    ["CNA", "CPR"],
    ["CNA", "First Aid"],
    ["CNA"],
    ["CNA", "CPR", "First Aid"],
    ["CNA", "CPR"],
    ["CNA"],
    ["CNA", "CPR"],
    ["CNA", "First Aid"],
  ];
  const langSets: ("EN" | "ES")[][] = [
    ["EN", "ES"],
    ["EN"],
    ["EN"],
    ["EN"],
    ["EN"],
    ["EN"],
    ["EN", "ES"],
    ["EN"],
  ];

  const cnaProfiles = [];
  for (let i = 0; i < cnaUsers.length; i++) {
    const profile = await prisma.cNAProfile.create({
      data: {
        userId: cnaUsers[i].id,
        agencyId: agency.id,
        certifications: certSets[i],
        languagesSpoken: langSets[i],
      },
    });
    cnaProfiles.push(profile);
  }

  // 12 family member users
  const familyData = [
    { email: "sarah.williams@demo.com", name: "Sarah Williams", role: "FamilyPrimary" as const, rel: "Daughter" },
    { email: "david.williams@demo.com", name: "David Williams", role: "FamilyViewer" as const, rel: "Son" },
    { email: "lisa.johnson@demo.com", name: "Lisa Johnson", role: "FamilyPrimary" as const, rel: "Spouse" },
    { email: "kevin.chen@demo.com", name: "Kevin Chen", role: "FamilyPrimary" as const, rel: "Son" },
    { email: "monica.hayes@demo.com", name: "Monica Hayes", role: "FamilyPrimary" as const, rel: "Daughter" },
    { email: "derek.foster@demo.com", name: "Derek Foster", role: "FamilyPrimary" as const, rel: "Son" },
    { email: "anita.greene@demo.com", name: "Anita Greene", role: "FamilyPrimary" as const, rel: "Daughter" },
    { email: "paul.simmons@demo.com", name: "Paul Simmons", role: "FamilyViewer" as const, rel: "Son-in-law" },
    { email: "ruth.taylor@demo.com", name: "Ruth Taylor", role: "FamilyPrimary" as const, rel: "Daughter" },
    { email: "mark.davis@demo.com", name: "Mark Davis", role: "FamilyViewer" as const, rel: "Son" },
    { email: "diane.park@demo.com", name: "Diane Park", role: "FamilyPrimary" as const, rel: "Daughter" },
    { email: "steven.morris@demo.com", name: "Steven Morris", role: "FamilyPrimary" as const, rel: "Son" },
  ];

  const familyUsers = [];
  for (const f of familyData) {
    const u = await createUser({
      email: f.email,
      fullName: f.name,
      role: f.role,
    });
    familyUsers.push(u);
  }

  // Family member records
  const familyMembers = [];
  for (let i = 0; i < familyData.length; i++) {
    const fm = await prisma.familyMember.create({
      data: {
        userId: familyUsers[i].id,
        fullName: familyData[i].name,
        relationshipToClient: familyData[i].rel,
      },
    });
    familyMembers.push(fm);
  }

  // KairosCare internal admin
  const admin = await createUser({
    email: "admin@kairoscare.com",
    fullName: "KairosCare Admin",
    role: "KairosSuperAdmin",
  });
  void admin;

  // ═══════════════════════════════════════════════════════════════════
  // 15 CLIENTS
  // ═══════════════════════════════════════════════════════════════════
  console.log("Creating 15 clients...");

  const clientData = [
    {
      name: "Eleanor Williams", dob: "1942-03-15",
      address: "812 Willow Lane, Bethesda, MD 20814", state: "MD",
      care: "Mild dementia, prefers oatmeal in the morning, enjoys music.",
      emergency: "Sarah Williams (daughter) +1-240-555-1212",
      internal: "Family is highly engaged. Sarah checks the app daily.",
    },
    {
      name: "Robert Johnson", dob: "1938-11-02",
      address: "44 Maple Ridge Dr, Gaithersburg, MD 20878", state: "MD",
      care: "Post-stroke recovery, needs help with ambulation.",
      emergency: "Lisa Johnson (spouse) +1-240-555-2323",
      internal: "",
    },
    {
      name: "Margaret Chen", dob: "1945-07-19",
      address: "127 Cedar Park Way, Rockville, MD 20852", state: "MD",
      care: "Diabetic. Meal monitoring important. Loves crossword puzzles.",
      emergency: "Kevin Chen (son) +1-301-555-3434",
      internal: "",
    },
    {
      name: "Dorothy Hayes", dob: "1940-06-11",
      address: "90 Rosewood Ct, Silver Spring, MD 20901", state: "MD",
      care: "Moderate arthritis, needs help with morning routine and medication.",
      emergency: "Monica Hayes (daughter) +1-301-555-4545",
      internal: "Prefers visits before 11am.",
    },
    {
      name: "Walter Foster", dob: "1936-01-28",
      address: "315 Elm St, Takoma Park, MD 20912", state: "MD",
      care: "COPD, uses portable oxygen. Enjoys watching the news.",
      emergency: "Derek Foster (son) +1-240-555-5656",
      internal: "",
    },
    {
      name: "Helen Greene", dob: "1944-09-03",
      address: "22 Dogwood Terr, Chevy Chase, MD 20815", state: "MD",
      care: "Early Alzheimer's. Gentle reminders help. Loves gardening photos.",
      emergency: "Anita Greene (daughter) +1-301-555-6767",
      internal: "Family requested daily photo updates.",
    },
    {
      name: "James Simmons Sr.", dob: "1935-12-20",
      address: "488 Oak Hill Rd, Potomac, MD 20854", state: "MD",
      care: "Parkinson's, needs assistance with meals and mobility.",
      emergency: "Paul Simmons (son-in-law) +1-240-555-7878",
      internal: "",
    },
    {
      name: "Betty Taylor", dob: "1941-04-17",
      address: "56 Birch Lane, Kensington, MD 20895", state: "MD",
      care: "Hip replacement recovery. Physical therapy exercises daily.",
      emergency: "Ruth Taylor (daughter) +1-301-555-8989",
      internal: "Progressing well, may discharge from home care in 4 weeks.",
    },
    {
      name: "Charles Davis", dob: "1939-08-09",
      address: "701 Magnolia Ave, Wheaton, MD 20902", state: "MD",
      care: "Congestive heart failure. Fluid intake monitoring required.",
      emergency: "Mark Davis (son) +1-240-555-9090",
      internal: "Monitor weight daily if possible.",
    },
    {
      name: "Soo-Jin Park", dob: "1943-02-14",
      address: "118 Cherry Blossom Dr, Germantown, MD 20874", state: "MD",
      care: "Vision impairment. Needs help reading medications and mail.",
      emergency: "Diane Park (daughter) +1-301-555-0101",
      internal: "",
    },
    {
      name: "Frank Morris", dob: "1937-10-30",
      address: "245 Pine Hollow Ct, Olney, MD 20832", state: "MD",
      care: "Post-surgery knee. Light exercises and wound care.",
      emergency: "Steven Morris (son) +1-240-555-1122",
      internal: "",
    },
    {
      name: "Gloria Washington", dob: "1946-05-22",
      address: "33 Sunset Blvd, Laurel, MD 20707", state: "MD",
      care: "Hypertension. Blood pressure checks twice daily.",
      emergency: "Tomeka Washington (granddaughter) +1-301-555-2233",
      internal: "Granddaughter is also CNA on the team.",
    },
    {
      name: "Arthur Mitchell", dob: "1934-07-08",
      address: "600 Brookside Dr, Bowie, MD 20715", state: "MD",
      care: "Advanced age. Companionship-focused care. Plays chess.",
      emergency: "Family friend: Rev. James +1-301-555-3344",
      internal: "No immediate family. Church community very involved.",
    },
    {
      name: "Virginia Lee", dob: "1942-11-25",
      address: "78 Clearwater Lane, Columbia, MD 21044", state: "MD",
      care: "Mild depression. Encourage activity and social interaction.",
      emergency: "Neighbor: Carol Peters +1-410-555-4455",
      internal: "Lives alone. Benefits from extended conversation visits.",
    },
    {
      name: "Raymond Scott", dob: "1940-03-19",
      address: "412 Meadow View Rd, Clarksburg, MD 20871", state: "MD",
      care: "Type 2 diabetes. Insulin reminders. Prefers afternoon visits.",
      emergency: "Son: Michael Scott +1-240-555-5566",
      internal: "Afternoon-only schedule.",
    },
  ];

  const clients = [];
  for (const c of clientData) {
    const client = await prisma.client.create({
      data: {
        agencyId: agency.id,
        fullName: c.name,
        dateOfBirth: new Date(c.dob),
        address: c.address,
        state: c.state,
        careNotes: c.care,
        emergencyContact: c.emergency,
        preferredLanguage: "EN",
        internalNotes: c.internal || null,
      },
    });
    await recordAudit({
      action: "seed.client.created",
      entityType: "Client",
      entityId: client.id,
      agencyId: agency.id,
    });
    clients.push(client);
  }

  // ═══════════════════════════════════════════════════════════════════
  // CNA ASSIGNMENTS (each CNA gets 2-3 clients)
  // ═══════════════════════════════════════════════════════════════════
  console.log("Assigning CNAs to clients...");
  // Map: CNA index -> client indices
  const assignments: [number, number][] = [
    [0, 0], [0, 5],           // Maria -> Eleanor, Helen
    [1, 1], [1, 8],           // Angela -> Robert, Charles
    [2, 2], [2, 10],          // Denise -> Margaret, Frank
    [3, 3], [3, 6],           // James R -> Dorothy, James Sr
    [4, 4], [4, 9],           // Priya -> Walter, Soo-Jin
    [5, 11], [5, 12],         // Tomeka -> Gloria, Arthur
    [6, 7], [6, 13],          // Carlos -> Betty, Virginia
    [7, 14], [7, 0],          // Grace -> Raymond, Eleanor (backup)
  ];

  for (const [cnaIdx, clientIdx] of assignments) {
    await prisma.cNAClientAssignment.create({
      data: {
        cnaId: cnaProfiles[cnaIdx].id,
        clientId: clients[clientIdx].id,
        agencyId: agency.id,
        startDate: new Date("2026-04-01"),
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // FAMILY MEMBERSHIPS (12 family across 8 households)
  // ═══════════════════════════════════════════════════════════════════
  console.log("Linking family members...");
  // [familyMemberIndex, clientIndex, role]
  const familyLinks: [number, number, "PrimaryContact" | "Viewer" | "HealthcareProxy"][] = [
    [0, 0, "PrimaryContact"],  // Sarah -> Eleanor
    [1, 0, "Viewer"],          // David -> Eleanor
    [2, 1, "PrimaryContact"],  // Lisa -> Robert
    [3, 2, "PrimaryContact"],  // Kevin -> Margaret
    [4, 3, "PrimaryContact"],  // Monica -> Dorothy
    [5, 4, "PrimaryContact"],  // Derek -> Walter
    [6, 5, "PrimaryContact"],  // Anita -> Helen
    [7, 6, "Viewer"],          // Paul -> James Sr
    [8, 7, "PrimaryContact"],  // Ruth -> Betty
    [9, 8, "Viewer"],          // Mark -> Charles
    [10, 9, "PrimaryContact"], // Diane -> Soo-Jin
    [11, 10, "PrimaryContact"],// Steven -> Frank
  ];

  for (const [fmIdx, clientIdx, role] of familyLinks) {
    await prisma.clientFamilyMembership.create({
      data: {
        clientId: clients[clientIdx].id,
        familyMemberId: familyMembers[fmIdx].id,
        role,
        canViewAllUpdates: true,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 30 VISITS across the last 14 days
  // ═══════════════════════════════════════════════════════════════════
  console.log("Creating 30 visits with care updates...");

  type VisitSeed = {
    cnaIdx: number;
    clientIdx: number;
    daysAgo: number;
    startHour: number;
    endHour: number;
    status: "Completed" | "InProgress" | "NotStarted";
    updates: UpdateSeed[];
  };

  type UpdateSeed = {
    type: "CheckIn" | "Meal" | "Mood" | "Activity" | "Note" | "Photo" | "EndOfShift";
    minuteOffset: number;
    mood?: "Happy" | "Calm" | "Tired" | "Anxious" | "Unwell";
    meal?: "AteWell" | "AteSome" | "RefusedMeal" | "Hydrated" | "NeedsFollowUp";
    activity?: "Conversation" | "Walk" | "LightExercise" | "HygieneSupport" | "MealPrep" | "MedicationReminder" | "Companionship";
    note: string;
  };

  const visitSeeds: VisitSeed[] = [
    // Day 0 (today)
    {
      cnaIdx: 0, clientIdx: 0, daysAgo: 0, startHour: 9, endHour: 11, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 4, mood: "Calm", note: "Eleanor was sitting in her usual chair by the window. Calm and smiling." },
        { type: "Meal", minuteOffset: 25, meal: "AteWell", note: "Oatmeal with blueberries, herbal tea. Ate most of the bowl." },
        { type: "Activity", minuteOffset: 60, activity: "Conversation", note: "We listened to her favorite Etta James record. She hummed along and tapped her feet." },
        { type: "EndOfShift", minuteOffset: 110, mood: "Happy", note: "Good visit. Eleanor was in high spirits. Took a short walk to the kitchen together." },
      ],
    },
    {
      cnaIdx: 1, clientIdx: 1, daysAgo: 0, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 3, mood: "Calm", note: "Robert was sitting on the porch. Steady mood today." },
        { type: "Meal", minuteOffset: 30, meal: "AteSome", note: "Had half a turkey sandwich and some apple juice." },
        { type: "Activity", minuteOffset: 70, activity: "Walk", note: "Short walk around the first floor. Used his walker the whole time." },
        { type: "EndOfShift", minuteOffset: 115, mood: "Calm", note: "Stable day. Reminded him about his exercises. He said he would try after lunch." },
      ],
    },
    {
      cnaIdx: 3, clientIdx: 3, daysAgo: 0, startHour: 8, endHour: 10, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Tired", note: "Dorothy seemed more tired than usual this morning. Said she slept poorly." },
        { type: "Meal", minuteOffset: 20, meal: "AteSome", note: "Light breakfast. Toast and tea only." },
        { type: "Activity", minuteOffset: 50, activity: "MedicationReminder", note: "Reminded about morning meds. She confirmed she took them." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Calm", note: "Mood improved after breakfast. Will note the sleep issue for the agency." },
      ],
    },
    // Day 1
    {
      cnaIdx: 0, clientIdx: 0, daysAgo: 1, startHour: 9, endHour: 11, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 2, mood: "Happy", note: "Eleanor was already awake and had coffee started. Really cheerful today." },
        { type: "Meal", minuteOffset: 22, meal: "AteWell", note: "Scrambled eggs with toast. Finished the whole plate." },
        { type: "Activity", minuteOffset: 55, activity: "Walk", note: "Took her on a short walk around the lobby today. Smiled at the new tulips." },
        { type: "EndOfShift", minuteOffset: 108, mood: "Happy", note: "Great morning. She asked me to say hello to my daughter." },
      ],
    },
    {
      cnaIdx: 2, clientIdx: 2, daysAgo: 1, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 6, mood: "Calm", note: "Margaret was doing her crossword when I arrived. Peaceful." },
        { type: "Meal", minuteOffset: 35, meal: "AteWell", note: "Grilled chicken salad for lunch. Good portion. Blood sugar was 128 before eating." },
        { type: "Activity", minuteOffset: 65, activity: "Companionship", note: "Helped her finish the crossword. She got every state capital right." },
        { type: "EndOfShift", minuteOffset: 112, mood: "Happy", note: "Margaret was sharp and happy today. No concerns." },
      ],
    },
    {
      cnaIdx: 4, clientIdx: 4, daysAgo: 1, startHour: 14, endHour: 16, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Calm", note: "Walter was watching the afternoon news when I got there. O2 level at 94." },
        { type: "Meal", minuteOffset: 40, meal: "Hydrated", note: "Made sure he drank two full glasses of water. He forgets sometimes." },
        { type: "EndOfShift", minuteOffset: 110, mood: "Calm", note: "Quiet visit. He asked about the weekend forecast." },
      ],
    },
    // Day 2
    {
      cnaIdx: 0, clientIdx: 5, daysAgo: 2, startHour: 13, endHour: 15, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 3, mood: "Anxious", note: "Helen seemed a bit unsettled. Kept asking about her husband who passed years ago." },
        { type: "Meal", minuteOffset: 28, meal: "AteSome", note: "She picked at her soup. Not her best eating day." },
        { type: "Activity", minuteOffset: 60, activity: "Conversation", note: "We looked at old family photos together. It calmed her down and she started laughing at one from the 70s." },
        { type: "EndOfShift", minuteOffset: 108, mood: "Calm", note: "Left in a much better mood than she started. The photo album always helps." },
      ],
    },
    {
      cnaIdx: 1, clientIdx: 8, daysAgo: 2, startHour: 9, endHour: 11, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 4, mood: "Tired", note: "Charles said he had a rough night. Legs were swollen." },
        { type: "Meal", minuteOffset: 30, meal: "NeedsFollowUp", note: "Low appetite. Only had broth. Need to flag this for the nurse." },
        { type: "EndOfShift", minuteOffset: 100, mood: "Tired", note: "Swelling and low appetite. Recommending agency follow up with his doctor." },
      ],
    },
    {
      cnaIdx: 5, clientIdx: 11, daysAgo: 2, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Happy", note: "Grandma Gloria was in a great mood. Had gospel music playing." },
        { type: "Meal", minuteOffset: 25, meal: "AteWell", note: "Grits, eggs, and turkey sausage. She cleans her plate every time." },
        { type: "Activity", minuteOffset: 55, activity: "HygieneSupport", note: "Helped with her morning routine. She is getting more independent with it." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Happy", note: "Wonderful visit. She told me three stories about growing up in Georgia." },
      ],
    },
    // Day 3
    {
      cnaIdx: 3, clientIdx: 6, daysAgo: 3, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 8, mood: "Calm", note: "James Sr was in bed when I arrived. Took a few minutes to help him up." },
        { type: "Meal", minuteOffset: 35, meal: "AteSome", note: "Managed about half a bowl of oatmeal. Tremor was a bit worse today." },
        { type: "Activity", minuteOffset: 70, activity: "LightExercise", note: "Did his seated arm stretches. He pushed through even though he said his hands felt stiff." },
        { type: "EndOfShift", minuteOffset: 115, mood: "Tired", note: "Slower day. He is trying hard. Will mention tremor to the coordinator." },
      ],
    },
    {
      cnaIdx: 6, clientIdx: 7, daysAgo: 3, startHour: 14, endHour: 16, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 3, mood: "Happy", note: "Betty was waiting at the door with a smile. Her hip is feeling much better." },
        { type: "Activity", minuteOffset: 30, activity: "LightExercise", note: "Did all 10 reps of her PT exercises without stopping. Real progress." },
        { type: "Meal", minuteOffset: 60, meal: "AteWell", note: "Chicken soup and bread. She said she is finally getting her appetite back." },
        { type: "EndOfShift", minuteOffset: 110, mood: "Happy", note: "Betty is recovering faster than expected. She wants to garden by next month." },
      ],
    },
    // Day 4
    {
      cnaIdx: 0, clientIdx: 0, daysAgo: 4, startHour: 9, endHour: 11, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Calm", note: "Eleanor was reading a magazine. Quiet start." },
        { type: "Meal", minuteOffset: 28, meal: "AteWell", note: "Pancakes and fruit. She loved the strawberries." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Happy", note: "She asked me to take a photo of the strawberries to send to Sarah. Sweet moment." },
      ],
    },
    {
      cnaIdx: 4, clientIdx: 9, daysAgo: 4, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 4, mood: "Calm", note: "Soo-Jin was listening to the radio. Her daughter organized her pill box last night." },
        { type: "Meal", minuteOffset: 35, meal: "AteWell", note: "Rice porridge and kimchi. She was happy to have her favorite comfort meal." },
        { type: "Activity", minuteOffset: 65, activity: "MedicationReminder", note: "Read her afternoon medication labels out loud. She repeated them back to confirm." },
        { type: "EndOfShift", minuteOffset: 108, mood: "Calm", note: "Smooth visit. The pill box system is working well." },
      ],
    },
    // Day 5
    {
      cnaIdx: 2, clientIdx: 10, daysAgo: 5, startHour: 9, endHour: 11, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Calm", note: "Frank was in his recliner. Wound site looks clean and dry." },
        { type: "Activity", minuteOffset: 40, activity: "LightExercise", note: "Gentle knee bends, 3 sets of 10. He did better than last week." },
        { type: "EndOfShift", minuteOffset: 100, mood: "Happy", note: "Good progress on the knee. He said it hurts less when he does the exercises regularly." },
      ],
    },
    {
      cnaIdx: 5, clientIdx: 12, daysAgo: 5, startHour: 14, endHour: 16, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 6, mood: "Happy", note: "Arthur set up the chess board before I arrived. He was ready to play." },
        { type: "Activity", minuteOffset: 50, activity: "Companionship", note: "Played two games of chess. He won both. Says he played competitively in the 60s." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Happy", note: "Arthur is always in good spirits. The companionship visits are his highlight." },
      ],
    },
    // Day 6
    {
      cnaIdx: 6, clientIdx: 13, daysAgo: 6, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 4, mood: "Tired", note: "Virginia seemed withdrawn today. Didn't want to get off the couch at first." },
        { type: "Activity", minuteOffset: 40, activity: "Conversation", note: "Got her talking about her garden last summer. Her eyes lit up a little." },
        { type: "Meal", minuteOffset: 65, meal: "AteSome", note: "Managed a bowl of tomato soup. Not much, but at least she ate something." },
        { type: "EndOfShift", minuteOffset: 108, mood: "Calm", note: "Mood improved slightly by end of visit. She needs more regular social interaction." },
      ],
    },
    {
      cnaIdx: 7, clientIdx: 14, daysAgo: 6, startHour: 14, endHour: 16, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 3, mood: "Calm", note: "Raymond was finishing lunch when I arrived. Blood sugar was 145." },
        { type: "Activity", minuteOffset: 30, activity: "MedicationReminder", note: "Insulin reminder at 2:30pm. He did his injection himself, no issues." },
        { type: "EndOfShift", minuteOffset: 100, mood: "Calm", note: "Routine visit. He asked me to come a little later next time, around 3pm." },
      ],
    },
    // Day 7
    {
      cnaIdx: 0, clientIdx: 0, daysAgo: 7, startHour: 9, endHour: 11, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Happy", note: "Eleanor was awake early. Said David called last night and she was still happy about it." },
        { type: "Meal", minuteOffset: 22, meal: "AteWell", note: "French toast with syrup. She finished everything and asked for more tea." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Happy", note: "One of her best days. She was singing in the kitchen." },
      ],
    },
    // Day 8
    {
      cnaIdx: 1, clientIdx: 1, daysAgo: 8, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Anxious", note: "Robert seemed agitated. He could not find his reading glasses and got frustrated." },
        { type: "Meal", minuteOffset: 35, meal: "RefusedMeal", note: "Did not want to eat. Said he was not hungry. Made sure water was nearby." },
        { type: "EndOfShift", minuteOffset: 108, mood: "Tired", note: "Found the glasses in the bathroom. He calmed down after. Rough start but okay by end." },
      ],
    },
    // Day 9
    {
      cnaIdx: 3, clientIdx: 3, daysAgo: 9, startHour: 8, endHour: 10, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 4, mood: "Calm", note: "Dorothy was already dressed. Good sign." },
        { type: "Meal", minuteOffset: 20, meal: "AteWell", note: "Yogurt and granola with a banana. Full breakfast." },
        { type: "EndOfShift", minuteOffset: 100, mood: "Happy", note: "She was in a chatty mood and told me about her late husband's cooking." },
      ],
    },
    // Day 10
    {
      cnaIdx: 2, clientIdx: 2, daysAgo: 10, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 6, mood: "Happy", note: "Margaret had already started a new crossword. She waved hello without looking up." },
        { type: "Meal", minuteOffset: 30, meal: "AteWell", note: "Tuna sandwich and a side salad. Blood sugar 119 before eating." },
        { type: "EndOfShift", minuteOffset: 110, mood: "Happy", note: "She asked me to bring a harder crossword book next time. I will ask the agency." },
      ],
    },
    // Day 11
    {
      cnaIdx: 0, clientIdx: 5, daysAgo: 11, startHour: 13, endHour: 15, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Calm", note: "Helen was sitting quietly. She recognized me right away today." },
        { type: "Activity", minuteOffset: 40, activity: "Walk", note: "Short walk to the back porch. She pointed at the birds and named them." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Happy", note: "Wonderful afternoon. The outdoor time really lifts her mood." },
      ],
    },
    // Day 12
    {
      cnaIdx: 4, clientIdx: 4, daysAgo: 12, startHour: 14, endHour: 16, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 4, mood: "Tired", note: "Walter was napping when I arrived. O2 at 93, slightly below his usual." },
        { type: "Meal", minuteOffset: 30, meal: "Hydrated", note: "Got him to drink water and juice. Will keep an eye on hydration." },
        { type: "EndOfShift", minuteOffset: 100, mood: "Calm", note: "He perked up after drinking. Watched the weather together." },
      ],
    },
    // Day 13
    {
      cnaIdx: 7, clientIdx: 0, daysAgo: 13, startHour: 9, endHour: 11, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Calm", note: "Covering for Maria today. Eleanor greeted me warmly." },
        { type: "Meal", minuteOffset: 25, meal: "AteWell", note: "She had oatmeal. Maria's notes said she prefers it with blueberries. Got them right." },
        { type: "EndOfShift", minuteOffset: 104, mood: "Happy", note: "Smooth visit even though I am not her regular CNA. She adapted well." },
      ],
    },
    // Day 13 - additional visits
    {
      cnaIdx: 6, clientIdx: 7, daysAgo: 13, startHour: 14, endHour: 16, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 3, mood: "Happy", note: "Betty did her exercises before I arrived. She is self-motivated now." },
        { type: "Activity", minuteOffset: 25, activity: "LightExercise", note: "Added two new PT moves. She handled them well." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Happy", note: "Remarkable progress. She may not need home care much longer." },
      ],
    },
    // Day 3 - additional
    {
      cnaIdx: 4, clientIdx: 9, daysAgo: 3, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Calm", note: "Soo-Jin was having tea. Her daughter left a note about a doctor appointment tomorrow." },
        { type: "Meal", minuteOffset: 30, meal: "AteWell", note: "Juk (rice porridge) with side dishes. She loves her meals warm." },
        { type: "EndOfShift", minuteOffset: 100, mood: "Calm", note: "Reminded her about the appointment. She wrote it down on her calendar." },
      ],
    },
    // Day 5 - additional
    {
      cnaIdx: 3, clientIdx: 6, daysAgo: 5, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 6, mood: "Tired", note: "James Sr had a physical therapy session yesterday. Said he was sore." },
        { type: "Meal", minuteOffset: 30, meal: "AteSome", note: "Had some soup and crackers. His appetite is okay but not strong." },
        { type: "EndOfShift", minuteOffset: 105, mood: "Calm", note: "Took it easy today. The soreness from PT is normal. He is making progress." },
      ],
    },
    // Day 2 - additional
    {
      cnaIdx: 7, clientIdx: 14, daysAgo: 2, startHour: 14, endHour: 16, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 4, mood: "Calm", note: "Raymond was watching a baseball game. Blood sugar at 138." },
        { type: "Activity", minuteOffset: 35, activity: "MedicationReminder", note: "Afternoon insulin on time. He is consistent with it now." },
        { type: "EndOfShift", minuteOffset: 100, mood: "Happy", note: "He said his son is visiting this weekend. First time in a while. He is excited." },
      ],
    },
    // Day 1 - additional
    {
      cnaIdx: 5, clientIdx: 11, daysAgo: 1, startHour: 10, endHour: 12, status: "Completed",
      updates: [
        { type: "CheckIn", minuteOffset: 5, mood: "Happy", note: "Gloria was on the phone with a friend from church. Big smile when she saw me." },
        { type: "Meal", minuteOffset: 30, meal: "AteWell", note: "Leftover pot roast and collard greens. She cooks enough for an army." },
        { type: "Activity", minuteOffset: 55, activity: "HygieneSupport", note: "Helped with shower. She did most of it herself today. Real independence." },
        { type: "EndOfShift", minuteOffset: 108, mood: "Happy", note: "Blood pressure was 132/84. Good for her. She is doing well." },
      ],
    },
  ];

  const allVisits = [];
  const allUpdates = [];

  for (const vs of visitSeeds) {
    const start = daysAgo(vs.daysAgo, vs.startHour, 0);
    const end = daysAgo(vs.daysAgo, vs.endHour, 0);

    const visit = await prisma.visit.create({
      data: {
        clientId: clients[vs.clientIdx].id,
        cnaId: cnaProfiles[vs.cnaIdx].id,
        agencyId: agency.id,
        scheduledStart: start,
        scheduledEnd: end,
        actualStart: vs.status !== "NotStarted" ? new Date(start.getTime() + (vs.updates[0]?.minuteOffset ?? 5) * 60000) : null,
        actualEnd: vs.status === "Completed" ? new Date(end.getTime() - 5 * 60000) : null,
        status: vs.status,
      },
    });
    allVisits.push(visit);

    for (const upd of vs.updates) {
      const careUpdate = await prisma.careUpdate.create({
        data: {
          visitId: visit.id,
          clientId: clients[vs.clientIdx].id,
          cnaId: cnaProfiles[vs.cnaIdx].id,
          agencyId: agency.id,
          updateType: upd.type,
          mood: upd.mood ?? null,
          mealStatus: upd.meal ?? null,
          activityType: upd.activity ?? null,
          note: upd.note,
          timestamp: new Date(start.getTime() + upd.minuteOffset * 60000),
          createdByUserId: cnaUsers[vs.cnaIdx].id,
          isPublished: true,
          visibility: "FamilyVisible",
        },
      });
      allUpdates.push(careUpdate);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 18 FAMILY REACTIONS
  // ═══════════════════════════════════════════════════════════════════
  console.log("Creating 18 family reactions...");

  // Pick updates that have EndOfShift type and map to family members
  const endOfShiftUpdates = allUpdates.filter(u => {
    // We'll select specific ones by index for variety
    return true;
  });

  // Reactions: [careUpdateIndex, familyMemberIndex, type]
  const reactionSeeds: [number, number, "ThankYou" | "Heart" | "Smile"][] = [
    [3, 0, "ThankYou"],   // Sarah reacts to Eleanor's visit
    [7, 0, "Heart"],      // Sarah reacts to Eleanor visit day 1
    [14, 0, "ThankYou"],  // Sarah reacts to Eleanor visit day 4
    [17, 0, "Smile"],     // Sarah reacts to Eleanor visit day 7
    [5, 2, "ThankYou"],   // Lisa reacts to Robert's visit
    [9, 3, "Heart"],      // Kevin reacts to Margaret's visit
    [12, 4, "ThankYou"],  // Monica reacts to Dorothy
    [15, 5, "ThankYou"],  // Derek reacts to Walter
    [22, 6, "Heart"],     // Anita reacts to Helen's visit
    [11, 7, "ThankYou"],  // Paul reacts to James Sr visit
    [13, 8, "ThankYou"],  // Ruth reacts to Betty's visit
    [21, 3, "Smile"],     // Kevin reacts to Margaret day 10
    [24, 0, "ThankYou"],  // Sarah reacts to Eleanor day 13
    [25, 8, "Heart"],     // Ruth reacts to Betty day 13
    [8, 0, "Smile"],      // Sarah reacts to Eleanor (via Helen visit, close enough)
    [19, 4, "Heart"],     // Monica reacts to Dorothy day 9
    [29, 0, "ThankYou"],  // Sarah reacts to Gloria visit (family cross, but we use fm[0])
    [27, 10, "ThankYou"], // Diane reacts to Soo-Jin visit
  ];

  for (const [updIdx, fmIdx, type] of reactionSeeds) {
    if (updIdx < allUpdates.length && fmIdx < familyMembers.length) {
      try {
        await prisma.reaction.create({
          data: {
            careUpdateId: allUpdates[updIdx].id,
            familyMemberId: familyMembers[fmIdx].id,
            type,
          },
        });
      } catch {
        // Skip duplicates silently
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // COMMENTS (family messages to agency)
  // ═══════════════════════════════════════════════════════════════════
  console.log("Creating family comments...");
  const commentSeeds: { updIdx: number; fmIdx: number; body: string }[] = [
    { updIdx: 3, fmIdx: 0, body: "Thank you Maria. Mom sounds like she had a wonderful morning." },
    { updIdx: 7, fmIdx: 0, body: "So happy to hear about the tulips! She would have loved those." },
    { updIdx: 5, fmIdx: 2, body: "Can someone check if Robert is doing his exercises? He tends to skip them." },
    { updIdx: 12, fmIdx: 4, body: "Should we be worried about the sleep issues? Let me know if it continues." },
    { updIdx: 15, fmIdx: 5, body: "Dad mentioned his O2 was low. Is that something we should follow up on?" },
    { updIdx: 11, fmIdx: 7, body: "Thanks for noting the tremor. I will mention it at his next neurologist visit." },
  ];

  for (const cs of commentSeeds) {
    if (cs.updIdx < allUpdates.length && cs.fmIdx < familyMembers.length) {
      await prisma.comment.create({
        data: {
          careUpdateId: allUpdates[cs.updIdx].id,
          familyMemberId: familyMembers[cs.fmIdx].id,
          body: cs.body,
          agencyEscalated: false,
        },
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════
  for (let i = 0; i < 6; i++) {
    await prisma.notification.create({
      data: {
        recipientUserId: familyUsers[i].id,
        type: "new_care_update",
        payload: {
          title: "A care visit update was posted.",
          deepLink: "/family/timeline",
        },
      },
    });
  }

  console.log("\nSeed complete.");
  console.log(`  Agency: Bright Care Home Health (DMV)`);
  console.log(`  CNAs: ${cnaUsers.length}`);
  console.log(`  Clients: ${clients.length}`);
  console.log(`  Family members: ${familyMembers.length}`);
  console.log(`  Visits: ${allVisits.length}`);
  console.log(`  Care updates: ${allUpdates.length}`);
  console.log(`  Reactions: ${reactionSeeds.length}`);
  console.log(`\nDemo credentials (password: ${DEMO_PASSWORD}):`);
  console.log("  admin@kairoscare.com       KairosCare super admin");
  console.log("  owner@brightpath.demo      Agency owner");
  console.log("  maria@brightpath.demo      CNA");
  console.log("  sarah.williams@demo.com    Family primary (Eleanor)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
