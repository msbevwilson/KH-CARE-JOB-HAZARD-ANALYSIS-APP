import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight, Filter, Plus, X, Printer, MapPin } from "lucide-react";
import { JHARecord, SortKey, JHAFilter, JHAStatus, RiskLevel, PrintData, RISK_ORDER, STATUS_ORDER, TABLE_COLS } from "../types";
import { RiskBadge, StatusBadge } from "./Badges";

function JHADesktopTable({ jhas, onView, onPrint, sortKey, sortDir, onSort }: {
  jhas: JHARecord[]; onView: (j: JHARecord) => void; onPrint: (d: PrintData) => void;
  sortKey: SortKey | null; sortDir: "asc" | "desc"; onSort: (k: SortKey) => void;
}) {
  const cols = "1fr 2fr 1fr 1.2fr 0.7fr 0.8fr 0.7fr 96px";
  return (
    <>
      <div className="grid px-5 py-2.5 border-b border-border bg-muted/40" style={{ gridTemplateColumns: cols }}>
        {TABLE_COLS.map(({ label, key }) => {
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
        {jhas.map((jha) => (
          <div
            key={jha.ref}
            className="grid px-5 py-3.5 items-center hover:bg-muted/25 transition-colors group"
            style={{ gridTemplateColumns: cols }}
          >
            <p className="text-xs font-semibold text-primary truncate" style={{ fontFamily: "DM Mono, monospace" }}>{jha.ref}</p>
            <p className="text-sm font-semibold text-foreground leading-snug truncate pr-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{jha.job}</p>
            <p className="text-xs font-medium text-foreground truncate pr-3" style={{ fontFamily: "DM Sans, sans-serif" }}>{jha.site}</p>
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-xs font-bold" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.55rem" }}>
                  {jha.submittedBy.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <p className="text-xs font-medium text-foreground truncate" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {jha.submittedBy.split(" ").slice(0, 2).join(" ")}
              </p>
            </div>
            <p className="text-xs text-muted-foreground font-medium" style={{ fontFamily: "DM Mono, monospace" }}>{jha.date}</p>
            <div><RiskBadge risk={jha.risk} /></div>
            <div><StatusBadge status={jha.status} /></div>
            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => onPrint({ ref: jha.ref, job: jha.job, site: jha.site, date: jha.date, submittedBy: jha.submittedBy, status: jha.status, risk: jha.risk })}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-all"
                title="Print Card"
              >
                <Printer size={13} />
              </button>
              <button
                onClick={() => onView(jha)}
                className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 hover:underline underline-offset-2 transition-all"
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                View <ChevronRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function JHAMobileCards({ jhas, onView, onPrint }: { jhas: JHARecord[]; onView: (j: JHARecord) => void; onPrint: (d: PrintData) => void }) {
  return (
    <div className="divide-y divide-border">
      {jhas.map((jha) => {
        const isHighRisk = jha.risk === "High";
        return (
          <div key={jha.ref} onClick={() => onView(jha)} className="w-full text-left px-4 py-4 hover:bg-muted/25 active:bg-muted/40 transition-colors flex flex-col gap-2 cursor-pointer">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-semibold truncate ${isHighRisk ? "text-red-600" : "text-primary"}`}
                style={{ fontFamily: "DM Mono, monospace" }}
              >
                {jha.ref}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>{jha.date}</span>
                <button
                  onClick={() => onPrint({ ref: jha.ref, job: jha.job, site: jha.site, date: jha.date, submittedBy: jha.submittedBy, status: jha.status, risk: jha.risk })}
                  className="w-7 h-7 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                >
                  <Printer size={13} />
                </button>
              </div>
            </div>
            <p className="text-sm font-semibold text-foreground leading-snug" style={{ fontFamily: "DM Sans, sans-serif" }}>
              {jha.job}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.68rem" }}>
              <span className="flex items-center gap-1 truncate">
                <MapPin size={10} className="flex-shrink-0" />
                {jha.site} Kingdom Hall
              </span>
              <span className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center font-bold text-primary" style={{ fontSize: "0.5rem" }}>
                  {jha.submittedBy.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
                {jha.submittedBy.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RiskBadge risk={jha.risk} />
              <StatusBadge status={jha.status} />
              <ChevronRight size={14} className="ml-auto text-muted-foreground flex-shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RecentJHAsSection({ jhas, onNewJHA, onView, onPrint, onViewAll, filter, onFilterChange }: {
  jhas: JHARecord[]; onNewJHA?: () => void; onView: (j: JHARecord) => void;
  onPrint: (d: PrintData) => void; onViewAll?: () => void;
  filter?: JHAFilter; onFilterChange?: (f: JHAFilter) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey | null>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(() => !!(filter?.status || filter?.risk));

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  let display = [...jhas];
  if (filter?.status) display = display.filter((j) => j.status === filter.status);
  if (filter?.risk)   display = display.filter((j) => j.risk   === filter.risk);
  if (sortKey) {
    display.sort((a, b) => {
      let av: string | number, bv: string | number;
      if      (sortKey === "risk")   { av = RISK_ORDER[a.risk];    bv = RISK_ORDER[b.risk]; }
      else if (sortKey === "status") { av = STATUS_ORDER[a.status]; bv = STATUS_ORDER[b.status]; }
      else if (sortKey === "date")   { av = a.isoDate ?? a.date;    bv = b.isoDate ?? b.date; }
      else                           { av = (a[sortKey] ?? "") as string; bv = (b[sortKey] ?? "") as string; }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ?  1 : -1;
      return 0;
    });
  }

  const hasFilter = !!(filter?.status || filter?.risk);

  const sortLabelMap: Record<SortKey, string> = {
    ref: "Reference", job: "Job Name", site: "Kingdom Hall",
    submittedBy: "Submitted By", date: "Date", risk: "Risk", status: "Status",
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 md:px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>
            {hasFilter ? "Filtered JHAs" : onViewAll ? "Recently Submitted JHAs" : "JHAs"}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
              {hasFilter ? `${display.length} of ${jhas.length} records` : `${jhas.length} records`}
              {sortKey && (
                <span>
                  {" · "}{sortLabelMap[sortKey]}
                  {" · "}{sortDir === "asc" ? "Ascending" : "Descending"}
                </span>
              )}
            </p>
            {filter?.status && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}>
                {filter.status}
                <button type="button" onClick={() => onFilterChange?.({ ...filter, status: undefined })} className="hover:text-red-500 transition-colors"><X size={9} /></button>
              </span>
            )}
            {filter?.risk && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-md" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.62rem" }}>
                {filter.risk} Risk
                <button type="button" onClick={() => onFilterChange?.({ ...filter, risk: undefined })} className="hover:text-red-500 transition-colors"><X size={9} /></button>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onNewJHA && (
            <button
              onClick={onNewJHA}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <Plus size={12} /> New JHA
            </button>
          )}
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              filterOpen
                ? "text-primary-foreground bg-primary hover:bg-primary/90"
                : hasFilter
                  ? "text-primary bg-primary/10 border border-primary/30 hover:bg-primary/15"
                  : "text-primary bg-secondary hover:bg-secondary/80"
            }`}
            style={{ fontFamily: "DM Sans, sans-serif" }}
          >
            <Filter size={12} />
            {filterOpen ? "Hide Filters" : "Filter"}
          </button>
        </div>
      </div>

      {filterOpen && (
        <div className="px-4 md:px-5 py-3 border-b border-border bg-muted/30 flex flex-wrap items-end gap-x-6 gap-y-3">
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.08em" }}>STATUS</p>
            <div className="flex gap-1.5">
              {(["Pending", "Approved", "Rejected"] as JHAStatus[]).map((s) => {
                const active = filter?.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onFilterChange?.({ ...filter, status: active ? undefined : s })}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted/60"}`}
                    style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}
                  >{s}</button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.08em" }}>RISK</p>
            <div className="flex gap-1.5">
              {(["Low", "Medium", "High"] as RiskLevel[]).map((r) => {
                const active = filter?.risk === r;
                const riskActive: Record<RiskLevel, string> = { Low: "bg-emerald-600 text-white border-emerald-600", Medium: "bg-amber-500 text-white border-amber-500", High: "bg-red-600 text-white border-red-600" };
                return (
                  <button
                    key={r}
                    onClick={() => onFilterChange?.({ ...filter, risk: active ? undefined : r })}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-colors ${active ? riskActive[r] : "bg-card text-muted-foreground border-border hover:bg-muted/60"}`}
                    style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}
                  >{r}</button>
                );
              })}
            </div>
          </div>
          {hasFilter && (
            <button
              onClick={() => onFilterChange?.({})}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors self-end pb-0.5"
              style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}
            >
              <X size={11} /> Clear filters
            </button>
          )}
        </div>
      )}

      <div className="hidden md:block">
        <JHADesktopTable jhas={display} onView={onView} onPrint={onPrint} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
      </div>
      <div className="md:hidden">
        <JHAMobileCards jhas={display} onView={onView} onPrint={onPrint} />
      </div>

      {display.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>No matching records</p>
          <p className="text-xs text-muted-foreground mt-1" style={{ fontFamily: "DM Mono, monospace" }}>Try adjusting or clearing the filters</p>
          <button onClick={() => onFilterChange?.({})} className="mt-3 text-xs font-semibold text-primary hover:underline" style={{ fontFamily: "DM Mono, monospace" }}>Clear filters</button>
        </div>
      )}

      <div className="px-4 md:px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
          Showing {display.length}{hasFilter ? ` of ${jhas.length}` : ""} records
        </p>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-2 transition-colors"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            View all JHAs <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
