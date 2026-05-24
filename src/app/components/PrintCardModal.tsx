import { useEffect } from "react";
import { createPortal } from "react-dom";
import { HardHat, Printer, X } from "lucide-react";
import { PrintData, RiskLevel, StepEntry } from "../types";

const RISK_PRINT_LABEL: Record<RiskLevel, string> = { Low: "LOW", Medium: "MEDIUM", High: "HIGH" };
const RISK_PRINT_BG:    Record<RiskLevel, string> = { Low: "#dcfce7", Medium: "#fef9c3", High: "#fee2e2" };
const RISK_PRINT_COLOR: Record<RiskLevel, string> = { Low: "#166534", Medium: "#854d0e", High: "#991b1b" };

export function PrintCardModal({ data, onClose }: { data: PrintData; onClose: () => void }) {
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "jha-print-style";
    style.innerHTML = `
      @media print {
        body > * { display: none !important; }
        #jha-print-root { display: block !important; position: static !important; background: white !important; }
        #jha-print-root .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById("jha-print-style")?.remove(); };
  }, []);

  const formattedDate = (() => {
    try { return new Date(data.date).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return data.date; }
  })();

  const overallRisk: RiskLevel = data.risk ?? (
    data.steps?.some((s) => s.hazards.some((h) => h.risk === "High")) ? "High"
    : data.steps?.some((s) => s.hazards.some((h) => h.risk === "Medium")) ? "Medium"
    : "Low"
  );

  return createPortal(
    <div
      id="jha-print-root"
      className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-6 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="no-print fixed top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-foreground text-background rounded-full px-4 py-2 shadow-xl">
        <span className="text-xs font-semibold" style={{ fontFamily: "DM Mono, monospace" }}>Print Preview</span>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-accent/90 transition-colors"
          style={{ fontFamily: "DM Sans, sans-serif" }}
        >
          <Printer size={12} /> Print
        </button>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors">
          <X size={13} />
        </button>
      </div>

      <div
        className="bg-white w-full max-w-3xl mt-12 shadow-2xl"
        style={{ fontFamily: "DM Sans, sans-serif", fontSize: "11px", color: "#0f1e33" }}
      >
        <div style={{ background: "#1a3558", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.30)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <HardHat size={18} color="white" />
            </div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 13, fontFamily: "Roboto Slab, serif" }}>KH CARE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 8, fontFamily: "DM Mono, monospace", letterSpacing: "0.1em" }}>DOCUMENT TYPE</div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14, fontFamily: "Roboto Slab, serif", letterSpacing: "0.03em" }}>JOB HAZARD ANALYSIS</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 120px", borderBottom: "2px solid #1a3558" }}>
          {[
            { label: "REFERENCE NO.", value: data.ref },
            { label: "DATE",          value: formattedDate },
            { label: "PREPARED BY",   value: data.submittedBy || "—" },
            { label: "OVERALL RISK",  value: (
              <span style={{ background: RISK_PRINT_BG[overallRisk], color: RISK_PRINT_COLOR[overallRisk], fontWeight: 700, fontFamily: "DM Mono, monospace", padding: "2px 8px", borderRadius: 4, fontSize: 10 }}>
                {RISK_PRINT_LABEL[overallRisk]}
              </span>
            )},
          ].map(({ label, value }, i) => (
            <div key={i} style={{ padding: "8px 12px", borderRight: i < 3 ? "1px solid #dce4f0" : undefined }}>
              <div style={{ color: "#5a6880", fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
              <div style={{ fontWeight: 600, fontSize: 11 }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #dce4f0" }}>
          <div style={{ padding: "8px 12px", borderRight: "1px solid #dce4f0" }}>
            <div style={{ color: "#5a6880", fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 3 }}>JOB / TASK DESCRIPTION</div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{data.job}</div>
          </div>
          <div style={{ padding: "8px 12px" }}>
            <div style={{ color: "#5a6880", fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 3 }}>KINGDOM / ASSEMBLY HALL</div>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{data.site}</div>
          </div>
        </div>

        {data.steps && data.steps.length > 0 ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "28px 1.8fr 2fr 80px 2fr", background: "#eef0f4", borderBottom: "2px solid #1a3558", padding: "6px 0" }}>
              {["#", "WORK STEP", "IDENTIFIED HAZARD", "RISK", "CONTROL MEASURE"].map((h, i) => (
                <div key={i} style={{ padding: "0 10px", color: "#1a3558", fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.08em" }}>{h}</div>
              ))}
            </div>

            {data.steps.map((step: StepEntry, si: number) =>
              step.hazards.map((hazard, hi) => {
                const isHigh = hazard.risk === "High";
                const isFirst = hi === 0;
                return (
                  <div
                    key={`${step.id}-${hazard.id}`}
                    style={{ display: "grid", gridTemplateColumns: "28px 1.8fr 2fr 80px 2fr", borderBottom: "1px solid #dce4f0", background: isHigh ? "#fff8f8" : "white" }}
                  >
                    <div style={{ padding: "8px 10px", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 9 }}>
                      {isFirst && (
                        <div style={{ width: 18, height: 18, borderRadius: 4, background: "#1a3558", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "DM Mono, monospace", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                          {si + 1}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "8px 10px 8px 0", verticalAlign: "top" }}>
                      {isFirst && <span style={{ fontWeight: 600, lineHeight: 1.4 }}>{step.description}</span>}
                    </div>
                    <div style={{ padding: "8px 10px 8px 0" }}>
                      {hazard.category && (
                        <div style={{ fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, color: "#5a6880", marginBottom: 3, letterSpacing: "0.06em" }}>
                          {hazard.category.toUpperCase()}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
                        {isHigh && <span style={{ color: "#dc2626", flexShrink: 0, marginTop: 1 }}>⚠</span>}
                        <span style={{ lineHeight: 1.4 }}>{hazard.description}</span>
                      </div>
                      {hazard.photos.length > 0 && (
                        <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                          {hazard.photos.map((src, pi) => (
                            <img key={pi} src={src} alt={`Evidence ${pi + 1}`} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4, border: "1px solid #dce4f0" }} />
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "8px 10px 8px 0", verticalAlign: "top" }}>
                      <span style={{ background: RISK_PRINT_BG[hazard.risk], color: RISK_PRINT_COLOR[hazard.risk], fontWeight: 700, fontFamily: "DM Mono, monospace", fontSize: 8, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                        {RISK_PRINT_LABEL[hazard.risk]}
                      </span>
                    </div>
                    <div style={{ padding: "8px 12px 8px 0", lineHeight: 1.4 }}>
                      {hazard.controlType && (
                        <div style={{ fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, color: "#5a6880", marginBottom: 3, letterSpacing: "0.06em" }}>
                          {hazard.controlType.toUpperCase()}
                        </div>
                      )}
                      {hazard.control}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #dce4f0" }}>
            <div style={{ color: "#5a6880", fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4 }}>RISK SUMMARY</div>
            <span style={{ background: RISK_PRINT_BG[overallRisk], color: RISK_PRINT_COLOR[overallRisk], fontWeight: 700, fontFamily: "DM Mono, monospace", fontSize: 9, padding: "3px 8px", borderRadius: 4 }}>
              {RISK_PRINT_LABEL[overallRisk]} RISK
            </span>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "2px solid #1a3558", margin: "0" }}>
          {["PREPARED BY", "SUPERVISOR REVIEWED", "DATE APPROVED"].map((label, i) => (
            <div key={i} style={{ padding: "10px 14px", borderRight: i < 2 ? "1px solid #dce4f0" : undefined }}>
              <div style={{ color: "#5a6880", fontFamily: "DM Mono, monospace", fontSize: 7, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>{label}</div>
              <div style={{ borderBottom: "1px solid #aab8cc", height: 1, marginBottom: 4 }} />
              <div style={{ color: "#aab8cc", fontFamily: "DM Mono, monospace", fontSize: 8 }}>Signature</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#eef0f4", padding: "6px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#5a6880", fontFamily: "DM Mono, monospace", fontSize: 8 }}>KH CARE · {data.ref}</span>
          <span style={{ color: "#5a6880", fontFamily: "DM Mono, monospace", fontSize: 8 }}>UNCONTROLLED WHEN PRINTED</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
