import Papa from 'papaparse'
import type { OverviewData, JobsAnalytics, UsersAnalytics } from './api'

export interface ExportData {
	overview: OverviewData | null;
	users: UsersAnalytics | null;
	jobs: JobsAnalytics | null;
	range: string;
}

function downloadFile(content: string, filename: string, mimeType: string) {
	// creating the file in memory
	const blob = new Blob([content], { type: mimeType });
	// generate a temp url for that file
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');

	a.href = url;
	a.download = filename;

	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	setTimeout(() => {
		URL.revokeObjectURL(url)
	}, 100);
}

// export all analytics data as multi-section csv file
export function exportCSV(data: ExportData): void {
	const sections: string[] = [];
	const timestamp = new Date().toLocaleDateString('en-US', {
		month: 'long', day: 'numeric', year: 'numeric'
	})

	// section header
	sections.push(Papa.unparse([
		['LeetConnect - Analytics Export'],
		[`Period: ${data.range}`],
		[`Generated: ${timestamp}`],
		[]
	]))

	// overview section
	if(data.overview) {
		sections.push(Papa.unparse([
			['OVERVIEW'],
			['Metric', 'Value'],
			['Total Users', data.overview.totalUsers],
			['Total Jobs', data.overview.totalJobs],
			['Active Jobs', data.overview.activeJobs],
			['Flagged Jobs', data.overview.flaggedJobs],
			['Suspended Users', data.overview.suspendedUsers],
			['Pending Users', data.overview.pendingUsers],
			['New User This Week', data.overview.newUsersThisWeek],
			['New Jobs This Week', data.overview.newJobsThisWeek],
			[]
		]))
	}

	// user registration over time
	if(data.users?.registrationsOverTime.length) {
		sections.push(Papa.unparse({
			fields: ['Date', 'New Registrations'],
			data: data.users.registrationsOverTime.map(row => ({
				Date: row.date,
				'New Registrations': row.count,
			})),
		}));
		sections.push(Papa.unparse([[]]));
	}

	// users by role
	if(data.users?.byRole.length) {
		sections.push(Papa.unparse({
			fields: ['Role', 'User Count'],
			data: data.users.byRole.map(row => ({
				Role: row.role,
				'User Count': row.count,
			})),
		}));
		sections.push(Papa.unparse([[]]));
	}

	// jobs over time
	if(data.jobs?.jobsOverTime.length) {
		sections.push(Papa.unparse({
			fields: ['Date', 'Jobs Posted'],
			data: data.jobs.jobsOverTime.map(row => ({
				Date: row.date,
				'Jobs Posted': row.count,
			})),
		}))
		sections.push(Papa.unparse([[]]))
	}

	// jobs by category
	if(data.jobs?.byCategory.length) {
		sections.push(Papa.unparse({
			fields: ['Category', 'Job Count'],
			data: data.jobs.byCategory.map(row => ({
				Category: row.category,
				'Job Count': row.count,
			}))
		}));
		sections.push(Papa.unparse([[]]))
	}

	// jobs by status
	if(data.jobs?.byStatus.length) {
		sections.push(Papa.unparse({
			fields: ['Status', 'Job Count'],
			data: data.jobs.byStatus.map(row => ({
				Status: row.status,
				'Job Count': row.count,
			}))
		}))
	}

	const csv = sections.join('\n');
	const filename = `analytics-${new Date().toISOString().split('T')[0]}.csv`

	downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}
