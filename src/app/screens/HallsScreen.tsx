import { useState } from "react";
import { MapPin, Phone, Navigation, Users, Plus, Pencil, Trash2, X } from "lucide-react";
import { KingdomHall, AuthUser, canManageHalls } from "../types";

export function HallsScreen({ halls, currentUser, onAdd, onUpdate, onDelete }: {
  halls: KingdomHall[];
  currentUser: AuthUser;
  onAdd: (h: KingdomHall) => void;
  onUpdate: (h: KingdomHall) => void;
  onDelete: (id: string) => void;
}) {
  const canManage = canManageHalls(currentUser.role);
  const [editing,      setEditing]      = useState<KingdomHall | null>(null);
  const [showForm,     setShowForm]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KingdomHall | null>(null);

  const emptyForm = () => ({ id: "", name: "", address: "", phone: "", gpsCoordinates: "", congregation: [] as string[] });
  const [form,       setForm]       = useState(emptyForm());
  const [congInput,  setCongInput]  = useState("");
  const [formError,  setFormError]  = useState("");

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setCongInput("");
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (h: KingdomHall) => {
    setEditing(h);
    setForm({ id: h.id, name: h.name, address: h.address ?? "", phone: h.phone ?? "", gpsCoordinates: h.gpsCoordinates ?? "", congregation: [...(h.congregation ?? [])] });
    setCongInput("");
    setFormError("");
    setShowForm(true);
  };

  const addCong = () => {
    const v = congInput.trim();
    if (!v) return;
    if (form.congregation.includes(v)) return;
    setForm(f => ({ ...f, congregation: [...f.congregation, v] }));
    setCongInput("");
  };

  const removeCong = (name: string) => {
    setForm(f => ({ ...f, congregation: f.congregation.filter(c => c !== name) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Hall name is required."); return; }
    const duplicate = halls.find(h => h.name.toLowerCase() === form.name.trim().toLowerCase() && h.id !== form.id);
    if (duplicate) { setFormError("A hall with that name already exists."); return; }
    const hall: KingdomHall = {
      id: editing?.id ?? Date.now().toString(),
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      phone: form.phone.trim() || undefined,
      gpsCoordinates: form.gpsCoordinates.trim() || undefined,
      congregation: form.congregation,
    };
    editing ? onUpdate(hall) : onAdd(hall);
    setShowForm(false);
  };

  const inputCls = "w-full bg-input-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 transition-all";

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-10">

      {canManage && (
        <div className="flex justify-end">
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <Plus size={14} /> Add Kingdom Hall
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {halls.map((h) => (
          <div key={h.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-foreground leading-tight" style={{ fontFamily: "Roboto Slab, serif" }}>
                    {h.name} Kingdom Hall
                  </h3>
                  {h.address && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate" style={{ fontFamily: "DM Mono, monospace" }}>{h.address}</p>
                  )}
                </div>
              </div>
              {canManage && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => openEdit(h)}
                    className="w-7 h-7 rounded-lg border border-border bg-card hover:bg-secondary flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(h)}
                    className="w-7 h-7 rounded-lg border border-border bg-card hover:bg-red-50 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition-colors text-muted-foreground"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-3 space-y-2.5">
              {h.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={13} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-foreground font-medium" style={{ fontFamily: "DM Mono, monospace" }}>{h.phone}</span>
                </div>
              )}
              {h.gpsCoordinates && (
                <div className="flex items-center gap-2.5">
                  <Navigation size={13} className="text-muted-foreground flex-shrink-0" />
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(h.gpsCoordinates)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-medium hover:underline"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    {h.gpsCoordinates}
                  </a>
                </div>
              )}
              {h.congregation && h.congregation.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <Users size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {h.congregation.map((c) => (
                      <span key={c} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-foreground border border-border">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {halls.length === 0 && (
        <div className="text-center py-16">
          <MapPin size={32} className="text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">No Kingdom Halls yet</p>
          {canManage && <p className="text-xs text-muted-foreground mt-1">Add your first hall using the button above.</p>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md my-auto">
            <div className="px-6 py-5 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>
                {editing ? "Edit Kingdom Hall" : "Add Kingdom Hall"}
              </h3>
              <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors text-muted-foreground">
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Hall Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setFormError(""); }} placeholder="e.g. Eastside" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St, Suburb" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Phone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(02) 9800 0000" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">GPS Coordinates</label>
                  <input value={form.gpsCoordinates} onChange={e => setForm(f => ({ ...f, gpsCoordinates: e.target.value }))} placeholder="-33.8688, 151.2093" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">Congregations</label>
                <div className="flex gap-2 mb-2">
                  <input
                    value={congInput}
                    onChange={e => setCongInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCong(); } }}
                    placeholder="e.g. English, Spanish…"
                    className={`${inputCls} flex-1`}
                  />
                  <button type="button" onClick={addCong} className="px-3 py-2 rounded-xl bg-secondary border border-border text-xs font-semibold hover:bg-muted/70 transition-colors flex-shrink-0">
                    Add
                  </button>
                </div>
                {form.congregation.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.congregation.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary border border-border">
                        {c}
                        <button type="button" onClick={() => removeCong(c)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {formError && <p className="text-xs text-destructive font-semibold">{formError}</p>}

              <div className="flex gap-2 pt-1">
                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  {editing ? "Save Changes" : "Add Hall"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-foreground mb-1" style={{ fontFamily: "Roboto Slab, serif" }}>Delete Kingdom Hall?</h3>
            <p className="text-xs text-muted-foreground mb-5">
              <span className="font-semibold text-foreground">{deleteTarget.name} Kingdom Hall</span> will be permanently removed. JHAs linked to this hall will remain.
            </p>
            <div className="flex gap-2">
              <button onClick={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }} className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-xl text-sm font-semibold hover:bg-destructive/90 transition-colors">Delete</button>
              <button onClick={() => setDeleteTarget(null)} className="flex-1 border border-border py-2 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
