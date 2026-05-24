import { useState } from "react";
import {
  ArrowLeft, ChevronDown, ChevronUp, Printer, Pencil,
  CheckCircle2, XCircle, AlertTriangle, Trash2, ImageIcon,
} from "lucide-react";
import { JHARecord, JHAStatus, UserRole, PrintData, riskColors, canEditJHA, canApproveJHA, canDeleteJHA } from "../types";
import { statusStyles } from "./Badges";

export function JHADetailView({ jha, onBack, onPrint, onEdit, onDelete, onStatusChange, role }: {
  jha: JHARecord; onBack: () => void; onPrint: (d: PrintData) => void;
  onEdit: () => void; onDelete: () => void;
  onStatusChange: (s: JHAStatus) => void;
  role: UserRole;
}) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toggleStep = (id: string) => setExpandedSteps((e) => ({ ...e, [id]: !e[id] }));

  const statusS = statusStyles[jha.status];
  const StatusIcon = statusS.icon;
  const riskC = riskColors[jha.risk];

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-10">

      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors flex-shrink-0 mt-0.5"
        >
          <ArrowLeft size={16} className="text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-primary" style={{ fontFamily: "DM Mono, monospace" }}>{jha.ref}</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusS.bg} ${statusS.text} ${statusS.border}`}>
              <StatusIcon size={11} />{jha.status}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${riskC.bg} ${riskC.text} ${riskC.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${riskC.dot}`} />{jha.risk} Risk
            </span>
          </div>
          <h2 className="text-base font-semibold text-foreground leading-snug mt-1" style={{ fontFamily: "Roboto Slab, serif" }}>{jha.job}</h2>
        </div>
        <button
          onClick={() => onPrint({ ref: jha.ref, job: jha.job, site: jha.site, date: jha.date, submittedBy: jha.submittedBy, supervisor: jha.supervisor, status: jha.status, risk: jha.risk, steps: jha.steps })}
          className="flex items-center gap-1.5 border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          <Printer size={13} /> Print
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {canEditJHA(role, jha.status) && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-card border border-border px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors"
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <Pencil size={13} /> Edit JHA
          </button>
        )}

        {canApproveJHA(role) && jha.status === "Pending" && (
          <>
            <button
              type="button"
              onClick={() => onStatusChange("Approved")}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <CheckCircle2 size={13} /> Approve
            </button>
            <button
              type="button"
              onClick={() => onStatusChange("Rejected")}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl hover:bg-red-100 transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <XCircle size={13} /> Reject
            </button>
          </>
        )}

        {canDeleteJHA(role) && (
          <div className="ml-auto">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>Delete this JHA?</span>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 px-3 py-2 rounded-xl hover:bg-red-700 transition-colors"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  <Trash2 size={13} /> Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
                  style={{ fontFamily: "DM Sans, sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-card border border-border px-3 py-2 rounded-xl hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                <Trash2 size={13} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>Job Details</p>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {[
            { label: "Kingdom Hall",  value: jha.site         },
            { label: "Date",          value: jha.date         },
            { label: "Submitted By",  value: jha.submittedBy  },
            ...(jha.supervisor ? [{ label: "Supervisor", value: jha.supervisor }] : []),
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground font-semibold mb-0.5" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}>{label}</p>
              <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "DM Sans, sans-serif" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {jha.steps && jha.steps.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>
            Work Steps & Hazards
          </p>
          {jha.steps.map((step, si) => {
            const isOpen = expandedSteps[step.id] !== false;
            const highCount = step.hazards.filter((h) => h.risk === "High").length;
            return (
              <div key={step.id} className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${highCount > 0 ? "border-red-200" : "border-border"}`}>
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left ${highCount > 0 ? "bg-red-50/60" : "bg-muted/30"}`}
                >
                  <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>{si + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>{step.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>
                      {step.hazards.length} hazard{step.hazards.length !== 1 ? "s" : ""}
                      {highCount > 0 && <span className="text-red-600 font-semibold ml-2">· {highCount} High-Risk</span>}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-4 py-3 space-y-3">
                    {step.hazards.map((hazard) => {
                      const isHigh = hazard.risk === "High";
                      const hRisk = riskColors[hazard.risk];
                      return (
                        <div key={hazard.id} className={`rounded-xl border p-3.5 space-y-2.5 ${isHigh ? "border-red-300 bg-red-50/40" : "border-border bg-background/50"}`}>
                          {isHigh && (
                            <div className="flex items-center gap-2 text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                              <AlertTriangle size={12} className="flex-shrink-0" />
                              <span className="text-xs font-semibold" style={{ fontFamily: "DM Mono, monospace" }}>High Risk – Immediate Attention Required</span>
                            </div>
                          )}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 space-y-2">
                              {hazard.category && (
                                <span className="inline-block text-xs font-bold text-muted-foreground" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.06em" }}>{hazard.category.toUpperCase()}</span>
                              )}
                              <p className="text-sm font-semibold text-foreground leading-snug" style={{ fontFamily: "DM Sans, sans-serif" }}>{hazard.description}</p>
                              {hazard.control && (
                                <div className="bg-muted/40 rounded-lg px-3 py-2">
                                  {hazard.controlType && (
                                    <p className="text-xs font-bold text-muted-foreground mb-0.5" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.58rem", letterSpacing: "0.06em" }}>{hazard.controlType.toUpperCase()}</p>
                                  )}
                                  <p className="text-xs text-foreground leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>{hazard.control}</p>
                                </div>
                              )}
                              {hazard.photos.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {hazard.photos.map((src, i) => (
                                    <img key={i} src={src} alt={`Evidence ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-border" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border flex-shrink-0 ${hRisk.bg} ${hRisk.text} ${hRisk.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${hRisk.dot}`} />{hazard.risk}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm px-5 py-6 text-center">
          <ImageIcon size={22} className="text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>No step detail available</p>
          <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "DM Mono, monospace" }}>This record was created before step tracking was introduced.</p>
        </div>
      )}
    </div>
  );
}
