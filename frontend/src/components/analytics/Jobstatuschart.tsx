import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
 
interface DataPoint {
  status: string;
  count:  number;
}
 
interface JobStatusChartProps {
  data: DataPoint[];
}
 
const STATUS_COLORS: Record<string, string> = {
  active: 'var(--color-primary)',
  closed: '#6b7280',
  flagged: 'var(--color-destructive)',
  completed: '#10b981',
};
 
function getColor(status: string): string {
  return STATUS_COLORS[status] ?? '#6b7280';
}
 
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5 capitalize">{item.name}</p>
      <p className="text-sm font-semibold text-foreground">{item.value} jobs</p>
    </div>
  );
};

export const JobStatusChart = ({ data }: JobStatusChartProps) => {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No job status data available
      </div>
    );
  }
 
  const total = data.reduce((sum, d) => sum + d.count, 0);
 
  return (
    <div>
      {/* Donut chart — innerRadius creates the hole */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={192}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2} >
              {data.map(entry => (
                <Cell key={entry.status} fill={getColor(entry.status)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
 
        {/* Center label inside the donut hole */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      </div>
 
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map(entry => {
          const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
          return (
            <div key={entry.status} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: getColor(entry.status) }}
              />
              <span className="text-xs text-muted-foreground capitalize flex-1">{entry.status}</span>
              <span className="text-xs font-semibold text-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};