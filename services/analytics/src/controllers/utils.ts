type _Range = '7d' | '30d' | '90d' | '1y';

export function getStartDate(range: _Range) : Date {
	const now = new Date();
	const days = { '7d':7, '30d':30, '90d':90, '1y':365 };
	const d = new Date(now);
	d.setDate(d.getDate() - (days[range] ?? 30));

	return d;
}

export function getDateRange(query: any): { startDate: Date; endDate: Date} {
	if(query.from && query.to) {
		return {
			startDate: new Date(query.from),
			endDate: new Date(query.to)
		}
	}

	const range = (query.range ?? '30d') as _Range;
	return {
		startDate: getStartDate(range),
		endDate: new Date()
	}
}