import { useState, useRef } from "react";
import {
  ArrowLeft, ChevronDown, ChevronUp, Trash2, Plus, Send,
  AlertTriangle, Camera, X, CheckCircle2, ShieldCheck, Printer,
} from "lucide-react";
import {
  JHARecord, StepEntry, HazardEntry, HazardCategory, ControlType, KingdomHall, PrintData,
  RiskLevel, HAZARD_CATEGORIES, CONTROL_TYPES, CATEGORY_PROMPTS, EXAMPLE_JHA,
  uid, blankHazard, blankStep, formatDisplayDate,
} from "../types";

function RiskPill({ value, onChange }: { value: RiskLevel; onChange: (r: RiskLevel) => void }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-border" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.68rem" }}>
      {(["Low", "Medium", "High"] as RiskLevel[]).map((r) => {
        const active = value === r;
        const colors: Record<RiskLevel, string> = {
          Low:    active ? "bg-emerald-500 text-white border-emerald-500" : "bg-card text-muted-foreground hover:bg-emerald-50",
          Medium: active ? "bg-amber-400 text-white border-amber-400"    : "bg-card text-muted-foreground hover:bg-amber-50",
          High:   active ? "bg-red-500 text-white border-red-500"        : "bg-card text-muted-foreground hover:bg-red-50",
        };
        return (
          <button key={r} type="button" onClick={() => onChange(r)} className={`px-3 py-1.5 font-semibold transition-colors ${colors[r]}`}>{r}</button>
        );
      })}
    </div>
  );
}

function HazardPhotoUpload({ photos, onAdd, onRemove }: {
  photos: string[];
  onAdd: (dataUrls: string[]) => void;
  onRemove: (idx: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) onAdd([result]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>Photo Evidence</label>
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {photos.map((src, i) => (
            <div key={i} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
              <img src={src} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 text-xs font-semibold text-primary bg-secondary px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
        style={{ fontFamily: "DM Sans, sans-serif" }}
      >
        <Camera size={13} />
        {photos.length > 0 ? "Add More Photos" : "Add Photo"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

function JHAHelpPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-secondary/60 border border-border rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={13} className="text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground" style={{ fontFamily: "DM Sans, sans-serif" }}>What is a Job Hazard Analysis?</span>
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          <p className="text-xs text-muted-foreground leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>
            A JHA reviews each significant step of a job, identifies existing and potential hazards, and determines the most effective control methods to eliminate or reduce risk. Those assigned to oversee the work should perform the JHA, with input from experienced workers.
          </p>
          <div>
            <p className="text-xs font-bold text-foreground mb-2" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.08em" }}>HIERARCHY OF CONTROLS</p>
            <div className="space-y-1.5">
              {[
                { n: 1, label: "Elimination",    desc: "Remove the hazard entirely",              color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
                { n: 2, label: "Substitution",   desc: "Replace with something less hazardous",   color: "bg-teal-100 text-teal-800 border-teal-200"         },
                { n: 3, label: "Engineering",    desc: "Isolate people from the hazard",           color: "bg-blue-100 text-blue-800 border-blue-200"         },
                { n: 4, label: "Administrative", desc: "Change the way people work",               color: "bg-amber-100 text-amber-800 border-amber-200"      },
                { n: 5, label: "PPE",            desc: "Reduce worker exposure (last resort)",     color: "bg-orange-100 text-orange-800 border-orange-200"   },
              ].map(({ n, label, desc, color }) => (
                <div key={n} className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${color}`}>
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.55rem", fontWeight: 700 }}>{n}</span>
                  <div>
                    <span className="text-xs font-bold" style={{ fontFamily: "DM Mono, monospace" }}>{label}</span>
                    <span className="text-xs ml-1.5 opacity-75" style={{ fontFamily: "DM Sans, sans-serif" }}>— {desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Start at the top and work down. If you cannot eliminate the hazard, use one or more lower-level controls to minimise risk.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function NewJHAForm({ onBack, onPrint, onSubmit, onUpdate, initialRecord, halls }: {
  onBack: () => void; onPrint: (d: PrintData) => void;
  onSubmit: (r: JHARecord) => void;
  onUpdate?: (r: JHARecord) => void;
  initialRecord?: JHARecord;
  halls: KingdomHall[];
}) {
  const isEdit = !!initialRecord;
  const [jobName,    setJobName]    = useState(initialRecord?.job ?? "");
  const [site,       setSite]       = useState(initialRecord?.site ?? "");
  const [date,       setDate]       = useState(initialRecord?.isoDate ?? new Date().toISOString().slice(0, 10));
  const [supervisor, setSupervisor] = useState(initialRecord?.supervisor ?? "");
  const [steps,      setSteps]      = useState<StepEntry[]>(() =>
    initialRecord?.steps && initialRecord.steps.length > 0 ? initialRecord.steps : [blankStep()]
  );
  const [collapsed,    setCollapsed]    = useState<Record<string, boolean>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const loadExample = () => {
    setJobName(EXAMPLE_JHA.jobName);
    setSite(EXAMPLE_JHA.site);
    setSupervisor(EXAMPLE_JHA.supervisor);
    setSteps(EXAMPLE_JHA.steps.map((s) => ({ ...s, id: uid(), hazards: s.hazards.map((h) => ({ ...h, id: uid() })) })));
    setCollapsed({});
  };

  const inputCls = "w-full bg-input-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors";

  const updateStep = (id: string, desc: string) =>
    setSteps((s) => s.map((st) => st.id === id ? { ...st, description: desc } : st));
  const deleteStep = (id: string) =>
    setSteps((s) => s.filter((st) => st.id !== id));
  const addStep = () =>
    setSteps((s) => [...s, blankStep()]);

  const addHazard = (stepId: string) =>
    setSteps((s) => s.map((st) => st.id === stepId ? { ...st, hazards: [...st.hazards, blankHazard()] } : st));
  const updateHazard = (stepId: string, hId: string, patch: Partial<HazardEntry>) =>
    setSteps((s) => s.map((st) => st.id === stepId
      ? { ...st, hazards: st.hazards.map((h) => h.id === hId ? { ...h, ...patch } : h) }
      : st));
  const deleteHazard = (stepId: string, hId: string) =>
    setSteps((s) => s.map((st) => st.id === stepId
      ? { ...st, hazards: st.hazards.filter((h) => h.id !== hId) }
      : st));
  const addHazardPhotos = (stepId: string, hId: string, urls: string[]) =>
    setSteps((s) => s.map((st) => st.id === stepId
      ? { ...st, hazards: st.hazards.map((h) => h.id === hId ? { ...h, photos: [...h.photos, ...urls] } : h) }
      : st));
  const removeHazardPhoto = (stepId: string, hId: string, idx: number) =>
    setSteps((s) => s.map((st) => st.id === stepId
      ? { ...st, hazards: st.hazards.map((h) => h.id === hId ? { ...h, photos: h.photos.filter((_, i) => i !== idx) } : h) }
      : st));

  const toggleCollapse = (id: string) =>
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const highestRisk = (): RiskLevel =>
    steps.some((s) => s.hazards.some((h) => h.risk === "High")) ? "High"
    : steps.some((s) => s.hazards.some((h) => h.risk === "Medium")) ? "Medium"
    : "Low";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit && onUpdate && initialRecord) {
      onUpdate({ ...initialRecord, job: jobName, site, date: formatDisplayDate(date), isoDate: date, supervisor, steps, risk: highestRisk() });
      onBack();
    } else {
      const ref = `JHA-2026-${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}`;
      onSubmit({ ref, job: jobName, submittedBy: "J. Patterson", site, date: formatDisplayDate(date), isoDate: date, status: "Pending", risk: highestRisk(), supervisor, steps });
      setSubmittedRef(ref);
    }
  };

  if (submittedRef) {
    const printData: PrintData = {
      ref: submittedRef, job: jobName, site, date, submittedBy: "J. Patterson",
      supervisor, status: "Pending", risk: highestRisk(), steps,
    };
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>JHA Submitted</p>
          <p className="text-sm text-muted-foreground mt-1">Your JHA has been submitted for supervisor review.</p>
          <p className="text-xs font-semibold text-primary mt-2" style={{ fontFamily: "DM Mono, monospace" }}>{submittedRef}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onPrint(printData)}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground border border-border px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-secondary/80 transition-colors"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <Printer size={15} /> Print Card
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            Back to JHAs
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5 pb-10">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors flex-shrink-0 mt-0.5"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground leading-tight" style={{ fontFamily: "Roboto Slab, serif" }}>{isEdit ? "Edit Job Hazard Analysis" : "New Job Hazard Analysis"}</h2>
            <button
              type="button"
              onClick={loadExample}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-secondary px-2.5 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors flex-shrink-0"
              style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}
            >
              Load Example
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "DM Mono, monospace" }}>Complete all sections before submitting</p>
        </div>
      </div>

      <JHAHelpPanel />

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>Job Details</p>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Job / Task Name <span className="text-red-500">*</span></label>
            <input required value={jobName} onChange={(e) => setJobName(e.target.value)} placeholder="e.g. High-Voltage Panel Replacement – Unit 3B" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Kingdom Hall <span className="text-red-500">*</span></label>
            <select required value={site} onChange={(e) => setSite(e.target.value)} className={inputCls}>
              <option value="">Select a Kingdom Hall…</option>
              {halls.map((h) => <option key={h.id} value={h.name}>{h.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Date <span className="text-red-500">*</span></label>
            <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Supervisor Name</label>
            <input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="e.g. J. Patterson" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>
            Work Steps &amp; Hazards
          </p>
          <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>{steps.length} step{steps.length !== 1 ? "s" : ""}</span>
        </div>

        {steps.map((step, si) => {
          const isCollapsed = collapsed[step.id];
          const highHazards = step.hazards.filter((h) => h.risk === "High").length;
          return (
            <div key={step.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${highHazards > 0 ? "border-red-200" : "border-border"}`}>
              <div
                className={`px-4 py-3 flex items-center gap-3 cursor-pointer select-none ${highHazards > 0 ? "bg-red-50/60" : "bg-muted/30"}`}
                onClick={() => toggleCollapse(step.id)}
              >
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>{si + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>
                    {step.description || <span className="text-muted-foreground font-normal italic">Untitled step</span>}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>
                    {step.hazards.length} hazard{step.hazards.length !== 1 ? "s" : ""}
                    {highHazards > 0 && <span className="text-red-600 font-semibold ml-2">· {highHazards} High-Risk</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); deleteStep(step.id); }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  {isCollapsed ? <ChevronDown size={15} className="text-muted-foreground" /> : <ChevronUp size={15} className="text-muted-foreground" />}
                </div>
              </div>

              {!isCollapsed && (
                <div className="px-4 py-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Step Description <span className="text-red-500">*</span></label>
                    <input required value={step.description} onChange={(e) => updateStep(step.id, e.target.value)} placeholder="Describe the work step…" className={inputCls} />
                  </div>

                  <div className="space-y-3">
                    {step.hazards.map((hazard) => {
                      const isHigh = hazard.risk === "High";
                      return (
                        <div key={hazard.id} className={`rounded-xl border p-3.5 space-y-3 ${isHigh ? "border-red-300 bg-red-50/50" : "border-border bg-background/50"}`}>
                          {isHigh && (
                            <div className="flex items-center gap-2 text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                              <AlertTriangle size={13} className="flex-shrink-0" />
                              <span className="text-xs font-semibold" style={{ fontFamily: "DM Mono, monospace" }}>High Risk – Immediate Attention Required</span>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <div className="flex-1 space-y-3 min-w-0">
                              <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Hazard Description <span className="text-red-500">*</span></label>
                                <input required value={hazard.description} onChange={(e) => updateHazard(step.id, hazard.id, { description: e.target.value })} placeholder="Describe the hazard…" className={inputCls} />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Hazard Category</label>
                                  <select
                                    value={hazard.category ?? ""}
                                    onChange={(e) => updateHazard(step.id, hazard.id, { category: e.target.value as HazardCategory || undefined })}
                                    className={`${inputCls} cursor-pointer`}
                                  >
                                    <option value="">Select category…</option>
                                    {HAZARD_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                  </select>
                                  {hazard.category && CATEGORY_PROMPTS[hazard.category] && (
                                    <div className="mt-2 space-y-1">
                                      {CATEGORY_PROMPTS[hazard.category]!.map((p, i) => (
                                        <p key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-snug" style={{ fontFamily: "DM Sans, sans-serif" }}>
                                          <span className="text-primary mt-0.5 flex-shrink-0">›</span>{p}
                                        </p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-foreground mb-1.5" style={{ fontFamily: "DM Sans, sans-serif" }}>Risk Level</label>
                                  <RiskPill value={hazard.risk} onChange={(r) => updateHazard(step.id, hazard.id, { risk: r })} />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="text-xs font-semibold text-foreground" style={{ fontFamily: "DM Sans, sans-serif" }}>Control Measure <span className="text-red-500">*</span></label>
                                  <select
                                    value={hazard.controlType ?? ""}
                                    onChange={(e) => updateHazard(step.id, hazard.id, { controlType: e.target.value as ControlType || undefined })}
                                    className="text-xs font-semibold text-primary bg-secondary border border-border rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
                                    style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}
                                  >
                                    <option value="">Type…</option>
                                    {CONTROL_TYPES.map(({ value, short }) => <option key={value} value={value}>{short}</option>)}
                                  </select>
                                </div>
                                <textarea
                                  required
                                  rows={2}
                                  value={hazard.control}
                                  onChange={(e) => updateHazard(step.id, hazard.id, { control: e.target.value })}
                                  placeholder="Describe controls to mitigate this hazard…"
                                  className={`${inputCls} resize-none`}
                                />
                              </div>
                              <HazardPhotoUpload
                                photos={hazard.photos}
                                onAdd={(urls) => addHazardPhotos(step.id, hazard.id, urls)}
                                onRemove={(idx) => removeHazardPhoto(step.id, hazard.id, idx)}
                              />
                            </div>
                            {step.hazards.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteHazard(step.id, hazard.id)}
                                className="mt-6 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => addHazard(step.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-secondary/50 transition-colors"
                      style={{ fontFamily: "DM Sans, sans-serif" }}
                    >
                      <Plus size={13} /> Add Hazard
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={addStep}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-secondary/50 transition-colors"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          <Plus size={15} /> Add Work Step
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
          Submitting will send this JHA for supervisor approval.
        </p>
        <button
          type="submit"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all flex-shrink-0"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          <Send size={14} />
          {isEdit ? "Save Changes" : "Submit JHA"}
        </button>
      </div>
    </form>
  );
}
