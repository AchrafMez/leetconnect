import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface DataPoint {
  date:  string;
  count: number;
}

interface UserRegistrationsChartProps {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value} registrations
      </p>
    </div>
  );
};

// Formats "2024-04-01", "Apr 1" for the x-axis
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const UserRegistrationsChart = ({ data }: UserRegistrationsChartProps ) => {
	if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
        No registration data for this period
      </div>
    );
  }

	return(
		<ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          // show fewer ticks on small ranges to avoid crowding
          interval="preserveStartEnd" />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
	)
}