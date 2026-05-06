import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { getDateRange } from './utils';


//Registration trends over time, breakdown by role, and breakdown by status
export const getUsersAnalytics = async (req: Request, res: Response) => {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});

	try {
		const { startDate, endDate } = getDateRange(req.query);

		const [
			registrationsOverTime,
			byRole,
			byStatus
		] = await Promise.all([
			// groups users by day within the date range
			// shows how many users registered each day
			prisma.$queryRaw<{ date: Date; count: bigint }[]>`
				SELECT
					DATE_TRUNC('day', "createdAt") AS date,
					COUNT(*)::int AS count
				FROM "User"
				WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
				GROUP BY DATE_TRUNC('day', "createdAt")
				ORDER BY date ASC
			`,

			// user count by role
			prisma.user.groupBy({
				by: ['role'],
				_count: { role: true},
			}),

			// user count by status
			prisma.user.groupBy({
				by: ['status'],
				_count: { status: true},
			})
		]);

		// yransform the raw query results into safe, frontend-friendly format
		const registrationsSafe = registrationsOverTime.map(row => ({
			// convert date objects to ISO string format (YYYY-MM-DD) for easy parsing on frontend
			date: row.date.toISOString().split('T')[0],
			// convert bigint counts to regular numbers (bigint isn't JSON serializable)
			count: Number(row.count)
		}));

		const roleSafe = byRole.map(r => ({
			role: r.role,
			count: r._count.role
		}));

		const statusSafe = byStatus.map(s => ({
			status: s.status,
			count: s._count.status
		}));

		res.status(StatusCodes.OK).json({
			// range,
			registrationsOverTime: registrationsSafe,
			byRole: roleSafe,
			byStatus: statusSafe
		});

	} catch (error) {
		console.error('[getUsersAnalytics]: ', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch users Analytics'});
	}
}
