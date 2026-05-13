import { NextFunction, Request, Response } from 'express'
import { prisma } from '../config/prisma';
import { StatusCodes } from 'http-status-codes';
import { getDateRange } from './utils';

export const getJobsAnalytics = async (req: Request, res:Response, next: NextFunction) =>  {
	try {
		const { startDate, endDate} = getDateRange(req.query);

		const [
			jobsOverTime, byStatus, byCategory, avgProposals,
		] = await Promise.all([
			prisma.$queryRaw<{ date: Date; count: bigint }[]>`
				SELECT
					DATE_TRUNC('day', "createdAt") AS date,
					COUNT(*)::int AS count
				FROM "Job"
				WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
				GROUP BY DATE_TRUNC('day', "createdAt")
				ORDER BY date ASC
			`,

			// status breakdown
			prisma.job.groupBy({
				by: ['status'],
				where: { createdAt: { gte: startDate, lte: endDate } },
				_count: { status: true},
			}),

			// category breakdown
			prisma.job.groupBy({
				by: ['category'],
				where: { createdAt: { gte: startDate, lte: endDate } },
				_count: { category: true}, 
				orderBy: { _count: { category: 'desc'}},
			}),

			// average proposals across all jobs in date range
			prisma.job.aggregate({
				_avg: { proposals: true},
				where: { createdAt: { gte: startDate, lte: endDate } },
			}),
		]);

		const jobsOverTimeSafe = jobsOverTime.map(row => ({
			date: row.date.toISOString().split('T')[0],
			count: Number(row.count),
		}));

		const statusSafe = byStatus.map(s => ({
      status: s.status,
      count: s._count.status,
    }));

    const categorySafe = byCategory.map(c => ({
      category: c.category,
      count: c._count.category,
    }));

		res.status(StatusCodes.OK).json({
			jobsOverTime: jobsOverTimeSafe,
			byStatus: statusSafe,
			byCategory: categorySafe,
			avgProposals: Math.round(avgProposals._avg.proposals ?? 0),
		});
	} catch (error) {
		next(error);
	}	
}
