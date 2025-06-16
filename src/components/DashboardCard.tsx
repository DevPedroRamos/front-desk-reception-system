
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
}

export function DashboardCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  trendValue,
  className 
}: DashboardCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-slate-600";
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-slate-200 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        {icon && <div className="text-slate-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
        {trend && trendValue && (
          <div className={`text-xs mt-2 ${getTrendColor()}`}>
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
