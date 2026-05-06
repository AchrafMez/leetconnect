import { Request, Response } from 'express'
import { prisma } from '../config/prisma';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { getDateRange } from './utils';

export const getJobsAnalytics = async (req: Request, res:Response) =>  {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});

	try {
		const { startDate, endDate} = getDateRange(req.query);

		const [
			jobsOverTime, byStatus, byCategory,
			byBudgetType, avgProposals,
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
				_count: { status: true},
			}),

			// category breakdown
			prisma.job.groupBy({
				by: ['category'],
				_count: { category: true}, 
				orderBy: { _count: { category: 'desc'}},
			}),

			prisma.job.groupBy({
				by: ['budgetType'],
				_count: { budgetType: true},
			}),

			// average proposals across all jobs
			prisma.job.aggregate({
				_avg: { proposals: true},
			}),
		]);

		const jobsOverTimeSafe = jobsOverTime.map(row => ({
			date: row.date.toISOString().split('T')[0],
			count: Number(row.count),
		}));

		const statusSafe = byStatus.map(s => ({
      status: s.status,
      count:  s._count.status,
    }));

    const categorySafe = byCategory.map(c => ({
      category: c.category,
      count:    c._count.category,
    }));

    const budgetTypeSafe = byBudgetType.map(b => ({
      type:  b.budgetType,
      count: b._count.budgetType,
    }));

		res.status(StatusCodes.OK).json({
			jobsOverTime: jobsOverTimeSafe,
			byStatus: statusSafe,
			byCategory: categorySafe,
			byBudgetType: budgetTypeSafe,
			avgProposals: Math.round(avgProposals._avg.proposals ?? 0),
		});
	} catch (error) {
		console.error('[getJobsAnalytics]: ', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch jobs analytics'});
	}	
}
