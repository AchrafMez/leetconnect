interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  subColor?: string;
  iconBg: string;
  icon: React.ReactNode;
  attention?: boolean;
}

export const StatCard = ({
  label,
  value,
  sub,
  subColor = 'text-muted-foreground',
  iconBg,
  icon,
  attention = false,
}: StatCardProps) => {
  return (
    <div className={`bg-card border p-5 transition-colors ${
      attention ? 'border-destructive/40' : 'border-border'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">{label}</p>
          <p className={`text-2xl font-bold ${attention ? 'text-destructive' : 'text-foreground'}`}>
            {value}
          </p>
        </div>
        <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
      {sub && (
        <p className={`text-xs font-medium ${subColor}`}>{sub}</p>
      )}
    </div>
  );
};