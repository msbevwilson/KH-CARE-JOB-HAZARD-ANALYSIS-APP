import { X, Mail, MapPin, Users, Phone, KeyRound, UserCircle2, Venus, Mars, CircleUserRound } from "lucide-react";
import { AuthUser, KingdomHall } from "../types";
import { RoleBadge } from "./Badges";

export function ProfileModal({ user, halls, onClose }: {
  user: AuthUser;
  halls: KingdomHall[];
  onClose: () => void;
}) {
  const hall = halls.find(h => h.id === user.hallId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* scrim */}
      <div className="absolute inset-0 bg-black/30" />

      {/* panel */}
      <div
        className="relative flex flex-col bg-card border-l border-border shadow-2xl h-full overflow-y-auto"
        style={{ width: 340 }}
        onClick={e => e.stopPropagation()}
      >
        {/* header strip */}
        <div className="bg-primary px-6 py-6 flex-shrink-0">
          <div className="flex items-start justify-between mb-5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>
              My Profile
            </p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold" style={{ fontFamily: "DM Mono, monospace" }}>{user.initials}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-white text-base font-bold leading-snug" style={{ fontFamily: "Roboto Slab, serif" }}>{user.name}</h2>
            </div>
          </div>
        </div>

        {/* fields */}
        <div className="flex-1 px-6 py-5 space-y-0 divide-y divide-border">

          <Row icon={Mail} label="Email" value={user.email} />

          <Row
            icon={CircleUserRound}
            label="Gender"
            value={user.gender || "—"}
          />

          <Row
            icon={MapPin}
            label="Kingdom Hall"
            value={hall ? `${hall.name} Kingdom Hall` : "—"}
          />

          <Row
            icon={Users}
            label="Congregation"
            value={user.congregation || "—"}
          />

          {/* Phone numbers — one row per number */}
          {user.phoneNumbers && user.phoneNumbers.length > 0 ? (
            user.phoneNumbers.map((p, i) => (
              <Row key={i} icon={Phone} label={i === 0 ? "Phone" : `Phone ${i + 1}`} value={p} />
            ))
          ) : (
            <Row icon={Phone} label="Phone" value="—" />
          )}

          {/* Account status */}
          {user.mustChangePassword && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                <KeyRound size={14} className="text-amber-600" />
              </div>
              <p className="text-xs font-semibold text-amber-700">Password change required on next sign-in</p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full border border-border py-2.5 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.65rem" }}>{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
