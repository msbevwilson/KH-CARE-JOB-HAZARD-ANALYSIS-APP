import { X, Clock, OctagonAlert, CheckCircle2, XCircle, BellOff } from "lucide-react";
import { AppNotification, NotificationType } from "../types";

const TYPE_CONFIG: Record<NotificationType, {
  icon: React.ElementType; iconBg: string; iconColor: string; dot: string;
}> = {
  pending:   { icon: Clock,          iconBg: "bg-amber-100",   iconColor: "text-amber-600",  dot: "bg-amber-400"   },
  high_risk: { icon: OctagonAlert,   iconBg: "bg-red-100",     iconColor: "text-red-600",    dot: "bg-red-500"     },
  approved:  { icon: CheckCircle2,   iconBg: "bg-emerald-100", iconColor: "text-emerald-600",dot: "bg-emerald-500" },
  rejected:  { icon: XCircle,        iconBg: "bg-red-100",     iconColor: "text-red-600",    dot: "bg-red-500"     },
};

function formatRelative(timestamp: string): string {
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return timestamp;
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return d.toLocaleDateString("en-AU", { month: "short", day: "numeric" });
  } catch { return timestamp; }
}

export function NotificationsPanel({ notifications, readIds, onMarkRead, onMarkAllRead, onViewJHA, onClose }: {
  notifications: AppNotification[];
  readIds: string[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onViewJHA: (ref: string) => void;
  onClose: () => void;
}) {
  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />

      <div
        className="relative flex flex-col bg-card border-l border-border shadow-2xl h-full"
        style={{ width: 360 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Roboto Slab, serif" }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                style={{ fontFamily: "DM Sans, sans-serif" }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors text-muted-foreground"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <BellOff size={20} className="text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/70">New JHA activity will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => {
                const isUnread = !readIds.includes(n.id);
                const { icon: Icon, iconBg, iconColor, dot } = TYPE_CONFIG[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => { onMarkRead(n.id); onViewJHA(n.jhaRef); onClose(); }}
                    className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40 ${isUnread ? "bg-primary/[0.03]" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <Icon size={15} className={iconColor} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 justify-between">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        {isUnread && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.body}</p>
                      <p className="text-xs text-muted-foreground/60 mt-1" style={{ fontFamily: "DM Mono, monospace", fontSize: "0.6rem" }}>
                        {formatRelative(n.timestamp)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
