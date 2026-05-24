import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight, Filter, UserPlus, KeyRound, Trash2, Copy, Check, Pencil, X, Plus, Users } from "lucide-react";
import { AuthUser, KingdomHall, UserRole, Gender, ROLE_OPTIONS, generateTempPassword } from "../types";
import { RoleBadge } from "../components/Badges";

const GENDER_OPTIONS: Gender[] = ["Male", "Female"];

const inputCls = "w-full bg-card border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-all";

type UserSortKey = "name" | "email" | "role" | "gender" | "hall" | "congregation";
type UserFilter  = { role?: UserRole; gender?: Gender };

type UserFormState = {
  name: string; email: string; role: UserRole; gender: string;
  hallId: string; congregation: string; phoneNumbers: string[];
  mustChangePassword: boolean;
};

const emptyForm = (): UserFormState => ({
  name: "", email: "", role: "Worker", gender: "",
  hallId: "", congregation: "", phoneNumbers: [],
  mustChangePassword: true,
});

function fromUser(u: AuthUser): UserFormState {
  return {
    name: u.name, email: u.email, role: u.role,
    gender: u.gender ?? "", hallId: u.hallId ?? "",
    congregation: u.congregation ?? "",
    phoneNumbers: u.phoneNumbers ? [...u.phoneNumbers] : [],
    mustChangePassword: u.mustChangePassword ?? false,
  };
}

// ─── Desktop table ────────────────────────────────────────────────────────────

function UserDesktopTable({ users, halls, sortKey, sortDir, onSort, onEdit, onReset, onDelete, currentUserId }: {
  users: AuthUser[]; halls: KingdomHall[];
  sortKey: UserSortKey | null; sortDir: "asc" | "desc";
  onSort: (k: UserSortKey) => void;
  onEdit: (u: AuthUser) => void;
  onReset: (u: AuthUser) => void;
  onDelete: (u: AuthUser) => void;
  currentUserId: string;
}) {
  const cols = "1.6fr 1.8fr 0.8fr 0.7fr 1fr 1fr 88px";
  const COLS: { label: string; key: UserSortKey | null }[] = [
    { label: "Name",         key: "name"         },
    { label: "Email",        key: "email"        },
    { label: "Role",         key: "role"         },
    { label: "Gender",       key: "gender"       },
    { label: "Kingdom Hall", key: "hall"         },
    { label: "Congregation", key: "congregation" },
    { label: "",             key: null           },
  ];

  return (
    <>
      <div className="grid px-5 py-2.5 border-b border-border bg-muted/40" style={{ gridTemplateColumns: cols }}>
        {COLS.map(({ label, key }) => {
          if (!key) return <div key="__act" />;
          const active = sortKey === key;
          return (
            <button
              key={key}
              onClick={() => onSort(key)}
              className={`group flex items-center gap-0.5 text-left font-bold uppercase tracking-wide transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground/70"}`}
              style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}
            >
              {label}
              <span className={`transition-opacity ${active ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-50"}`}>
                {active && sortDir === "asc" ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
              </span>
            </button>
          );
        })}
      </div>
      <div className="divide-y divide-border">
        {users.map(u => {
          const hall = halls.find(h => h.id === u.hallId);
          return (
            <div key={u.id} className="grid px-5 py-3 items-center hover:bg-muted/25 transition-colors group" style={{ gridTemplateColumns: cols }}>
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.55rem" }}>{u.initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{u.name}</p>
                  {u.mustChangePassword && (
                    <span className="inline-flex items-center gap-0.5 text-amber-600" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.58rem" }}>
                      <KeyRound size={8} /> temp
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground truncate pr-3" style={{ fontFamily: "DM Mono, monospace" }}>{u.email}</p>
              <div><RoleBadge role={u.role} /></div>
              <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: "DM Mono, monospace" }}>{u.gender || "—"}</p>
              <p className="text-xs font-medium text-foreground truncate pr-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{hall ? `${hall.name}` : "—"}</p>
              <p className="text-xs text-muted-foreground truncate pr-2" style={{ fontFamily: "DM Sans, sans-serif" }}>{u.congregation || "—"}</p>
              <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(u)} title="Edit" className="w-6 h-6 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"><Pencil size={11} /></button>
                <button onClick={() => onReset(u)} title="Reset password" className="w-6 h-6 rounded-md hover:bg-amber-50 flex items-center justify-center text-muted-foreground hover:text-amber-600 transition-colors"><KeyRound size={11} /></button>
                {u.id !== currentUserId && (
                  <button onClick={() => onDelete(u)} title="Delete" className="w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center text-muted-foreground hover:text-red-600 transition-colors"><Trash2 size={11} /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Mobile cards ─────────────────────────────────────────────────────────────

function UserMobileCards({ users, halls, onEdit, onReset, onDelete, currentUserId }: {
  users: AuthUser[]; halls: KingdomHall[];
  onEdit: (u: AuthUser) => void;
  onReset: (u: AuthUser) => void;
  onDelete: (u: AuthUser) => void;
  currentUserId: string;
}) {
  return (
    <div className="divide-y divide-border">
      {users.map(u => {
        const hall = halls.find(h => h.id === u.hallId);
        return (
          <div key={u.id} className="px-4 py-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary text-xs font-bold" style={{ fontFamily: "DM Mono, monospace" }}>{u.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{u.name}</p>
                <RoleBadge role={u.role} />
                {u.mustChangePassword && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <KeyRound size={9} /> temp
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate" style={{ fontFamily: "DM Mono, monospace" }}>{u.email}</p>
              {(hall || u.congregation) && (
                <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {[hall?.name, u.congregation].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => onEdit(u)} className="w-7 h-7 rounded-lg border border-border hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors"><Pencil size={12} /></button>
              <button onClick={() => onReset(u)} className="w-7 h-7 rounded-lg border border-border hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center text-muted-foreground transition-colors"><KeyRound size={12} /></button>
              {u.id !== currentUserId && (
                <button onClick={() => onDelete(u)} className="w-7 h-7 rounded-lg border border-border hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-muted-foreground transition-colors"><Trash2 size={12} /></button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export function AdminScreen({ users, currentUser, halls, onAddUser, onUpdateUser, onDeleteUser }: {
  users: AuthUser[];
  currentUser: AuthUser;
  halls: KingdomHall[];
  onAddUser: (u: AuthUser) => void;
  onUpdateUser: (u: AuthUser) => void;
  onDeleteUser: (id: string) => void;
}) {
  const [sortKey,      setSortKey]      = useState<UserSortKey | null>("name");
  const [sortDir,      setSortDir]      = useState<"asc" | "desc">("asc");
  const [filter,       setFilter]       = useState<UserFilter>({});
  const [filterOpen,   setFilterOpen]   = useState(false);

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [editTarget,    setEditTarget]    = useState<AuthUser | null>(null);
  const [resetTarget,   setResetTarget]   = useState<AuthUser | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<AuthUser | null>(null);
  const [copiedId,      setCopiedId]      = useState<string | null>(null);

  const [addForm,   setAddForm]   = useState<UserFormState>(emptyForm());
  const [tempPass,  setTempPass]  = useState(generateTempPassword());
  const [addError,  setAddError]  = useState("");
  const [addPhone,  setAddPhone]  = useState("");

  const [editForm,  setEditForm]  = useState<UserFormState>(emptyForm());
  const [editError, setEditError] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [resetPass,  setResetPass]  = useState("");
  const [resetError, setResetError] = useState("");

  const handleSort = (k: UserSortKey) => {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  let display = [...users];
  if (filter.role)   display = display.filter(u => u.role === filter.role);
  if (filter.gender) display = display.filter(u => u.gender === filter.gender);
  if (sortKey) {
    display.sort((a, b) => {
      let av: string, bv: string;
      if      (sortKey === "hall")         { av = halls.find(h => h.id === a.hallId)?.name ?? ""; bv = halls.find(h => h.id === b.hallId)?.name ?? ""; }
      else if (sortKey === "congregation") { av = a.congregation ?? ""; bv = b.congregation ?? ""; }
      else if (sortKey === "gender")       { av = a.gender ?? ""; bv = b.gender ?? ""; }
      else                                 { av = (a[sortKey] ?? "") as string; bv = (b[sortKey] ?? "") as string; }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  const hasFilter = !!(filter.role || filter.gender);

  const openAdd = () => { setAddForm(emptyForm()); setTempPass(generateTempPassword()); setAddError(""); setAddPhone(""); setShowAddModal(true); };
  const openEdit = (u: AuthUser) => { setEditForm(fromUser(u)); setEditError(""); setEditPhone(""); setEditTarget(u); };

  const addPhoneTo = (which: "add" | "edit") => {
    const val = (which === "add" ? addPhone : editPhone).trim();
    if (!val) return;
    if (which === "add") { setAddForm(f => ({ ...f, phoneNumbers: [...f.phoneNumbers, val] })); setAddPhone(""); }
    else                 { setEditForm(f => ({ ...f, phoneNumbers: [...f.phoneNumbers, val] })); setEditPhone(""); }
  };
  const removePhoneFrom = (which: "add" | "edit", idx: number) => {
    if (which === "add") setAddForm(f => ({ ...f, phoneNumbers: f.phoneNumbers.filter((_, i) => i !== idx) }));
    else                 setEditForm(f => ({ ...f, phoneNumbers: f.phoneNumbers.filter((_, i) => i !== idx) }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) { setAddError("Name is required."); return; }
    if (!addForm.email.trim() || !addForm.email.includes("@")) { setAddError("Valid email is required."); return; }
    if (users.find(u => u.email.toLowerCase() === addForm.email.toLowerCase())) { setAddError("Email already exists."); return; }
    if (tempPass.length < 4) { setAddError("Temporary password too short."); return; }
    const initials = addForm.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    onAddUser({ id: Date.now().toString(), name: addForm.name.trim(), initials, email: addForm.email.trim().toLowerCase(), role: addForm.role, gender: addForm.gender as Gender || undefined, hallId: addForm.hallId || undefined, congregation: addForm.congregation.trim() || undefined, phoneNumbers: addForm.phoneNumbers.length ? addForm.phoneNumbers : undefined, password: tempPass, mustChangePassword: true });
    setShowAddModal(false);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    if (!editForm.name.trim()) { setEditError("Name is required."); return; }
    if (!editForm.email.trim() || !editForm.email.includes("@")) { setEditError("Valid email is required."); return; }
    if (users.find(u => u.email.toLowerCase() === editForm.email.toLowerCase() && u.id !== editTarget.id)) { setEditError("Email already in use."); return; }
    const initials = editForm.name.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    onUpdateUser({ ...editTarget, name: editForm.name.trim(), initials, email: editForm.email.trim().toLowerCase(), role: editForm.role, gender: editForm.gender as Gender || undefined, hallId: editForm.hallId || undefined, congregation: editForm.congregation.trim() || undefined, phoneNumbers: editForm.phoneNumbers.length ? editForm.phoneNumbers : undefined, mustChangePassword: editForm.mustChangePassword });
    setEditTarget(null);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPass.length < 4) { setResetError("Password too short."); return; }
    if (!resetTarget) return;
    onUpdateUser({ ...resetTarget, password: resetPass, mustChangePassword: true });
    setResetTarget(null); setResetPass(""); setResetError("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); });
  };

  const PhoneList = ({ phones, onRemove }: { phones: string[]; onRemove: (i: number) => void }) =>
    phones.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {phones.map((p, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary border border-border">
            {p}<button type="button" onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive transition-colors"><X size={10} /></button>
          </span>
        ))}
      </div>
    ) : null;

  const UserFields = ({ form, setForm, phoneInput, setPhoneInput, onAddPhone, onRemovePhone, which }: {
    form: UserFormState; setForm: React.Dispatch<React.SetStateAction<UserFormState>>;
    phoneInput: string; setPhoneInput: (v: string) => void;
    onAddPhone: () => void; onRemovePhone: (i: number) => void; which: "add" | "edit";
  }) => {
    const congList = halls.find(h => h.id === form.hallId)?.congregation ?? [];
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Full name <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@example.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className={inputCls}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Gender</label>
            <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={inputCls}>
              <option value="">—</option>
              {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Kingdom Hall</label>
            <select value={form.hallId} onChange={e => setForm(f => ({ ...f, hallId: e.target.value, congregation: "" }))} className={inputCls}>
              <option value="">— None —</option>
              {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Congregation</label>
            {congList.length > 0 ? (
              <select value={form.congregation} onChange={e => setForm(f => ({ ...f, congregation: e.target.value }))} className={inputCls}>
                <option value="">— Select —</option>
                {congList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input value={form.congregation} onChange={e => setForm(f => ({ ...f, congregation: e.target.value }))} placeholder={form.hallId ? "No congregations on file" : "Select a hall first"} disabled={!form.hallId} className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`} />
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Phone Numbers</label>
          <div className="flex gap-2">
            <input value={phoneInput} onChange={e => setPhoneInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAddPhone(); } }} placeholder="+1 555 000 0000" className={`${inputCls} flex-1`} />
            <button type="button" onClick={onAddPhone} className="px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-semibold hover:bg-muted/70 transition-colors flex-shrink-0 flex items-center gap-1"><Plus size={11} /> Add</button>
          </div>
          <PhoneList phones={form.phoneNumbers} onRemove={onRemovePhone} />
        </div>
        {which === "edit" && (
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.mustChangePassword} onChange={e => setForm(f => ({ ...f, mustChangePassword: e.target.checked }))} className="rounded" />
            <span className="text-xs font-semibold text-foreground">Require password change on next sign-in</span>
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-0 pb-10">

      {/* ── Table card ── */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

        {/* Header bar */}
        <div className="px-4 md:px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>
              {hasFilter ? "Filtered Users" : "Users"}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
                {hasFilter ? `${display.length} of ${users.length} records` : `${users.length} records`}
                {sortKey && <span> · {sortKey} · {sortDir === "asc" ? "Ascending" : "Descending"}</span>}
              </p>
              {filter.role && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}>
                  {filter.role}<button type="button" onClick={() => setFilter(f => ({ ...f, role: undefined }))} className="hover:text-red-500 transition-colors"><X size={9} /></button>
                </span>
              )}
              {filter.gender && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}>
                  {filter.gender}<button type="button" onClick={() => setFilter(f => ({ ...f, gender: undefined }))} className="hover:text-red-500 transition-colors"><X size={9} /></button>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <UserPlus size={12} /> Add User
            </button>
            <button
              onClick={() => setFilterOpen(o => !o)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                filterOpen ? "text-primary-foreground bg-primary hover:bg-primary/90"
                  : hasFilter ? "text-primary bg-primary/10 border border-primary/30 hover:bg-primary/15"
                  : "text-primary bg-secondary hover:bg-secondary/80"
              }`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <Filter size={12} />
              {filterOpen ? "Hide Filters" : "Filter"}
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {filterOpen && (
          <div className="px-4 md:px-5 py-3 border-b border-border bg-muted/30 flex flex-wrap items-end gap-x-6 gap-y-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.08em" }}>ROLE</p>
              <div className="flex gap-1.5">
                {(["Admin", "Supervisor", "Worker"] as UserRole[]).map(r => {
                  const active = filter.role === r;
                  return (
                    <button key={r} onClick={() => setFilter(f => ({ ...f, role: active ? undefined : r }))}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/60"}`}
                      style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}
                    >{r}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.08em" }}>GENDER</p>
              <div className="flex gap-1.5">
                {GENDER_OPTIONS.map(g => {
                  const active = filter.gender === g;
                  return (
                    <button key={g} onClick={() => setFilter(f => ({ ...f, gender: active ? undefined : g }))}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/60"}`}
                      style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}
                    >{g}</button>
                  );
                })}
              </div>
            </div>
            {hasFilter && (
              <button onClick={() => setFilter({})} className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors self-end pb-0.5" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}>
                <X size={11} /> Clear filters
              </button>
            )}
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden md:block">
          <UserDesktopTable users={display} halls={halls} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} onEdit={openEdit} onReset={u => { setResetTarget(u); setResetPass(generateTempPassword()); setResetError(""); }} onDelete={setDeleteTarget} currentUserId={currentUser.id} />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          <UserMobileCards users={display} halls={halls} onEdit={openEdit} onReset={u => { setResetTarget(u); setResetPass(generateTempPassword()); setResetError(""); }} onDelete={setDeleteTarget} currentUserId={currentUser.id} />
        </div>

        {display.length === 0 && (
          <div className="py-12 text-center">
            <Users size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>No matching users</p>
            <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "DM Mono, monospace" }}>Try adjusting or clearing the filters</p>
            {hasFilter && <button onClick={() => setFilter({})} className="mt-3 text-xs font-semibold text-primary hover:underline" style={{ fontFamily: "DM Mono, monospace" }}>Clear filters</button>}
          </div>
        )}

        <div className="px-4 md:px-5 py-3 border-t border-border bg-muted/20">
          <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
            Showing {display.length}{hasFilter ? ` of ${users.length}` : ""} users
          </p>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg my-auto">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>Add User</h3>
              <button onClick={() => setShowAddModal(false)} className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors text-muted-foreground"><X size={15} /></button>
            </div>
            <form onSubmit={handleAddUser} className="px-6 py-5 space-y-4">
              <UserFields form={addForm} setForm={setAddForm} phoneInput={addPhone} setPhoneInput={setAddPhone} onAddPhone={() => addPhoneTo("add")} onRemovePhone={i => removePhoneFrom("add", i)} which="add" />
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Temporary password</label>
                <div className="flex gap-2">
                  <input value={tempPass} onChange={e => setTempPass(e.target.value)} className={`${inputCls} flex-1 font-mono`} />
                  <button type="button" onClick={() => setTempPass(generateTempPassword())} className="px-2.5 py-2 rounded-xl border border-border bg-card hover:bg-muted/50 text-xs text-muted-foreground transition-colors" title="Regenerate">↺</button>
                </div>
              </div>
              {addError && <p className="text-xs text-destructive font-semibold">{addError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Create User</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-lg my-auto">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>Edit User</h3>
              <button onClick={() => setEditTarget(null)} className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors text-muted-foreground"><X size={15} /></button>
            </div>
            <form onSubmit={handleEditUser} className="px-6 py-5 space-y-4">
              <UserFields form={editForm} setForm={setEditForm} phoneInput={editPhone} setPhoneInput={setEditPhone} onAddPhone={() => addPhoneTo("edit")} onRemovePhone={i => removePhoneFrom("edit", i)} which="edit" />
              {editError && <p className="text-xs text-destructive font-semibold">{editError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Save Changes</button>
                <button type="button" onClick={() => setEditTarget(null)} className="flex-1 border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-1" style={{ fontFamily: "Roboto Slab, serif" }}>Reset password</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Setting a new temporary password for <span className="font-semibold text-foreground">{resetTarget.name}</span>. They will be required to change it on next sign-in.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Temporary password</label>
                <div className="flex gap-2">
                  <input value={resetPass} onChange={e => { setResetPass(e.target.value); setResetError(""); }} className="flex-1 bg-input-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-all" />
                  <button type="button" onClick={() => copyToClipboard(resetPass, resetTarget.id)} className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted/50 flex items-center justify-center transition-colors text-muted-foreground" title="Copy">
                    {copiedId === resetTarget.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
              {resetError && <p className="text-xs text-destructive font-semibold">{resetError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">Save &amp; notify</button>
                <button type="button" onClick={() => { setResetTarget(null); setResetPass(""); setResetError(""); }} className="flex-1 border border-border py-2 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-1" style={{ fontFamily: "Roboto Slab, serif" }}>Delete user?</h3>
            <p className="text-xs text-muted-foreground mb-5">
              <span className="font-semibold text-foreground">{deleteTarget.name}</span> ({deleteTarget.email}) will be permanently removed. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { onDeleteUser(deleteTarget.id); setDeleteTarget(null); }} className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors">Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-border py-2 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
