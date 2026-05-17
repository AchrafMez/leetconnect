type _Range = '7d' | '30d' | '90d' | '1y';

export function getStartDate(range: _Range): Date {
  const days = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
  const d = new Date();
  d.setDate(d.getDate() - (days[range] ?? 30));
  d.setHours(0, 0, 0, 0);
  return d;
}
export function getDateRange(query: any): { startDate: Date; endDate: Date} {
	if(query.from && query.to) {
		const start = new Date(query.from);
		const end = new Date(query.to);
		end.setHours(23, 59, 59, 999);
		return {
			startDate: start,
			endDate: end
		}
	}

	const range = (query.range ?? '30d') as _Range;
	return {
		startDate: getStartDate(range),
		endDate: new Date()
	}
}