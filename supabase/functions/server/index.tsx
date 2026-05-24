import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);


// ─── Password policy ─────────────────────────────────────────────────────────

function validatePassword(password: string): string | null {
  if (password.length < 8)          return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password))      return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password))      return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password))      return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character.";
  return null;
}

// ─── Password hashing (PBKDF2 + legacy SHA-256 fallback) ─────────────────────

/** Fast SHA-256 — kept only for verifying pre-migration hashes. */
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash a password with PBKDF2-SHA256, random 16-byte salt, 100k iterations.
 * Stored format: "pbkdf2:<saltHex>:<hashHex>"
 */
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key  = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" }, key, 256);
  return `pbkdf2:${toHex(salt.buffer)}:${toHex(bits)}`;
}

/**
 * Verify a password against a stored hash.
 * Supports both PBKDF2 (new) and plain SHA-256 (legacy).
 */
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith("pbkdf2:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const salt = new Uint8Array(parts[1].match(/.{2}/g)!.map(b => parseInt(b, 16)));
    const key  = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" }, key, 256);
    return toHex(bits) === parts[2];
  }
  // Legacy SHA-256 (unsalted) — verified then auto-upgraded at login
  return (await sha256(password)) === stored;
}


// ─── Bootstrap: create real tables if they don't exist, fall back to KV ──────

const DB_READY_KEY = "khcare_db_ready_v3";

async function getDB() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function tablesExist(): Promise<boolean> {
  const supabase = await getDB();
  const { error } = await supabase
    .from("khcare_users")
    .select("id")
    .limit(1);
  return !error;
}

// ─── Auto-migration: adds new columns if they don't exist ─────────────────────

async function migrateDB() {
  try {
    const dbUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!dbUrl) return;
    // @ts-ignore — npm:postgres works in Deno edge functions
    const { default: postgres } = await import("npm:postgres@3");
    const sql = postgres(dbUrl, { max: 1, ssl: "require" });
    await sql`ALTER TABLE IF EXISTS khcare_users ADD COLUMN IF NOT EXISTS hall_id       TEXT`;
    await sql`ALTER TABLE IF EXISTS khcare_users ADD COLUMN IF NOT EXISTS congregation  TEXT`;
    await sql`ALTER TABLE IF EXISTS khcare_users ADD COLUMN IF NOT EXISTS phone_numbers TEXT[]`;
    await sql`ALTER TABLE IF EXISTS khcare_users ADD COLUMN IF NOT EXISTS gender        TEXT`;
    await sql.end();
  } catch (e) {
    console.warn("migrateDB skipped:", (e as Error).message);
  }
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_HALLS = [
  { id: "kh1", name: "Westfield",   address: "42 Westfield Rd, Industrial Park", phone: "(02) 9800 1111", gpsCoordinates: "-33.8765, 151.0200", congregation: ["Westfield English", "Westfield Spanish"] },
  { id: "kh2", name: "Northgate",   address: "18 Tower St, Northgate",           phone: "(02) 9800 2222", gpsCoordinates: "-33.7950, 151.1820", congregation: ["Northgate English"] },
  { id: "kh3", name: "Harbourside", address: "7 Depot Ln, Harbourside",          phone: "(02) 9800 3333", gpsCoordinates: "-33.8688, 151.2093", congregation: ["Harbourside English", "Harbourside Mandarin", "Harbourside ASL"] },
  { id: "kh4", name: "Portside",    address: "33 Yards Ave, Portside",           phone: "(02) 9800 4444", gpsCoordinates: "-33.9200, 151.1650", congregation: ["Portside English"] },
  { id: "kh5", name: "Midpark",     address: "91 Factory Blvd, Midpark",         phone: "(02) 9800 5555", gpsCoordinates: "-33.8400, 151.0700", congregation: ["Midpark English", "Midpark Portuguese"] },
];

async function buildSeedUsers() {
  const hash = await hashPassword("khcare");
  return [
    { id: "su", name: "Super Admin",        initials: "SA", email: "admin@khcare.io",     role: "Admin",      passwordHash: hash, mustChangePassword: false },
    { id: "jp", name: "J. Patterson",       initials: "JP", email: "patterson@khcare.io", role: "Supervisor", passwordHash: hash, mustChangePassword: false },
    { id: "md", name: "Marcus D. Holloway", initials: "MH", email: "holloway@khcare.io",  role: "Worker",     passwordHash: hash, mustChangePassword: false },
  ];
}

const SEED_JHAS = [
  {
    ref: "JHA-2026-0447", job: "High-Voltage Panel Replacement – Unit 3B",
    submittedBy: "Marcus D. Holloway", supervisor: "J. Patterson",
    site: "Westfield", date: "May 23", isoDate: "2026-05-23",
    status: "Pending", risk: "High",
    steps: [
      { id: "447-s1", description: "Isolate and lock out the power supply", hazards: [
        { id: "447-h1", description: "Electric shock from live conductors during isolation attempt", risk: "High", category: "Energy", controlType: "Engineering", control: "Verify isolation with approved voltage tester; apply LOTO before any contact", photos: [] },
        { id: "447-h2", description: "Arc flash during switching operations", risk: "High", category: "Energy", controlType: "PPE", control: "Wear Class 2 arc-flash PPE; stand to the side of the panel during switching", photos: [] },
      ]},
      { id: "447-s2", description: "Remove existing panel and wiring", hazards: [
        { id: "447-h3", description: "Residual stored energy in capacitors", risk: "High", category: "Energy", controlType: "Engineering", control: "Discharge capacitors and confirm zero-energy state before removal", photos: [] },
        { id: "447-h4", description: "Lacerations from sharp metal edges and exposed conductors", risk: "Low", category: "Equipment", controlType: "PPE", control: "Wear cut-resistant gloves; use insulated tools throughout", photos: [] },
      ]},
      { id: "447-s3", description: "Install new panel and connect wiring", hazards: [
        { id: "447-h5", description: "Incorrect wiring causing fault or fire on re-energisation", risk: "High", category: "Energy", controlType: "Administrative", control: "Second-person verification of all terminations against approved drawings before sign-off", photos: [] },
        { id: "447-h6", description: "Restricted movement in confined switchroom causing ergonomic strain", risk: "Medium", category: "Work Environment", controlType: "Engineering", control: "Use mirror and extended-reach tools; rotate workers every 30 minutes", photos: [] },
      ]},
      { id: "447-s4", description: "Test, commission, and restore power", hazards: [
        { id: "447-h7", description: "Arc flash during live testing phase", risk: "High", category: "Energy", controlType: "PPE", control: "Maintain arc-flash PPE; keep exclusion zone clear during energisation", photos: [] },
        { id: "447-h8", description: "Unexpected fault during commissioning causing secondary injury", risk: "Medium", category: "Energy", controlType: "Administrative", control: "Conduct commissioning to written procedure; assign dedicated safety observer", photos: [] },
      ]},
    ],
  },
  {
    ref: "JHA-2026-0446", job: "Roof Access Inspection – Block C",
    submittedBy: "Sarah Chen", supervisor: "J. Patterson",
    site: "Northgate", date: "May 22", isoDate: "2026-05-22",
    status: "Approved", risk: "Medium",
    steps: [
      { id: "446-s1", description: "Pre-work briefing, permit check, and PPE inspection", hazards: [
        { id: "446-h1", description: "Workers proceeding without correct PPE or valid permit", risk: "Medium", category: "People", controlType: "Administrative", control: "Safety officer to verify permit and inspect all PPE before gate access is granted", photos: [] },
      ]},
      { id: "446-s2", description: "Ascend to roof via fixed ladder and hatch", hazards: [
        { id: "446-h2", description: "Fall from ladder during ascent or descent", risk: "High", category: "Work Environment", controlType: "Engineering", control: "Maintain three points of contact; use fixed ladder with safety cage; attach fall-arrest lanyard", photos: [] },
        { id: "446-h3", description: "Dropped tools striking persons below", risk: "Medium", category: "Equipment", controlType: "Administrative", control: "Establish exclusion zone at ladder base; tool lanyards required for all hand tools", photos: [] },
      ]},
      { id: "446-s3", description: "Conduct visual inspection of roof surface and drainage", hazards: [
        { id: "446-h4", description: "Fall through fragile or aged roof membrane", risk: "High", category: "Work Environment", controlType: "Engineering", control: "Do not step off designated walkway boards; use crawling boards over suspect areas", photos: [] },
        { id: "446-h5", description: "Heat stress from sun exposure during inspection", risk: "Medium", category: "Physical", controlType: "Administrative", control: "Schedule work before 10 AM; provide shade, water, and 20-minute rest breaks per hour", photos: [] },
      ]},
    ],
  },
  {
    ref: "JHA-2026-0445", job: "Chemical Storage Audit – Warehouse 2",
    submittedBy: "James K. Okafor", supervisor: "Sarah Chen",
    site: "Harbourside", date: "May 21", isoDate: "2026-05-21",
    status: "Approved", risk: "Low",
    steps: [
      { id: "445-s1", description: "Review SDS register and storage layout plan", hazards: [
        { id: "445-h1", description: "Out-of-date or missing SDS leading to incorrect hazard assessment", risk: "Low", category: "Chemical", controlType: "Administrative", control: "Cross-check SDS register against current stock list; flag discrepancies to warehouse manager", photos: [] },
      ]},
      { id: "445-s2", description: "Physical inspection of chemical storage bays", hazards: [
        { id: "445-h2", description: "Inhalation of chemical vapours from open or damaged containers", risk: "Low", category: "Chemical", controlType: "PPE", control: "Wear P2 half-face respirator; ensure warehouse roller doors are open for cross-ventilation", photos: [] },
        { id: "445-h3", description: "Skin or eye contact from incidental spill contact", risk: "Low", category: "Chemical", controlType: "PPE", control: "Wear nitrile gloves and safety glasses; eye-wash station confirmed accessible before entry", photos: [] },
      ]},
    ],
  },
];

// ─── KV helpers (always-available storage layer) ─────────────────────────────

async function kvEnsureSeeded() {
  const already = await kv.get("khcare_seeded_v2");
  if (already) return;
  const users = await buildSeedUsers();
  await kv.set("khcare_users",   users);
  await kv.set("khcare_halls",   SEED_HALLS);
  await kv.set("khcare_jhas",    SEED_JHAS);
  await kv.set("khcare_seeded_v2", true);
}

async function kvGetUsers():  Promise<any[]> { return (await kv.get("khcare_users"))  ?? []; }
async function kvGetHalls():  Promise<any[]> { return (await kv.get("khcare_halls"))  ?? []; }
async function kvGetJHAs():   Promise<any[]> { return (await kv.get("khcare_jhas"))   ?? []; }

// ─── DB helpers (real tables, used when migration has been run) ───────────────

function toUser(row: any) {
  return {
    id:                 row.id,
    name:               row.name,
    initials:           row.initials,
    email:              row.email,
    role:               row.role,
    mustChangePassword: row.must_change_password ?? row.mustChangePassword ?? false,
    hallId:             row.hall_id       ?? row.hallId       ?? undefined,
    congregation:       row.congregation  ?? undefined,
    phoneNumbers:       row.phone_numbers ?? row.phoneNumbers ?? undefined,
    gender:             row.gender        ?? undefined,
  };
}

function toHall(row: any) {
  return {
    id:             row.id,
    name:           row.name,
    address:        row.address        ?? undefined,
    phone:          row.phone          ?? undefined,
    gpsCoordinates: row.gpsCoordinates ?? undefined,
    congregation:   row.congregation   ?? [],
  };
}

function toJHA(row: any) {
  return {
    ref:         row.ref,
    job:         row.job,
    submittedBy: row.submitted_by ?? row.submittedBy ?? "",
    supervisor:  row.supervisor   ?? undefined,
    site:        row.site,
    date:        row.date,
    isoDate:     row.iso_date     ?? row.isoDate ?? undefined,
    status:      row.status,
    risk:        row.risk,
    steps:       row.steps        ?? [],
  };
}

// ─── Unified data access: real tables preferred, KV fallback ─────────────────

async function getUsers(): Promise<any[]> {
  if (await tablesExist()) {
    const { data } = await (await getDB()).from("khcare_users").select("*").order("created_at");
    if (data) return data.map(toUser);
  }
  await kvEnsureSeeded();
  return (await kvGetUsers()).map(({ passwordHash: _, ...u }) => u);
}

async function getHalls(): Promise<any[]> {
  if (await tablesExist()) {
    const { data } = await (await getDB()).from("khcare_halls").select("*").order("name");
    if (data) return data.map(toHall);
  }
  await kvEnsureSeeded();
  return (await kvGetHalls()).map(toHall);
}

async function getJHAs(): Promise<any[]> {
  if (await tablesExist()) {
    const { data } = await (await getDB()).from("khcare_jhas").select("*").order("created_at", { ascending: false });
    if (data) return data.map(toJHA);
  }
  await kvEnsureSeeded();
  return (await kvGetJHAs()).map(toJHA);
}

// ─── Health ───────────────────────────────────────────────────────────────────

app.get("/make-server-a2aa1d47/health", async (c) => {
  const usingRealTables = await tablesExist();
  if (usingRealTables) await migrateDB();
  return c.json({ status: "ok", storage: usingRealTables ? "postgres" : "kv" });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

app.post("/make-server-a2aa1d47/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: "Missing credentials" }, 400);

  if (await tablesExist()) {
    const supabase = await getDB();
    const { data: row, error } = await supabase
      .from("khcare_users")
      .select("*")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (error) return c.json({ error: "Database error: " + error.message }, 500);
    if (!row)  return c.json({ error: "Invalid email or password" }, 401);
    if (!(await verifyPassword(password, row.password_hash))) return c.json({ error: "Invalid email or password" }, 401);

    // Auto-upgrade legacy SHA-256 hash to PBKDF2 on successful login
    if (!row.password_hash.startsWith("pbkdf2:")) {
      const upgraded = await hashPassword(password);
      await supabase.from("khcare_users").update({ password_hash: upgraded }).eq("id", row.id);
    }

    return c.json({ user: toUser(row) });
  }

  // KV fallback
  await kvEnsureSeeded();
  const users: any[] = await kvGetUsers();
  const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return c.json({ error: "Invalid email or password" }, 401);
  if (!(await verifyPassword(password, user.passwordHash))) return c.json({ error: "Invalid email or password" }, 401);

  // Auto-upgrade legacy hash in KV
  if (!user.passwordHash.startsWith("pbkdf2:")) {
    user.passwordHash = await hashPassword(password);
    await kv.set("khcare_users", users);
  }

  const { passwordHash: _, ...safeUser } = user;
  return c.json({ user: safeUser });
});


// ─── Users ────────────────────────────────────────────────────────────────────

app.get("/make-server-a2aa1d47/users", async (c) => {
  return c.json(await getUsers());
});

app.post("/make-server-a2aa1d47/users", async (c) => {
  const body = await c.req.json();
  const { name, email, role, password } = body;
  if (!name || !email || !role || !password) return c.json({ error: "Missing fields" }, 400);
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const passwordHash = await hashPassword(password);

  if (await tablesExist()) {
    const { data, error } = await (await getDB())
      .from("khcare_users")
      .insert({
        id: crypto.randomUUID(), name, initials, email: email.toLowerCase(), role,
        password_hash: passwordHash, must_change_password: body.mustChangePassword ?? true,
        hall_id: body.hallId ?? null, congregation: body.congregation ?? null,
        phone_numbers: body.phoneNumbers ?? null, gender: body.gender ?? null,
      })
      .select().single();
    if (error) return c.json({ error: error.code === "23505" ? "Email already exists" : error.message }, error.code === "23505" ? 409 : 500);
    return c.json({ user: toUser(data) }, 201);
  }

  await kvEnsureSeeded();
  const users: any[] = await kvGetUsers();
  if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) return c.json({ error: "Email already exists" }, 409);
  const newUser = {
    id: crypto.randomUUID(), name, initials, email: email.toLowerCase(), role,
    passwordHash, mustChangePassword: body.mustChangePassword ?? true,
    hallId: body.hallId ?? undefined, congregation: body.congregation ?? undefined,
    phoneNumbers: body.phoneNumbers ?? undefined, gender: body.gender ?? undefined,
  };
  await kv.set("khcare_users", [...users, newUser]);
  const { passwordHash: _, ...safeUser } = newUser;
  return c.json({ user: safeUser }, 201);
});

app.put("/make-server-a2aa1d47/users/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  if (body.password) {
    const policyErr = validatePassword(body.password);
    if (policyErr) return c.json({ error: policyErr }, 400);
  }

  if (await tablesExist()) {
    const updates: any = {};
    if (body.name               !== undefined) updates.name                = body.name;
    if (body.email              !== undefined) updates.email               = body.email.toLowerCase();
    if (body.role               !== undefined) updates.role                = body.role;
    if (body.mustChangePassword !== undefined) updates.must_change_password = body.mustChangePassword;
    if (body.password)                         updates.password_hash       = await hashPassword(body.password);
    if (body.hallId             !== undefined) updates.hall_id             = body.hallId       || null;
    if (body.congregation       !== undefined) updates.congregation        = body.congregation || null;
    if (body.phoneNumbers       !== undefined) updates.phone_numbers       = body.phoneNumbers || null;
    if (body.gender             !== undefined) updates.gender              = body.gender       || null;
    const { data, error } = await (await getDB()).from("khcare_users").update(updates).eq("id", id).select().single();
    if (error) return c.json({ error: error.message }, 500);
    if (!data)  return c.json({ error: "User not found" }, 404);
    return c.json({ user: toUser(data) });
  }

  await kvEnsureSeeded();
  const users: any[] = await kvGetUsers();
  const idx = users.findIndex((u: any) => u.id === id);
  if (idx === -1) return c.json({ error: "User not found" }, 404);
  const updated = { ...users[idx], ...body };
  if (body.password) { updated.passwordHash = await hashPassword(body.password); delete updated.password; }
  users[idx] = updated;
  await kv.set("khcare_users", users);
  const { passwordHash: _, ...safeUser } = updated;
  return c.json({ user: safeUser });
});

app.delete("/make-server-a2aa1d47/users/:id", async (c) => {
  const id = c.req.param("id");
  if (await tablesExist()) {
    const { error } = await (await getDB()).from("khcare_users").delete().eq("id", id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
  }
  await kvEnsureSeeded();
  const users: any[] = await kvGetUsers();
  await kv.set("khcare_users", users.filter((u: any) => u.id !== id));
  return c.json({ ok: true });
});

// ─── Halls ────────────────────────────────────────────────────────────────────

app.get("/make-server-a2aa1d47/halls", async (c) => {
  return c.json(await getHalls());
});

app.post("/make-server-a2aa1d47/halls", async (c) => {
  const body = await c.req.json();
  const { name, address, phone, gpsCoordinates, congregation } = body;
  if (!name) return c.json({ error: "Name is required" }, 400);

  if (await tablesExist()) {
    const { data, error } = await (await getDB())
      .from("khcare_halls")
      .insert({ id: crypto.randomUUID(), name, address: address ?? null, phone: phone ?? null, gpsCoordinates: gpsCoordinates ?? null, congregation: congregation ?? [] })
      .select().single();
    if (error) return c.json({ error: error.code === "23505" ? "A hall with that name already exists" : error.message }, error.code === "23505" ? 409 : 500);
    return c.json({ hall: toHall(data) }, 201);
  }

  await kvEnsureSeeded();
  const halls: any[] = await kvGetHalls();
  if (halls.find((h: any) => h.name.toLowerCase() === name.toLowerCase())) return c.json({ error: "A hall with that name already exists" }, 409);
  const newHall = { id: crypto.randomUUID(), name, address: address ?? undefined, phone: phone ?? undefined, gpsCoordinates: gpsCoordinates ?? undefined, congregation: congregation ?? [] };
  await kv.set("khcare_halls", [...halls, newHall]);
  return c.json({ hall: toHall(newHall) }, 201);
});

app.put("/make-server-a2aa1d47/halls/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  if (await tablesExist()) {
    const updates: any = {};
    if (body.name           !== undefined) updates.name           = body.name;
    if (body.address        !== undefined) updates.address        = body.address;
    if (body.phone          !== undefined) updates.phone          = body.phone;
    if (body.gpsCoordinates !== undefined) updates.gpsCoordinates = body.gpsCoordinates;
    if (body.congregation   !== undefined) updates.congregation   = body.congregation;
    const { data, error } = await (await getDB()).from("khcare_halls").update(updates).eq("id", id).select().single();
    if (error) return c.json({ error: error.message }, 500);
    if (!data)  return c.json({ error: "Hall not found" }, 404);
    return c.json({ hall: toHall(data) });
  }

  await kvEnsureSeeded();
  const halls: any[] = await kvGetHalls();
  const idx = halls.findIndex((h: any) => h.id === id);
  if (idx === -1) return c.json({ error: "Hall not found" }, 404);
  halls[idx] = { ...halls[idx], ...body, id };
  await kv.set("khcare_halls", halls);
  return c.json({ hall: toHall(halls[idx]) });
});

app.delete("/make-server-a2aa1d47/halls/:id", async (c) => {
  const id = c.req.param("id");
  if (await tablesExist()) {
    const { error } = await (await getDB()).from("khcare_halls").delete().eq("id", id);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
  }
  await kvEnsureSeeded();
  const halls: any[] = await kvGetHalls();
  await kv.set("khcare_halls", halls.filter((h: any) => h.id !== id));
  return c.json({ ok: true });
});

// ─── JHAs ─────────────────────────────────────────────────────────────────────

app.get("/make-server-a2aa1d47/jhas", async (c) => {
  return c.json(await getJHAs());
});

app.post("/make-server-a2aa1d47/jhas", async (c) => {
  const body = await c.req.json();
  if (!body.job || !body.site) return c.json({ error: "job and site are required" }, 400);

  const year = new Date().getFullYear();
  const isoDate = new Date().toISOString().split("T")[0];
  const date = new Date().toLocaleDateString("en-AU", { month: "short", day: "numeric" });

  if (await tablesExist()) {
    const supabase = await getDB();
    const { data: latest } = await supabase.from("khcare_jhas").select("ref").like("ref", `JHA-${year}-%`).order("ref", { ascending: false }).limit(1).maybeSingle();
    const maxNum = latest?.ref ? parseInt(latest.ref.split("-")[2] ?? "440", 10) : 440;
    const ref = `JHA-${year}-${String(maxNum + 1).padStart(4, "0")}`;
    const { data, error } = await supabase.from("khcare_jhas").insert({ ref, job: body.job, submitted_by: body.submittedBy ?? "", supervisor: body.supervisor ?? null, site: body.site, date: body.date ?? date, iso_date: body.isoDate ?? isoDate, status: body.status ?? "Pending", risk: body.risk ?? "Low", steps: body.steps ?? [] }).select().single();
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ jha: toJHA(data) }, 201);
  }

  await kvEnsureSeeded();
  const jhas: any[] = await kvGetJHAs();
  const maxNum = jhas.reduce((max: number, j: any) => { const m = j.ref?.match(/JHA-\d{4}-(\d+)/); return m ? Math.max(max, parseInt(m[1])) : max; }, 440);
  const ref = `JHA-${year}-${String(maxNum + 1).padStart(4, "0")}`;
  const newJHA = { ref, date: body.date ?? date, isoDate: body.isoDate ?? isoDate, status: "Pending", risk: "Low", steps: [], ...body, ref };
  await kv.set("khcare_jhas", [newJHA, ...jhas]);
  return c.json({ jha: newJHA }, 201);
});

app.put("/make-server-a2aa1d47/jhas/:ref", async (c) => {
  const ref = decodeURIComponent(c.req.param("ref"));
  const body = await c.req.json();

  if (await tablesExist()) {
    const updates: any = {};
    if (body.job         !== undefined) updates.job          = body.job;
    if (body.submittedBy !== undefined) updates.submitted_by = body.submittedBy;
    if (body.supervisor  !== undefined) updates.supervisor   = body.supervisor;
    if (body.site        !== undefined) updates.site         = body.site;
    if (body.date        !== undefined) updates.date         = body.date;
    if (body.isoDate     !== undefined) updates.iso_date     = body.isoDate;
    if (body.status      !== undefined) updates.status       = body.status;
    if (body.risk        !== undefined) updates.risk         = body.risk;
    if (body.steps       !== undefined) updates.steps        = body.steps;
    const { data, error } = await (await getDB()).from("khcare_jhas").update(updates).eq("ref", ref).select().single();
    if (error) return c.json({ error: error.message }, 500);
    if (!data)  return c.json({ error: "JHA not found" }, 404);
    return c.json({ jha: toJHA(data) });
  }

  await kvEnsureSeeded();
  const jhas: any[] = await kvGetJHAs();
  const idx = jhas.findIndex((j: any) => j.ref === ref);
  if (idx === -1) return c.json({ error: "JHA not found" }, 404);
  jhas[idx] = { ...jhas[idx], ...body, ref };
  await kv.set("khcare_jhas", jhas);
  return c.json({ jha: jhas[idx] });
});

app.delete("/make-server-a2aa1d47/jhas/:ref", async (c) => {
  const ref = decodeURIComponent(c.req.param("ref"));
  if (await tablesExist()) {
    const { error } = await (await getDB()).from("khcare_jhas").delete().eq("ref", ref);
    if (error) return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
  }
  await kvEnsureSeeded();
  const jhas: any[] = await kvGetJHAs();
  await kv.set("khcare_jhas", jhas.filter((j: any) => j.ref !== ref));
  return c.json({ ok: true });
});

Deno.serve(app.fetch);
