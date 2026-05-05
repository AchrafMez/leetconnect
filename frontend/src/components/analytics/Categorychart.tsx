interface DataPoint {
  category: string;
  count:    number;
}
 
interface CategoryChartProps {
  data: DataPoint[];
}

export const CategoryChart = ({ data }: CategoryChartProps) => {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
        No category data available
      </div>
    );
  }
 
  // sort descending by count so the most popular category is at the top
  const sorted  = [...data].sort((a, b) => b.count - a.count).slice(0, 8);
  const maxCount = sorted[0]?.count ?? 1;
 
  return (
    <div className="space-y-3">
      {sorted.map(item => {
        const pct = Math.round((item.count / maxCount) * 100);
        return (
          <div key={item.category} className="flex items-center gap-3">
            {/* Category name */}
            <div className="w-28 shrink-0">
              <p className="text-xs text-muted-foreground truncate">{item.category}</p>
            </div>
 
            {/* Bar */}
            <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
 
            {/* Count */}
            <span className="text-xs font-semibold text-foreground w-6 text-right tabular-nums">
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
};