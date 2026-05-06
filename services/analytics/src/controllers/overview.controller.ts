import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { getStartDate } from './utils';


export const getOverview = async (req: Request, res: Response) => {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});

	try {
		const [
			totalUsers, totalJobs, activeJobs, flaggedJobs,
			suspendedUsers, pendingUsers, newUsersThisWeek,
			newJobsThisWeek
		] = await Promise.all([
			prisma.user.count(),
			prisma.job.count(),
			prisma.job.count({ where: { status: 'active' }}),
			prisma.job.count({ where: { status: 'flagged'}}),
			prisma.user.count({ where: { status: 'suspended'}}),
			prisma.user.count({ where: { status: 'pending'}}),
			prisma.user.count({
				where: {
					createdAt: { gte: getStartDate('7d')},
				},
			}),
			prisma.job.count({
				where: {
					createdAt: {gte: getStartDate('7d')},
				},
			})
		]);

		res.status(StatusCodes.OK).json({
			totalUsers, totalJobs, activeJobs, flaggedJobs,
			suspendedUsers, pendingUsers, newUsersThisWeek, newJobsThisWeek
		});
	} catch (error) {
		console.error('[getOverview]: ', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch overview'});
	}
}
