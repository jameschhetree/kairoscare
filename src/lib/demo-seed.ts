// In-memory demo dataset. Every portal page reads from here when the
// demo_role cookie is set. Zero Prisma calls in demo mode.
//
// The data mirrors the Prisma seed but lives entirely in memory so it
// works on Vercel without a reachable database.

import { cookies } from "next/headers";
import type { PortalScope } from "./roles";
import type { SessionUser } from "./session";

// ─── Demo cookie helpers ───────────────────────────────────────────

const DEMO_COOKIE = "demo_role";

export async function getDemoRole(): Promise<PortalScope | null> {
  const c = await cookies();
  const val = c.get(DEMO_COOKIE)?.value;
  if (val === "agency" || val === "admin" || val === "family" || val === "cna") {
    return val;
  }
  return null;
}

export async function clearDemoCookie() {
  const c = await cookies();
  c.delete(DEMO_COOKIE);
}

// ─── Demo session users (one per portal) ───────────────────────────

const DEMO_AGENCY_ID = "demo-agency-brightcare";

export function getDemoUser(portal: PortalScope): SessionUser {
  const base = {
    supabaseUserId: null,
    preferredLanguage: "EN" as const,
    lastLoginAt: new Date(),
    isActive: true,
    createdAt: new Date("2026-04-01"),
    roleAssignments: [],
  };

  switch (portal) {
    case "agency":
      return {
        ...base,
        id: "demo-user-agency-owner",
        email: "owner@brightpath.demo",
        fullName: "Patricia Doyle",
        agencyId: DEMO_AGENCY_ID,
        roleAssignments: [
          { id: "ra-1", userId: "demo-user-agency-owner", role: "AgencyOwner" as const, scopeAgencyId: DEMO_AGENCY_ID, scopeClientId: null, createdAt: new Date() },
        ],
        primaryRole: "AgencyOwner" as const,
        portal: "agency" as const,
      };
    case "admin":
      return {
        ...base,
        id: "demo-user-admin",
        email: "admin@kairoscare.com",
        fullName: "KairosCare Admin",
        agencyId: null,
        roleAssignments: [
          { id: "ra-2", userId: "demo-user-admin", role: "KairosSuperAdmin" as const, scopeAgencyId: null, scopeClientId: null, createdAt: new Date() },
        ],
        primaryRole: "KairosSuperAdmin" as const,
        portal: "admin" as const,
      };
    case "family":
      return {
        ...base,
        id: "demo-user-family",
        email: "sarah.williams@demo.com",
        fullName: "Sarah Williams",
        agencyId: null,
        roleAssignments: [
          { id: "ra-3", userId: "demo-user-family", role: "FamilyPrimary" as const, scopeAgencyId: null, scopeClientId: null, createdAt: new Date() },
        ],
        primaryRole: "FamilyPrimary" as const,
        portal: "family" as const,
      };
    case "cna":
      return {
        ...base,
        id: "demo-user-cna",
        email: "maria@brightpath.demo",
        fullName: "Maria Lopez",
        agencyId: DEMO_AGENCY_ID,
        preferredLanguage: "ES" as const,
        roleAssignments: [
          { id: "ra-4", userId: "demo-user-cna", role: "CNA" as const, scopeAgencyId: DEMO_AGENCY_ID, scopeClientId: null, createdAt: new Date() },
        ],
        primaryRole: "CNA" as const,
        portal: "cna" as const,
      };
  }
}

// ─── Agency-level AI Insights ──────────────────────────────────────

export type AtRiskClient = {
  clientName: string;
  reason: string;
  severity: "high" | "medium" | "low";
  daysSinceFlag: number;
};

export const atRiskClients: AtRiskClient[] = [
  {
    clientName: "Charles Davis",
    reason: "3 consecutive low-mood visits. Swelling and appetite flagged by CNA.",
    severity: "high",
    daysSinceFlag: 2,
  },
  {
    clientName: "Virginia Lee",
    reason: "Family has not reacted in 9 days. Last visit mood was withdrawn.",
    severity: "medium",
    daysSinceFlag: 6,
  },
  {
    clientName: "Walter Foster",
    reason: "Visit punctuality slipping. O2 readings trending down over 3 visits.",
    severity: "medium",
    daysSinceFlag: 1,
  },
];

export type SentimentDay = {
  label: string;
  happy: number;
  calm: number;
  tired: number;
  anxious: number;
};

export const sentimentTrend: SentimentDay[] = [
  { label: "D-13", happy: 2, calm: 3, tired: 1, anxious: 0 },
  { label: "D-12", happy: 1, calm: 2, tired: 2, anxious: 0 },
  { label: "D-11", happy: 2, calm: 2, tired: 0, anxious: 0 },
  { label: "D-10", happy: 3, calm: 1, tired: 0, anxious: 0 },
  { label: "D-9",  happy: 2, calm: 2, tired: 1, anxious: 0 },
  { label: "D-8",  happy: 0, calm: 1, tired: 2, anxious: 1 },
  { label: "D-7",  happy: 3, calm: 1, tired: 0, anxious: 0 },
  { label: "D-6",  happy: 1, calm: 3, tired: 1, anxious: 0 },
  { label: "D-5",  happy: 2, calm: 2, tired: 1, anxious: 0 },
  { label: "D-4",  happy: 2, calm: 2, tired: 0, anxious: 0 },
  { label: "D-3",  happy: 1, calm: 3, tired: 2, anxious: 0 },
  { label: "D-2",  happy: 2, calm: 1, tired: 1, anxious: 1 },
  { label: "D-1",  happy: 3, calm: 2, tired: 1, anxious: 0 },
  { label: "Today", happy: 2, calm: 3, tired: 1, anxious: 0 },
];

export type CoachingInsight = {
  cnaName: string;
  suggestion: string;
  metric: string;
};

export const coachingInsights: CoachingInsight[] = [
  {
    cnaName: "James Robinson",
    suggestion: "Photo capture rate is 40% below team average. Encourage adding one photo per visit.",
    metric: "Photo rate: 12% vs team avg 52%",
  },
  {
    cnaName: "Grace Okafor",
    suggestion: "Could log more activity notes per visit. Current average is 1.2 notes vs team average of 2.8.",
    metric: "Notes per visit: 1.2 vs team avg 2.8",
  },
];

// ─── Admin-level AI Insights ───────────────────────────────────────

export const adminCrossInsights = {
  agenciesTrendingPositive: 1,
  agenciesBelowThreshold: 0,
  familyChurnRisk: 2,
  churnRiskDetail: "2 households (Virginia Lee, Charles Davis) have not received family reactions in over 7 days.",
  weeklyVisitCount: 30,
  totalCNAs: 8,
  totalAgencies: 1,
  familyEngagementRate: "78%",
  averageSentiment: "Positive (68% happy/calm)",
  churnRiskCount: 2,
};

// ─── Recent family signals for agency dashboard ────────────────────

export type FamilySignal = {
  clientName: string;
  familyName: string;
  action: string;
  time: string;
  needsAttention: boolean;
};

export const recentFamilySignals: FamilySignal[] = [
  { clientName: "Eleanor W.", familyName: "Sarah", action: "Sent a thank-you on today's visit", time: "11:50 AM", needsAttention: false },
  { clientName: "Charles D.", familyName: "Mark", action: "Asked about swelling and appetite", time: "10:30 AM", needsAttention: true },
  { clientName: "Dorothy H.", familyName: "Monica", action: "Flagged sleep concerns", time: "9:15 AM", needsAttention: true },
  { clientName: "Robert J.", familyName: "Lisa", action: "Reacted with a heart", time: "Yesterday", needsAttention: false },
  { clientName: "Betty T.", familyName: "Ruth", action: "Commented on PT progress", time: "Yesterday", needsAttention: false },
];

// ─── In-memory data for portal pages ───────────────────────────────

export const demoAgency = {
  id: DEMO_AGENCY_ID,
  name: "Bright Care Home Health (DMV)",
  slug: "brightcare-dmv",
  primaryContact: "Patricia Doyle",
  phone: "+1-240-555-0188",
  email: "owner@brightpath.demo",
  autoPublishCnaUpdates: true,
};

export type DemoClient = {
  id: string;
  fullName: string;
  state: string;
  address: string;
  careNotes: string;
  emergencyContact: string;
  cnaCount: number;
  familyCount: number;
  cnaNames: string[];
  familyMembers: { name: string; role: string }[];
};

export const demoClients: DemoClient[] = [
  { id: "dc-1", fullName: "Eleanor Williams", state: "MD", address: "812 Willow Lane, Bethesda, MD 20814", careNotes: "Mild dementia, prefers oatmeal in the morning, enjoys music.", emergencyContact: "Sarah Williams (daughter) +1-240-555-1212", cnaCount: 2, familyCount: 2, cnaNames: ["Maria Lopez", "Grace Okafor"], familyMembers: [{ name: "Sarah Williams", role: "PrimaryContact" }, { name: "David Williams", role: "Viewer" }] },
  { id: "dc-2", fullName: "Robert Johnson", state: "MD", address: "44 Maple Ridge Dr, Gaithersburg, MD 20878", careNotes: "Post-stroke recovery, needs help with ambulation.", emergencyContact: "Lisa Johnson (spouse) +1-240-555-2323", cnaCount: 1, familyCount: 1, cnaNames: ["Angela Brooks"], familyMembers: [{ name: "Lisa Johnson", role: "PrimaryContact" }] },
  { id: "dc-3", fullName: "Margaret Chen", state: "MD", address: "127 Cedar Park Way, Rockville, MD 20852", careNotes: "Diabetic. Meal monitoring important. Loves crossword puzzles.", emergencyContact: "Kevin Chen (son) +1-301-555-3434", cnaCount: 1, familyCount: 1, cnaNames: ["Denise Carter"], familyMembers: [{ name: "Kevin Chen", role: "PrimaryContact" }] },
  { id: "dc-4", fullName: "Dorothy Hayes", state: "MD", address: "90 Rosewood Ct, Silver Spring, MD 20901", careNotes: "Moderate arthritis, needs help with morning routine and medication.", emergencyContact: "Monica Hayes (daughter) +1-301-555-4545", cnaCount: 1, familyCount: 1, cnaNames: ["James Robinson"], familyMembers: [{ name: "Monica Hayes", role: "PrimaryContact" }] },
  { id: "dc-5", fullName: "Walter Foster", state: "MD", address: "315 Elm St, Takoma Park, MD 20912", careNotes: "COPD, uses portable oxygen. Enjoys watching the news.", emergencyContact: "Derek Foster (son) +1-240-555-5656", cnaCount: 1, familyCount: 1, cnaNames: ["Priya Patel"], familyMembers: [{ name: "Derek Foster", role: "PrimaryContact" }] },
  { id: "dc-6", fullName: "Helen Greene", state: "MD", address: "22 Dogwood Terr, Chevy Chase, MD 20815", careNotes: "Early Alzheimer's. Gentle reminders help. Loves gardening photos.", emergencyContact: "Anita Greene (daughter) +1-301-555-6767", cnaCount: 1, familyCount: 1, cnaNames: ["Maria Lopez"], familyMembers: [{ name: "Anita Greene", role: "PrimaryContact" }] },
  { id: "dc-7", fullName: "James Simmons Sr.", state: "MD", address: "488 Oak Hill Rd, Potomac, MD 20854", careNotes: "Parkinson's, needs assistance with meals and mobility.", emergencyContact: "Paul Simmons (son-in-law) +1-240-555-7878", cnaCount: 1, familyCount: 1, cnaNames: ["James Robinson"], familyMembers: [{ name: "Paul Simmons", role: "Viewer" }] },
  { id: "dc-8", fullName: "Betty Taylor", state: "MD", address: "56 Birch Lane, Kensington, MD 20895", careNotes: "Hip replacement recovery. Physical therapy exercises daily.", emergencyContact: "Ruth Taylor (daughter) +1-301-555-8989", cnaCount: 1, familyCount: 1, cnaNames: ["Carlos Rivera"], familyMembers: [{ name: "Ruth Taylor", role: "PrimaryContact" }] },
  { id: "dc-9", fullName: "Charles Davis", state: "MD", address: "701 Magnolia Ave, Wheaton, MD 20902", careNotes: "Congestive heart failure. Fluid intake monitoring required.", emergencyContact: "Mark Davis (son) +1-240-555-9090", cnaCount: 1, familyCount: 1, cnaNames: ["Angela Brooks"], familyMembers: [{ name: "Mark Davis", role: "Viewer" }] },
  { id: "dc-10", fullName: "Soo-Jin Park", state: "MD", address: "118 Cherry Blossom Dr, Germantown, MD 20874", careNotes: "Vision impairment. Needs help reading medications and mail.", emergencyContact: "Diane Park (daughter) +1-301-555-0101", cnaCount: 1, familyCount: 1, cnaNames: ["Priya Patel"], familyMembers: [{ name: "Diane Park", role: "PrimaryContact" }] },
  { id: "dc-11", fullName: "Frank Morris", state: "MD", address: "245 Pine Hollow Ct, Olney, MD 20832", careNotes: "Post-surgery knee. Light exercises and wound care.", emergencyContact: "Steven Morris (son) +1-240-555-1122", cnaCount: 1, familyCount: 1, cnaNames: ["Denise Carter"], familyMembers: [{ name: "Steven Morris", role: "PrimaryContact" }] },
  { id: "dc-12", fullName: "Gloria Washington", state: "MD", address: "33 Sunset Blvd, Laurel, MD 20707", careNotes: "Hypertension. Blood pressure checks twice daily.", emergencyContact: "Tomeka Washington +1-301-555-2233", cnaCount: 1, familyCount: 0, cnaNames: ["Tomeka Washington"], familyMembers: [] },
  { id: "dc-13", fullName: "Arthur Mitchell", state: "MD", address: "600 Brookside Dr, Bowie, MD 20715", careNotes: "Advanced age. Companionship-focused care. Plays chess.", emergencyContact: "Rev. James +1-301-555-3344", cnaCount: 1, familyCount: 0, cnaNames: ["Tomeka Washington"], familyMembers: [] },
  { id: "dc-14", fullName: "Virginia Lee", state: "MD", address: "78 Clearwater Lane, Columbia, MD 21044", careNotes: "Mild depression. Encourage activity and social interaction.", emergencyContact: "Carol Peters +1-410-555-4455", cnaCount: 1, familyCount: 0, cnaNames: ["Carlos Rivera"], familyMembers: [] },
  { id: "dc-15", fullName: "Raymond Scott", state: "MD", address: "412 Meadow View Rd, Clarksburg, MD 20871", careNotes: "Type 2 diabetes. Insulin reminders. Prefers afternoon visits.", emergencyContact: "Michael Scott +1-240-555-5566", cnaCount: 1, familyCount: 0, cnaNames: ["Grace Okafor"], familyMembers: [] },
];

export type DemoCNA = {
  id: string;
  fullName: string;
  email: string;
  languages: string;
  clientCount: number;
  clientNames: string[];
};

export const demoCNAs: DemoCNA[] = [
  { id: "cna-1", fullName: "Maria Lopez", email: "maria@brightpath.demo", languages: "EN, ES", clientCount: 2, clientNames: ["Eleanor Williams", "Helen Greene"] },
  { id: "cna-2", fullName: "Angela Brooks", email: "angela@brightpath.demo", languages: "EN", clientCount: 2, clientNames: ["Robert Johnson", "Charles Davis"] },
  { id: "cna-3", fullName: "Denise Carter", email: "denise@brightpath.demo", languages: "EN", clientCount: 2, clientNames: ["Margaret Chen", "Frank Morris"] },
  { id: "cna-4", fullName: "James Robinson", email: "james.r@brightpath.demo", languages: "EN", clientCount: 2, clientNames: ["Dorothy Hayes", "James Simmons Sr."] },
  { id: "cna-5", fullName: "Priya Patel", email: "priya@brightpath.demo", languages: "EN", clientCount: 2, clientNames: ["Walter Foster", "Soo-Jin Park"] },
  { id: "cna-6", fullName: "Tomeka Washington", email: "tomeka@brightpath.demo", languages: "EN", clientCount: 2, clientNames: ["Gloria Washington", "Arthur Mitchell"] },
  { id: "cna-7", fullName: "Carlos Rivera", email: "carlos@brightpath.demo", languages: "EN, ES", clientCount: 2, clientNames: ["Betty Taylor", "Virginia Lee"] },
  { id: "cna-8", fullName: "Grace Okafor", email: "grace@brightpath.demo", languages: "EN", clientCount: 2, clientNames: ["Raymond Scott", "Eleanor Williams"] },
];

export type DemoFamilyMembership = {
  id: string;
  familyName: string;
  familyEmail: string;
  clientName: string;
  role: string;
};

export const demoFamilyMemberships: DemoFamilyMembership[] = [
  { id: "fm-1", familyName: "Sarah Williams", familyEmail: "sarah.williams@demo.com", clientName: "Eleanor Williams", role: "PrimaryContact" },
  { id: "fm-2", familyName: "David Williams", familyEmail: "david.williams@demo.com", clientName: "Eleanor Williams", role: "Viewer" },
  { id: "fm-3", familyName: "Lisa Johnson", familyEmail: "lisa.johnson@demo.com", clientName: "Robert Johnson", role: "PrimaryContact" },
  { id: "fm-4", familyName: "Kevin Chen", familyEmail: "kevin.chen@demo.com", clientName: "Margaret Chen", role: "PrimaryContact" },
  { id: "fm-5", familyName: "Monica Hayes", familyEmail: "monica.hayes@demo.com", clientName: "Dorothy Hayes", role: "PrimaryContact" },
  { id: "fm-6", familyName: "Derek Foster", familyEmail: "derek.foster@demo.com", clientName: "Walter Foster", role: "PrimaryContact" },
  { id: "fm-7", familyName: "Anita Greene", familyEmail: "anita.greene@demo.com", clientName: "Helen Greene", role: "PrimaryContact" },
  { id: "fm-8", familyName: "Paul Simmons", familyEmail: "paul.simmons@demo.com", clientName: "James Simmons Sr.", role: "Viewer" },
  { id: "fm-9", familyName: "Ruth Taylor", familyEmail: "ruth.taylor@demo.com", clientName: "Betty Taylor", role: "PrimaryContact" },
  { id: "fm-10", familyName: "Mark Davis", familyEmail: "mark.davis@demo.com", clientName: "Charles Davis", role: "Viewer" },
  { id: "fm-11", familyName: "Diane Park", familyEmail: "diane.park@demo.com", clientName: "Soo-Jin Park", role: "PrimaryContact" },
  { id: "fm-12", familyName: "Steven Morris", familyEmail: "steven.morris@demo.com", clientName: "Frank Morris", role: "PrimaryContact" },
];

// CNA portal: Maria's assigned clients
export type DemoCnaAssignment = {
  id: string;
  clientName: string;
  clientState: string;
  clientAddress: string;
};

export const demoCnaAssignments: DemoCnaAssignment[] = [
  { id: "assign-1", clientName: "Eleanor Williams", clientState: "MD", clientAddress: "812 Willow Lane, Bethesda, MD 20814" },
  { id: "assign-2", clientName: "Helen Greene", clientState: "MD", clientAddress: "22 Dogwood Terr, Chevy Chase, MD 20815" },
];

// Family portal: Sarah's linked clients
export type DemoFamilyClient = {
  id: string;
  role: string;
  clientName: string;
  clientAddress: string;
};

export const demoFamilyClients: DemoFamilyClient[] = [
  { id: "fc-1", role: "PrimaryContact", clientName: "Eleanor Williams", clientAddress: "812 Willow Lane, Bethesda, MD 20814" },
];

// Admin: all users
export type DemoAdminUser = {
  id: string;
  fullName: string;
  email: string;
  roleLabel: string;
  agencyName: string;
};

export const demoAdminUsers: DemoAdminUser[] = [
  { id: "u-1", fullName: "KairosCare Admin", email: "admin@kairoscare.com", roleLabel: "KairosCare Admin", agencyName: "-" },
  { id: "u-2", fullName: "Patricia Doyle", email: "owner@brightpath.demo", roleLabel: "Agency Owner", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-3", fullName: "Janet Simmons", email: "janet@brightpath.demo", roleLabel: "Agency Staff", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-4", fullName: "Maria Lopez", email: "maria@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-5", fullName: "Angela Brooks", email: "angela@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-6", fullName: "Denise Carter", email: "denise@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-7", fullName: "James Robinson", email: "james.r@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-8", fullName: "Priya Patel", email: "priya@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-9", fullName: "Tomeka Washington", email: "tomeka@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-10", fullName: "Carlos Rivera", email: "carlos@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-11", fullName: "Grace Okafor", email: "grace@brightpath.demo", roleLabel: "Caregiver", agencyName: "Bright Care Home Health (DMV)" },
  { id: "u-12", fullName: "Sarah Williams", email: "sarah.williams@demo.com", roleLabel: "Primary Family", agencyName: "-" },
  { id: "u-13", fullName: "David Williams", email: "david.williams@demo.com", roleLabel: "Family Viewer", agencyName: "-" },
  { id: "u-14", fullName: "Lisa Johnson", email: "lisa.johnson@demo.com", roleLabel: "Primary Family", agencyName: "-" },
  { id: "u-15", fullName: "Kevin Chen", email: "kevin.chen@demo.com", roleLabel: "Primary Family", agencyName: "-" },
];

// Admin: audit log rows
export type DemoAuditRow = {
  id: string;
  timestamp: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  agencyName: string;
};

function recentTimestamp(daysAgo: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString().replace("T", " ").slice(0, 19);
}

export const demoAuditRows: DemoAuditRow[] = [
  { id: "a-1", timestamp: recentTimestamp(0, 11), actorName: "Maria Lopez", action: "care_update.created", entityType: "CareUpdate", entityId: "cu-demo-1", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-2", timestamp: recentTimestamp(0, 10), actorName: "Maria Lopez", action: "visit.started", entityType: "Visit", entityId: "v-demo-1", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-3", timestamp: recentTimestamp(0, 10), actorName: "Angela Brooks", action: "care_update.created", entityType: "CareUpdate", entityId: "cu-demo-2", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-4", timestamp: recentTimestamp(0, 9), actorName: "Sarah Williams", action: "reaction.created", entityType: "Reaction", entityId: "r-demo-1", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-5", timestamp: recentTimestamp(1, 14), actorName: "Patricia Doyle", action: "client.viewed", entityType: "Client", entityId: "dc-1", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-6", timestamp: recentTimestamp(1, 11), actorName: "Denise Carter", action: "care_update.created", entityType: "CareUpdate", entityId: "cu-demo-3", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-7", timestamp: recentTimestamp(1, 10), actorName: "Carlos Rivera", action: "visit.completed", entityType: "Visit", entityId: "v-demo-3", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-8", timestamp: recentTimestamp(2, 15), actorName: "KairosCare Admin", action: "agency.viewed", entityType: "Organization", entityId: DEMO_AGENCY_ID, agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-9", timestamp: recentTimestamp(2, 10), actorName: "James Robinson", action: "care_update.created", entityType: "CareUpdate", entityId: "cu-demo-4", agencyName: "Bright Care Home Health (DMV)" },
  { id: "a-10", timestamp: recentTimestamp(3, 11), actorName: "system", action: "seed.client.created", entityType: "Client", entityId: "dc-3", agencyName: "Bright Care Home Health (DMV)" },
];

// Admin: agencies list
export type DemoAdminAgency = {
  id: string;
  name: string;
  email: string;
  phone: string;
  clientCount: number;
  userCount: number;
  tier: string;
};

export const demoAdminAgencies: DemoAdminAgency[] = [
  { id: DEMO_AGENCY_ID, name: "Bright Care Home Health (DMV)", email: "owner@brightpath.demo", phone: "+1-240-555-0188", clientCount: 15, userCount: 23, tier: "Pilot" },
];

// Aggregate counts for dashboards
export const demoCounts = {
  clients: 15,
  cnas: 8,
  careUpdates: 99,
  familySeats: 12,
  reactions: 18,
  comments: 6,
  visits: 29,
  agencies: 1,
  users: 23,
  auditRows: 148,
};
