import { useState } from "react";
import { Trash2, Plus, CheckCircle2, X } from "lucide-react";
import { RiskLevel, Gender, KingdomHall, uid } from "../types";

export function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex w-9 h-5 rounded-full transition-colors flex-shrink-0 ${value ? "bg-primary" : "bg-border"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${value ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

export function SettingsScreen({ userRole, halls = [] }: { userRole?: string; halls?: KingdomHall[] }) {
  const inputCls = "w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors";
  const ROLES = ["Admin", "Supervisor", "Worker"];
  const roleReadOnly = userRole === "Supervisor";

  const [name,          setName]          = useState("J. Patterson");
  const [role,          setRole]          = useState("Supervisor");
  const [hallId,        setHallId]        = useState("");
  const [gender,        setGender]        = useState<Gender | "">("");
  const [congregation,  setCongregation]  = useState("");
  const [phoneNumbers,  setPhoneNumbers]  = useState<string[]>([]);
  const [phoneInput,    setPhoneInput]    = useState("");
  const [profileSaved,  setProfileSaved]  = useState(false);

  const addPhone = () => {
    const v = phoneInput.trim();
    if (!v || phoneNumbers.includes(v)) return;
    setPhoneNumbers(p => [...p, v]);
    setPhoneInput("");
  };
  const removePhone = (i: number) => setPhoneNumbers(p => p.filter((_, idx) => idx !== i));

  const [notifs, setNotifs] = useState({ highRisk: true, pending: true, daily: false, statusUpdates: true });

  const [defSite,       setDefSite]       = useState("Westfield Industrial");
  const [defSupervisor, setDefSupervisor] = useState("J. Patterson");
  const [defRisk,       setDefRisk]       = useState<RiskLevel>("High");

  const [team, setTeam] = useState([
    { id: "t1", name: "J. Patterson",      role: "Supervisor", canApprove: true  },
    { id: "t2", name: "Sarah Chen",         role: "Supervisor", canApprove: true  },
    { id: "t3", name: "Marcus D. Holloway", role: "Worker",     canApprove: false },
    { id: "t4", name: "Priya Sharma",       role: "Worker",     canApprove: false },
    { id: "t5", name: "Derek Tulloch",      role: "Supervisor", canApprove: true  },
  ]);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("Worker");

  const saveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };
  const toggleApprover = (id: string) =>
    setTeam((t) => t.map((m) => m.id === id ? { ...m, canApprove: !m.canApprove } : m));
  const removeMember = (id: string) =>
    setTeam((t) => t.filter((m) => m.id !== id));
  const addMember = () => {
    if (!newName.trim()) return;
    setTeam((t) => [...t, { id: uid(), name: newName.trim(), role: newRole, canApprove: false }]);
    setNewName("");
    setNewRole("Worker");
  };

  const SectionHead = ({ label }: { label: string }) => (
    <div className="px-5 py-3.5 border-b border-border">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>{label}</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <SectionHead label="User Profile" />
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg font-bold" style={{ fontFamily: "DM Mono, monospace" }}>
                {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "DM Sans, sans-serif" }}>{name}</p>
              <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}>
                {role}{halls.find(h => h.id === hallId)?.name ? ` · ${halls.find(h => h.id === hallId)!.name}` : ""}{gender ? ` · ${gender}` : ""}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Role</label>
              {roleReadOnly ? (
                <div className={`${inputCls} bg-muted/50 text-muted-foreground cursor-not-allowed select-none`}>{role}</div>
              ) : (
                <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as Gender | "")} className={`${inputCls} cursor-pointer`}>
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Kingdom Hall</label>
              <select value={hallId} onChange={e => { setHallId(e.target.value); setCongregation(""); }} className={`${inputCls} cursor-pointer`}>
                <option value="">— None —</option>
                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Congregation</label>
              {(() => {
                const congList = halls.find(h => h.id === hallId)?.congregation ?? [];
                return congList.length > 0 ? (
                  <select value={congregation} onChange={e => setCongregation(e.target.value)} className={`${inputCls} cursor-pointer`}>
                    <option value="">— Select —</option>
                    {congList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <input value={congregation} onChange={e => setCongregation(e.target.value)} placeholder={hallId ? "No congregations on file" : "Select a hall first"} disabled={!hallId} className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`} />
                );
              })()}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Phone Numbers</label>
              <div className="flex gap-2">
                <input
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPhone(); } }}
                  placeholder="+1 555 000 0000"
                  className={`${inputCls} flex-1`}
                />
                <button type="button" onClick={addPhone} className="px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-semibold hover:bg-muted/70 transition-colors flex-shrink-0">
                  Add
                </button>
              </div>
              {phoneNumbers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {phoneNumbers.map((p, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary border border-border">
                      {p}
                      <button type="button" onClick={() => removePhone(i)} className="text-muted-foreground hover:text-destructive transition-colors"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveProfile}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${profileSaved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {profileSaved ? <><CheckCircle2 size={14} /> Saved</> : "Save Profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <SectionHead label="Notification Preferences" />
        <div className="divide-y divide-border">
          {([
            { key: "highRisk",      label: "High-Risk JHA Alerts",    desc: "Notify when a JHA is submitted with High risk hazards"   },
            { key: "pending",       label: "Pending Approval Alerts",  desc: "Notify when JHAs are awaiting your review"              },
            { key: "daily",         label: "Daily Summary",            desc: "Receive a daily digest of JHA activity across all halls" },
            { key: "statusUpdates", label: "JHA Status Updates",       desc: "Notify when a JHA you submitted is approved or rejected" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "DM Sans, sans-serif" }}>{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>{desc}</p>
              </div>
              <Toggle value={notifs[key]} onChange={(v) => setNotifs((n) => ({ ...n, [key]: v }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <SectionHead label="Default Values" />
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Default Kingdom Hall</label>
            <input value={defSite} onChange={(e) => setDefSite(e.target.value)} placeholder="e.g. Kingdom Hall, Northgate" className={inputCls} />
            <p className="text-xs text-muted-foreground mt-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Pre-filled when creating a new JHA</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Default Supervisor</label>
            <input value={defSupervisor} onChange={(e) => setDefSupervisor(e.target.value)} placeholder="e.g. J. Patterson" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Risk Alert Threshold</label>
            <select value={defRisk} onChange={(e) => setDefRisk(e.target.value as RiskLevel)} className={`${inputCls} cursor-pointer`}>
              <option value="Low">Low — alert on any hazard</option>
              <option value="Medium">Medium — alert on Medium and above</option>
              <option value="High">High — alert on High risk only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <SectionHead label="Team & User Management" />
        <div className="divide-y divide-border">
          {team.map((member) => (
            <div key={member.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-bold" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.55rem" }}>
                  {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>{member.name}</p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}>{member.role}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}>Can Approve</span>
                  <Toggle value={member.canApprove} onChange={() => toggleApprover(member.id)} />
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-border bg-muted/20">
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>Add Team Member</p>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              placeholder="Full name"
              className={`${inputCls} flex-1 min-w-0`}
            />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className={`${inputCls} cursor-pointer sm:w-44 flex-shrink-0`}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              type="button"
              onClick={addMember}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
