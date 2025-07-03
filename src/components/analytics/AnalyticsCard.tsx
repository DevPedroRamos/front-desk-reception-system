import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  variant?: 'default' | 'gradient';
}

export function AnalyticsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = 'default'
}: AnalyticsCardProps) {
  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      variant === 'gradient' && "bg-gradient-to-br from-background to-muted/20",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs",
                trend.isPositive 
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" 
                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
            <span className="text-xs text-muted-foreground ml-2">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}