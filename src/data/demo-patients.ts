// Static demo data for the marketing /demo page. Pure client-side — no DB,
// no API, no auth. Three patients with distinct vibes so a buyer can flip
// between them and feel the product carry different shifts of a real day.
//
// IMPORTANT: this is the *only* place demo content lives. The CNA portal mock
// and the family-reply phone view both read from here so they stay in sync.

export type Mood = "happy" | "calm" | "tired" | "anxious" | "unwell";

export type DemoLogKind = "checkin" | "mood" | "meal" | "activity" | "note" | "photo" | "endshift";

export type DemoLog = {
  id: string;
  kind: DemoLogKind;
  time: string;       // human-readable "10:04 AM"
  label: string;      // headline used inside the CNA timeline card
  body: string;       // 1-2 sentence body copy
  mood?: Mood;        // attached to mood + endshift cards
  reaction?: string;  // optional family reaction line
};

export type DemoPatient = {
  id: string;
  fullName: string;
  short: string;
  initials: string;
  ageBand: string;
  cna: string;
  agency: string;
  startedAt: string;     // visit start
  status: "in-progress" | "complete";
  dayMoodTrend: Mood[];  // 7-day mood semaphore (rendered as little dots)
  logs: DemoLog[];
  familyMessage: { name: string; relation: string; body: string };
};

export const demoPatients: DemoPatient[] = [
  {
    id: "eleanor",
    fullName: "Eleanor Williams",
    short: "Eleanor",
    initials: "EW",
    ageBand: "84 · lives with daughter Sarah",
    cna: "Maria",
    agency: "BrightPath Home Care",
    startedAt: "9:55 AM",
    status: "complete",
    dayMoodTrend: ["calm", "happy", "calm", "tired", "calm", "happy", "happy"],
    logs: [
      {
        id: "e-1",
        kind: "checkin",
        time: "10:04 AM",
        label: "Maria checked in",
        body: "Eleanor was sitting in her chair by the window. Calm and smiling when I came in.",
        mood: "calm",
      },
      {
        id: "e-2",
        kind: "meal",
        time: "10:29 AM",
        label: "Breakfast",
        body: "Oatmeal with blueberries and herbal tea. Ate most of the bowl on her own.",
      },
      {
        id: "e-3",
        kind: "activity",
        time: "11:12 AM",
        label: "Music & walk",
        body: "Played Etta James on the kitchen speaker. Short walk to the kitchen and back, no cane needed.",
      },
      {
        id: "e-4",
        kind: "endshift",
        time: "11:48 AM",
        label: "End of shift",
        body: "Good visit. Eleanor was in good spirits and asked when I'd be back tomorrow.",
        mood: "happy",
        reaction: "Sarah sent thanks · 11:50 AM",
      },
    ],
    familyMessage: {
      name: "Sarah",
      relation: "Daughter",
      body: "Thank you Maria. The music part made my whole day. See you tomorrow.",
    },
  },
  {
    id: "robert",
    fullName: "Robert Johnson",
    short: "Robert",
    initials: "RJ",
    ageBand: "79 · son Kevin is primary contact",
    cna: "Andre",
    agency: "BrightPath Home Care",
    startedAt: "12:10 PM",
    status: "in-progress",
    dayMoodTrend: ["tired", "calm", "tired", "tired", "anxious", "tired", "calm"],
    logs: [
      {
        id: "r-1",
        kind: "checkin",
        time: "12:18 PM",
        label: "Andre checked in",
        body: "Robert was already awake but still in his recliner. A little quiet today.",
        mood: "tired",
      },
      {
        id: "r-2",
        kind: "meal",
        time: "12:42 PM",
        label: "Lunch — refused",
        body: "Offered the chicken soup and crackers from the fridge. He waved it off and asked for tea instead. I'll re-offer at 2pm.",
      },
      {
        id: "r-3",
        kind: "activity",
        time: "1:05 PM",
        label: "TV & rest",
        body: "Put on the Orioles game. He nodded along but dozed off after 20 minutes. Letting him rest.",
      },
      {
        id: "r-4",
        kind: "note",
        time: "1:34 PM",
        label: "Note for the office",
        body: "Robert seemed restless after his nap — kept asking what day it was. Nothing alarming, just flagging so the family knows.",
        reaction: "Kevin asked about medication timing · 1:38 PM",
      },
    ],
    familyMessage: {
      name: "Kevin",
      relation: "Son",
      body: "Appreciate the flag, Andre. Can the office double-check whether his memantine dose was moved? Thanks for being thoughtful.",
    },
  },
  {
    id: "margaret",
    fullName: "Margaret Chen",
    short: "Margaret",
    initials: "MC",
    ageBand: "81 · daughter Linh in California",
    cna: "Priya",
    agency: "BrightPath Home Care",
    startedAt: "8:30 AM",
    status: "in-progress",
    dayMoodTrend: ["anxious", "calm", "anxious", "calm", "happy", "calm", "anxious"],
    logs: [
      {
        id: "m-1",
        kind: "checkin",
        time: "8:38 AM",
        label: "Priya checked in",
        body: "Margaret was up and dressed. A little fidgety — said she had a 'strange night' but couldn't say more.",
        mood: "anxious",
      },
      {
        id: "m-2",
        kind: "meal",
        time: "9:02 AM",
        label: "Breakfast",
        body: "Scrambled eggs, toast, and orange juice. Ate everything. Asked for a second cup of coffee.",
      },
      {
        id: "m-3",
        kind: "activity",
        time: "9:48 AM",
        label: "Called Linh",
        body: "Helped her video-call her daughter. They talked for about 12 minutes. Margaret asked about her grandkids twice.",
        reaction: "Linh reacted with a heart · 10:01 AM",
      },
      {
        id: "m-4",
        kind: "photo",
        time: "10:20 AM",
        label: "Photo: garden",
        body: "Took a photo of the morning glories Margaret has been watching all week. She wanted Linh to see them.",
      },
    ],
    familyMessage: {
      name: "Linh",
      relation: "Daughter",
      body: "Priya — thank you. Calling her always settles her down. The garden photo is going on my fridge.",
    },
  },
];

export function findPatient(id: string): DemoPatient | undefined {
  return demoPatients.find((p) => p.id === id);
}
