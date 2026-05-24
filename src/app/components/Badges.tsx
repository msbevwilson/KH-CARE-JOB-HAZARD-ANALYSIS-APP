import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { RiskLevel, JHAStatus, UserRole, riskColors, roleStyles } from "../types";

export const statusStyles: Record<JHAStatus, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  Pending:  { bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200",   icon: Clock        },
  Approved: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", icon: CheckCircle2 },
  Rejected: { bg: "bg-red-50",     text: "text-red-800",     border: "border-red-200",     icon: XCircle      },
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const c = riskColors[risk];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {risk}
    </span>
  );
}

export function StatusBadge({ status }: { status: JHAStatus }) {
  const s = statusStyles[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const s = roleStyles[role];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
      {role}
    </span>
  );
}
