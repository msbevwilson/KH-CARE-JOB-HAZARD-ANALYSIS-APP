// ─── Core domain types ────────────────────────────────────────────────────────

export type NavKey    = "dashboard" | "halls" | "jhas" | "users" | "settings";
export type RiskLevel = "Low" | "Medium" | "High";
export type JHAStatus = "Pending" | "Approved" | "Rejected";
export type UserRole  = "Admin" | "Supervisor" | "Worker";

export type Gender = "Male" | "Female";

export type AuthUser = {
  id: string; name: string; initials: string; email: string;
  role: UserRole; password?: string; mustChangePassword?: boolean;
  hallId?: string; congregation?: string; phoneNumbers?: string[]; gender?: Gender;
};

export type KingdomHall = {
  id: string; name: string; address?: string;
  phone?: string; gpsCoordinates?: string; congregation: string[];
};

export type JHARecord = {
  ref: string; job: string; submittedBy: string; site: string;
  date: string; isoDate?: string; status: JHAStatus; risk: RiskLevel;
  supervisor?: string; steps?: StepEntry[];
};

export type SortKey  = "ref" | "job" | "site" | "submittedBy" | "date" | "risk" | "status";
export type JHAFilter = { status?: JHAStatus; risk?: RiskLevel };

export type HazardCategory =
  | "Physical" | "Chemical" | "Biological" | "Ergonomic" | "Psychological"
  | "People" | "Equipment" | "Energy" | "Work Environment";

export type ControlType = "Elimination" | "Substitution" | "Engineering" | "Administrative" | "PPE";

export type HazardEntry = {
  id: string; description: string; risk: RiskLevel; control: string; photos: string[];
  category?: HazardCategory; controlType?: ControlType;
};

export type StepEntry = { id: string; description: string; hazards: HazardEntry[] };

export type PrintData = {
  ref: string; job: string; site: string; date: string;
  submittedBy: string; supervisor?: string;
  status?: JHAStatus; risk?: RiskLevel;
  steps?: StepEntry[];
};

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = "pending" | "high_risk" | "approved" | "rejected";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  jhaRef: string;
  timestamp: string;
};

// ─── Sort / order helpers ─────────────────────────────────────────────────────

export const RISK_ORDER:   Record<RiskLevel, number>  = { Low: 0, Medium: 1, High: 2 };
export const STATUS_ORDER: Record<JHAStatus, number>  = { Pending: 0, Approved: 1, Rejected: 2 };

// ─── Style maps ───────────────────────────────────────────────────────────────

export const riskColors: Record<RiskLevel, { bg: string; text: string; border: string; dot: string }> = {
  Low:    { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500" },
  Medium: { bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200",   dot: "bg-amber-400"   },
  High:   { bg: "bg-red-50",     text: "text-red-800",     border: "border-red-200",     dot: "bg-red-500"     },
};

export const roleStyles: Record<UserRole, { bg: string; text: string; border: string }> = {
  Admin:      { bg: "bg-purple-50",  text: "text-purple-800",  border: "border-purple-200"  },
  Supervisor: { bg: "bg-blue-50",    text: "text-blue-800",    border: "border-blue-200"    },
  Worker:     { bg: "bg-secondary",  text: "text-foreground",  border: "border-border"      },
};

// ─── Role helpers ─────────────────────────────────────────────────────────────

export const canCreateJHA   = (role: UserRole) => role !== "Worker";
export const canDeleteJHA   = (role: UserRole) => role !== "Worker";
export const canEditJHA     = (role: UserRole, status: JHAStatus) => role !== "Worker" || status === "Pending";
export const canApproveJHA  = (role: UserRole) => role !== "Worker";
export const canManageUsers = (role: UserRole) => role === "Admin";
export const canManageHalls = (role: UserRole) => role === "Admin";

export const visibleNavKeys = (role: UserRole): NavKey[] =>
  role === "Worker"
    ? ["halls", "jhas"]
    : role === "Admin"
    ? ["dashboard", "halls", "jhas", "users", "settings"]
    : ["dashboard", "halls", "jhas", "settings"];

// ─── Utility functions ────────────────────────────────────────────────────────

export const uid = () => Math.random().toString(36).slice(2, 8);

export const generateTempPassword = () => {
  const words = ["safety", "hazard", "risk", "care", "check"];
  return words[Math.floor(Math.random() * words.length)] + Math.floor(100 + Math.random() * 900);
};

export const formatDisplayDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-AU", { month: "short", day: "numeric" });
  } catch { return iso; }
};

export const blankHazard = (): HazardEntry => ({ id: uid(), description: "", risk: "Low", control: "", photos: [] });
export const blankStep   = (): StepEntry   => ({ id: uid(), description: "", hazards: [blankHazard()] });

// ─── JHA form reference data ──────────────────────────────────────────────────

export const HAZARD_CATEGORIES: HazardCategory[] = [
  "Physical", "Chemical", "Biological", "Ergonomic", "Psychological",
  "People", "Equipment", "Energy", "Work Environment",
];

export const CONTROL_TYPES: { value: ControlType; label: string; short: string }[] = [
  { value: "Elimination",    label: "Elimination – Remove the hazard",         short: "Elimination"    },
  { value: "Substitution",   label: "Substitution – Replace the hazard",       short: "Substitution"   },
  { value: "Engineering",    label: "Engineering – Isolate from the hazard",   short: "Engineering"    },
  { value: "Administrative", label: "Administrative – Change how people work", short: "Administrative" },
  { value: "PPE",            label: "PPE – Reduce worker exposure",            short: "PPE"            },
];

export const CATEGORY_PROMPTS: Partial<Record<HazardCategory, string[]>> = {
  Physical:           ["Could workers be exposed to vibration, noise, or extreme temperatures?", "Could workers be near exposed electrical connections?", "Could workers be exposed to radiation (e.g. UV)?"],
  Chemical:           ["Could workers be exposed to dusts, smoke, fumes, vapors, or gases?", "Could workers be exposed to liquids, mists, or chemical sprays?"],
  Biological:         ["Could workers be exposed to mold, insects, animals, or bodily fluids?", "Is there a risk from unsafe water or food?"],
  Ergonomic:          ["Could workers be exposed to overexertion or awkward postures?", "Is there repetitive motion or excessive force involved?"],
  Psychological:      ["Could workers be exposed to excessive stress, pressure, or fatigue?"],
  People:             ["Could unsafe actions develop (distraction, shortcuts, hurrying)?", "Could lack of training or experience put workers at risk?"],
  Equipment:          ["Could workers be at risk when using ladders, tools, or machinery?", "Are there pinch points, moving parts, or sharp tools?"],
  Energy:             ["Could workers be at risk from accidental start-up of equipment?", "Is there a fire or explosion risk from flammable materials?"],
  "Work Environment": ["Could workers fall from a height?", "Could workers slip, trip, or be struck by falling objects?", "Is ventilation or lighting adequate?"],
};

export const EXAMPLE_JHA: { jobName: string; site: string; supervisor: string; steps: StepEntry[] } = {
  jobName: "Changing Tile Floor",
  site: "Kingdom Hall, Auxiliary Room",
  supervisor: "Alan Actsafe",
  steps: [
    {
      id: uid(), description: "Move furniture out of the room",
      hazards: [
        { id: uid(), description: "Back injuries from repetitive lifting or moving of heavy items", risk: "Medium", category: "Ergonomic", control: "Review safe lifting procedure; workers to perform team lifts of heavy items", controlType: "Administrative", photos: [] },
      ],
    },
    {
      id: uid(), description: "Pull up old tiles; remove old mortar",
      hazards: [
        { id: uid(), description: "Eye injuries from flying debris; cuts from broken tiles", risk: "High", category: "Equipment", control: "Wear eye protection, work gloves, and appropriate respiratory protection", controlType: "PPE", photos: [] },
        { id: uid(), description: "Inhalation of dust from tile and mortar removal", risk: "Medium", category: "Chemical", control: "Wear appropriate respiratory protection (P2 dust mask); ensure ventilation", controlType: "PPE", photos: [] },
      ],
    },
    {
      id: uid(), description: "Apply mortar; install new tiles",
      hazards: [
        { id: uid(), description: "Eye injuries from flying debris; cuts from sharp tile edges; knee injuries", risk: "High", category: "Equipment", control: "Wear eye protection, work gloves, and knee pads", controlType: "PPE", photos: [] },
        { id: uid(), description: "Dust from mixing mortar; chemical exposure", risk: "Medium", category: "Chemical", control: "Wear respiratory protection; mix in ventilated area", controlType: "Engineering", photos: [] },
        { id: uid(), description: "Awkward posture; repetitive motion causing strain", risk: "Low", category: "Ergonomic", control: "Take stretch breaks; rotate workers to reduce exposure time", controlType: "Administrative", photos: [] },
      ],
    },
  ],
};

// ─── Admin screen constants ───────────────────────────────────────────────────

export const ROLE_OPTIONS: UserRole[] = ["Worker", "Supervisor", "Admin"];

// ─── Navigation and page metadata ────────────────────────────────────────────

export const PAGE_TITLES: Record<NavKey, string> = {
  dashboard: "Safety Dashboard",
  halls:     "Kingdom Halls",
  jhas:      "Job Hazard Forms",
  users:     "Users",
  settings:  "Settings",
};

export const PAGE_SUBS: Record<NavKey, string> = {
  dashboard: "Last updated: May 23, 2026 · 10:47 AM",
  halls:     "Details",
  jhas:      "active records · sorted by date",
  users:     "Manage users and access",
  settings:  "Platform configuration",
};

// ─── JHA table columns ────────────────────────────────────────────────────────

export const TABLE_COLS: { label: string; key: SortKey | null }[] = [
  { label: "Reference",    key: "ref"         },
  { label: "Job Name",     key: "job"         },
  { label: "Kingdom Hall", key: "site"        },
  { label: "Submitted By", key: "submittedBy" },
  { label: "Date",         key: "date"        },
  { label: "Risk",         key: "risk"        },
  { label: "Status",       key: "status"      },
  { label: "",             key: null          },
];
