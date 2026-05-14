import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface DataPoint {
  role:  string;
  count: number;
}
 
interface RoleDistributionChartProps {
  data: DataPoint[];
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN:     'var(--color-primary)',
  MODERATOR: '#3b82f6',
  USER:      '#8b5cf6'
};

const DEFAULT_COLORS = ['var(--color-primary)', '#3b82f6', '#8b5cf6', '#f59e0b'];
 
function getColor(role: string, index: number): string {
  return ROLE_COLORS[role] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]!;
}
 
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5 capitalize">{item.name.toLowerCase()}</p>
      <p className="text-sm font-semibold text-foreground">{item.value} users</p>
    </div>
  );
};

export const RoleDistributionChart = ({ data }: RoleDistributionChartProps) => {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No role data available
      </div>
    );
  }
 
  const total = data.reduce((sum, d) => sum + d.count, 0);
 
  return (
    <div>
      <ResponsiveContainer width="100%" height={192}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="role"
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={80}
            paddingAngle={2} >
            {data.map((entry, index) => (
              <Cell key={entry.role} fill={getColor(entry.role, index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
 
      {/* Custom legend below chart */}
      <div className="space-y-2 mt-2">
        {data.map((entry, index) => {
          const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
          return (
            <div key={entry.role} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: getColor(entry.role, index) }}
                />
                <span className="text-xs text-muted-foreground capitalize">
                  {entry.role.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{entry.count}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};