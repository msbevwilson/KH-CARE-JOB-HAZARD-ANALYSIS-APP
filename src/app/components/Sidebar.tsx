import { useState } from "react";
import { LayoutDashboard, MapPin, ClipboardList, Settings, HardHat, LogOut, Users } from "lucide-react";
import { NavKey, UserRole, AuthUser, KingdomHall, visibleNavKeys } from "../types";

export const NAV_ITEMS: { key: NavKey; label: string; icon: React.ElementType }[] = [
  { key: "dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { key: "halls",     label: "Kingdom Halls", icon: MapPin          },
  { key: "jhas",      label: "JHAs",          icon: ClipboardList   },
  { key: "users",     label: "Users",         icon: Users           },
  { key: "settings",  label: "Settings",      icon: Settings        },
];

export function Sidebar({ active, onSelect, user, onLogout, halls, selectedHall, onSelectHall }: {
  active: NavKey; onSelect: (k: NavKey) => void; user: AuthUser; onLogout: () => void;
  halls: KingdomHall[]; selectedHall: string | null; onSelectHall: (id: string | null) => void;
}) {
  const allowedKeys = visibleNavKeys(user.role);
  return (
    <aside className="hidden md:flex flex-col h-full bg-primary flex-shrink-0" style={{ width: 280 }}>
      <div className="px-7 py-7 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-white/30 flex items-center justify-center flex-shrink-0">
            <HardHat size={22} className="text-white" />
          </div>
          <p className="text-white text-xl font-bold leading-tight" style={{ fontFamily: "Roboto Slab, serif" }}>
            KH <span style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, color: "#e67e22" }}>CARE</span>
          </p>
        </div>
        <div className="space-y-3">
          {[
            { letter: "C", text: "Check the environment" },
            { letter: "A", text: "Analyze the task steps" },
            { letter: "R", text: "Remove or control hazards" },
            { letter: "E", text: "Ensure everyone is safe" },
          ].map(({ letter, text }) => (
            <div key={letter} className="flex items-baseline gap-3">
              <span className="w-5 flex-shrink-0 text-right leading-none" style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1.25rem", color: "#e67e22" }}>{letter}</span>
              <span style={{ fontFamily: "Lora, serif", fontStyle: "italic", fontWeight: 400, fontSize: "0.95rem", color: "white", lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className="px-3 py-4 space-y-0.5 border-b border-white/10">
        <p className="px-3 mb-3 text-white/35 font-bold uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.58rem" }}>
          Navigation
        </p>
        {NAV_ITEMS.filter(({ key }) => allowedKeys.includes(key)).map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const displayLabel = key === "halls" && user.role !== "Admin" ? "Kingdom Hall" : label;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left group ${
                isActive ? "bg-white/15 text-white" : "text-white/55 hover:text-white/90 hover:bg-white/8"
              }`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              <Icon size={17} className={isActive ? "text-white" : "text-white/45 group-hover:text-white/70"} />
              {displayLabel}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold" style={{ fontFamily: "DM Mono, monospace" }}>{user.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold leading-tight truncate">{user.name}</p>
            <p className="text-white/45 text-xs truncate" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <LogOut size={13} className="text-white/60 hover:text-white/90" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileLeftNav({ active, onSelect, role, onLogout }: { active: NavKey; onSelect: (k: NavKey) => void; role: UserRole; onLogout: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const allowed = visibleNavKeys(role);
  const items = NAV_ITEMS.filter(({ key }) => allowed.includes(key));

  const handleSelect = (key: NavKey) => {
    onSelect(key);
    setExpanded(false);
  };

  return (
    <>
      {/* Backdrop — tap outside to collapse */}
      {expanded && (
        <div
          className="md:hidden fixed inset-0 z-20"
          onClick={() => setExpanded(false)}
        />
      )}

      <nav
        className={`md:hidden fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-primary overflow-hidden transition-[width] duration-200 ${expanded ? "w-48" : "w-14"}`}
        style={{ boxShadow: "2px 0 16px rgba(0,0,0,0.15)" }}
        onClick={() => setExpanded(o => !o)}
      >
        {/* Top: HardHat icon (fixed left) + KH CARE brand (visible when expanded) */}
        <div className="flex-shrink-0 border-b border-white/10 flex items-center">
          <span className="w-14 flex-shrink-0 flex items-center justify-center py-5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <HardHat size={18} className="text-white" />
            </div>
          </span>
          <div className="flex-1 flex flex-col items-center pr-3 whitespace-nowrap">
            <p style={{ fontFamily: "Roboto Slab, serif", fontWeight: 700, fontSize: "1rem", color: "white", lineHeight: 1.2 }}>KH</p>
            <p style={{ fontFamily: "Playfair Display, serif", fontWeight: 800, fontSize: "1rem", color: "#e67e22", lineHeight: 1.2 }}>CARE</p>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 py-3 flex flex-col gap-0.5 overflow-hidden">
          {items.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            const displayLabel = key === "halls" && role !== "Admin" ? "Kingdom Hall" : label;
            return (
              <button
                key={key}
                onClick={(e) => { e.stopPropagation(); handleSelect(key); }}
                className={`flex items-center w-full transition-colors ${
                  isActive ? "bg-white/15 text-white" : "text-white/55 active:bg-white/8"
                }`}
              >
                <span className={`w-14 flex-shrink-0 flex items-center justify-center py-2.5 ${isActive ? "text-white" : "text-white/50"}`}>
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold whitespace-nowrap pr-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {displayLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Log Off */}
        <div className="flex-shrink-0 border-t border-white/10">
          <button
            onClick={(e) => { e.stopPropagation(); onLogout(); }}
            className="flex items-center w-full transition-colors text-white/50 active:bg-white/8"
          >
            <span className="w-14 flex-shrink-0 flex items-center justify-center py-3.5">
              <LogOut size={18} />
            </span>
            <span className="text-sm font-semibold whitespace-nowrap pr-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              Log Off
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
