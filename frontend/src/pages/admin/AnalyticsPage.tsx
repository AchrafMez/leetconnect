import  { useCallback, useEffect, useMemo, useState } from "react"
import { HiOutlineBriefcase, HiOutlineCheckBadge, HiOutlineMinusCircle, HiOutlineUsers } from "react-icons/hi2";
import { analyticsApi, JobsAnalytics, OverviewData, UsersAnalytics } from "@/lib/api";
import { type DateRange, DateRangePicker } from "@/components/analytics/DateRangePicker";
import { Spin } from "@/components/ui/Spin";
import { UserRegistrationsChart } from "@/components/analytics/UserRegistrationsChart";
import { JobsOverTimeChart } from "@/components/analytics/JobsOverTimeChart";
import { RoleDistributionChart } from "@/components/analytics/RoleDistributionChart";
import { JobStatusChart } from "@/components/analytics/Jobstatuschart";
import { CategoryChart } from "@/components/analytics/Categorychart";
import { StatCard } from "@/components/ui/StatCard";
import { ExportButton } from "@/components/analytics/ExportButton";
import { LastUpdatedDisplay } from "@/components/analytics/LastUpdatedDisplay";

interface AnalyticsState {
	overview: OverviewData | null;
	users: UsersAnalytics | null;
	jobs: JobsAnalytics | null;
}

export interface DateRangeValue {
  preset: DateRange;
  from:   Date | null; // only used when preset === 'custom'
  to:     Date | null;
}


// Polling interval - 30 seconds
const POLL_INTERVAL = 30_000;

export const AnalyticsPage = () => {
	const [range, setRange] = useState<DateRangeValue>({
		preset: '30d',
		from: null,
		to: null
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [data, setData] = useState<AnalyticsState>({ overview: null, users: null, jobs: null });
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const fetchAll = useCallback(async (showLoading = true) => {
		// don't fetch if custom is selected but dates aren't both set yet
  	if (range.preset === 'custom' && (!range.from || !range.to)) return;
		if(showLoading) setLoading(true)
		setError('');

		try {
			const params = range.preset === 'custom'
				? `from=${range.from!.toISOString()}&to=${range.to!.toISOString()}`
      	: `range=${range.preset}`;
			const [overview, users, jobs] = await Promise.all([
				analyticsApi.getAnalyticsOverview(),
				analyticsApi.getUsersAnalytics(params),
				analyticsApi.getJobsAnalytics(params),
			])

			setData({ overview, users, jobs });
			setLastUpdated(new Date());
		} catch (error: any) {
			console.error('Failed to fetch analytics: ', error);
			setError(error.message ?? 'Failed to fetch analytics data');
		} finally {
			setLoading(false);
		}
	}, [range])

	useEffect(() => {
		fetchAll(true);
	}, [fetchAll])

	// set interval
	useEffect(() => {
		const interval = setInterval(() => {
			fetchAll(false);
		}, POLL_INTERVAL);

		return () => clearInterval(interval)
	}, [fetchAll])

	function handleRangeChange(newRange: DateRangeValue) {
		setRange(newRange);
	}

	const { overview, users, jobs } = data;
	const exportData = useMemo(() => ({
		overview: data.overview,
		users: data.users,
		jobs: data.jobs,
		range: range.preset === 'custom' && range.from && range.to
    	? `${range.from.toLocaleDateString()} – ${range.to.toLocaleDateString()}`
    	: { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', '1y': 'Last year' }[range.preset as Exclude<DateRange, 'custom'>] ?? range.preset,
	}), [data.overview, data.users, data.jobs, range])

	if(loading)
		return(<Spin/>);

	if(error) {
		return <div className="p-8 text-destructive">{error}</div>
	}
  return (
		<div className="p-8">
			<div className="mb-8 flex items-start justify-between">
				{/* Header Section */}
				<div>
					<h1 className="text-2xl font-bold text-foreground">Analytics</h1>
					<p className="text-muted-foreground text-sm mt-1">View analytics and insights</p>
				</div>

				<div className="flex items-center gap-3">
					<LastUpdatedDisplay lastUpdated={lastUpdated} />
					<DateRangePicker value={range} onChange={handleRangeChange} />
					<ExportButton data={exportData} />
				</div>
			</div>

			{/* overview cards */}
			{overview && (
				<div className="grid grid-cols-4 gap-4 mb-8">
					<StatCard
					label="Total Users"
					value={overview.totalUsers}
					sub={`↑ ${overview.newUsersThisWeek} this week`}
					subColor="text-primary"
					iconBg="bg-primary/10"
					icon={<HiOutlineUsers />} />

					<StatCard 
					label="Total Jobs"
					value={overview.totalJobs}
					sub={`↑ ${overview.newJobsThisWeek} this week`}
					subColor="text-primary"
					iconBg="bg-blue-500/10"
					icon={<HiOutlineBriefcase />} />

					<StatCard 
					label="Completed Jobs"
					value={overview.completedJobs}
					sub="successfully delivered"
  				subColor="text-emerald-400"
  				iconBg="bg-emerald-500/10"
					icon={<HiOutlineCheckBadge />} />

					<StatCard 
					label="Suspended Users"
					value={overview.suspendedUsers}
					subColor="text-muted-foreground"
          iconBg="bg-amber-500/10"
					attention={overview.suspendedUsers > 0}
					icon={<HiOutlineMinusCircle />} />
				</div>
			)}

			{/* Charts row 1 - time-series */}
			<div className="grid grid-cols-2 gap-6 mb-6">
				{/* user registration over time */}

				<div className="bg-card border border-border p-5">
					<div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">User Registrations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">New signups over time</p>
          </div>
					<UserRegistrationsChart data={users?.registrationsOverTime ?? []} />
				</div>

				{/* jobs posted over time */}
				<div className="bg-card border border-border p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Jobs Posted</h2>
            <p className="text-xs text-muted-foreground mt-0.5">New job postings over time</p>
          </div>
          <JobsOverTimeChart data={jobs?.jobsOverTime ?? []} />
        </div>
			</div>

			{/* charts row 2 - breakdown */}
			<div className="grid grid-cols-3 gap-6 mb-6">
				{/* role distribution */}
				<div className="bg-card border border-border p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Users by Role</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Role distribution</p>
          </div>
          <RoleDistributionChart data={users?.byRole ?? []} />
        </div>

				{/* job status donut */}
				<div className="bg-card border border-border p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Jobs by Status</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Active, closed, flagged</p>
          </div>
          <JobStatusChart data={jobs?.byStatus ?? []} />
        </div>

				{/* job categories */}
				<div className="bg-card border border-border p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">Top Categories</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Jobs by category</p>
          </div>
          <CategoryChart data={jobs?.byCategory ?? []} />
        </div>
			</div>

			{/* buttom row - extra stats */}
			<div className="grid grid-cols-2 gap-6">
			{/* user type breakdown */}
				{users && (
					<div className="bg-card border border-border p-5">
						<h2 className="text-sm font-semibold text-foreground mb-4">User Type</h2>
						<div className="space-y-3">
							{users.userType.map(item => {
								const total = users.userType.reduce((s, i) => s + i.count, 0);
								const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
								return(
									<div key={item.userType.toLowerCase()} className="flex items-center gap-3">
										<div className="w-16 shrink-0">
											<p className="text-xs text-muted-foreground capitalize">{item.userType.toLowerCase()}</p>
										</div>
										<div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
											<div
												className="h-full rounded-full bg-primary"
												style={{ width: `${pct}%` }}
											/>
										</div>
										<span className="text-xs font-semibold text-foreground w-12 text-right tabular-nums">
											{item.count} ({pct}%)
										</span>
									</div>
								)
							})}
						</div>
					</div>
				)}
				{jobs && (
					<div className="bg-card border border-border p-5">
						<h2 className="text-sm font-semibold text-foreground mb-4">Quick Stats</h2>
						<div className="space-y-4">
							{[
								{
									label: 'Avg proposals per job',
									value: jobs.avgProposals,
									sub: 'across all active jobs',
								},
								{
									label: 'Active jobs',
									value: overview?.activeJobs ?? 0,
									sub: 'currently open for proposals',
								},
							].map(stat => (
								<div key={stat.label} className="flex items-center justify-between">
									<div>
										<p className="text-xs text-muted-foreground">{stat.label}</p>
										<p className="text-xs text-muted-foreground/60 mt-0.5">{stat.sub}</p>
									</div>
									<span className="text-xl font-bold text-foreground">{stat.value}</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
  );
};
