import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  icon: Icon, label, value, sub, trend, iconBg, iconColor, valueColor, alert, onClick,
}: {
  icon: React.ElementType; label: string; value: string | number; sub: string;
  trend?: "up" | "down" | "neutral"; iconBg: string; iconColor: string;
  valueColor?: string; alert?: boolean; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-2xl border shadow-sm px-4 py-3.5 md:px-5 md:py-4 flex flex-col gap-2.5 md:gap-3 ${alert ? "border-red-200" : "border-border"} ${onClick ? "cursor-pointer hover:shadow-md hover:border-primary/25 transition-all" : ""}`}
      style={alert ? { boxShadow: "0 0 0 1px rgba(239,68,68,0.08), 0 2px 8px rgba(239,68,68,0.06)" } : undefined}
    >
      <div className="flex items-start justify-between">
        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        {trend && trend !== "neutral" && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
            {trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          </div>
        )}
      </div>
      <div>
        <p
          className={`text-2xl md:text-3xl font-bold leading-none ${valueColor ?? "text-foreground"}`}
          style={{ fontFamily: "Roboto Slab, serif" }}
        >
          {value}
        </p>
        <p className="text-xs md:text-sm font-semibold text-foreground mt-1 md:mt-1.5 leading-snug">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block" style={{ fontFamily: "DM Mono, monospace" }}>
          {sub}
        </p>
      </div>
    </div>
  );
}
