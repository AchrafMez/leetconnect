import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { StatusCodes } from 'http-status-codes'
import { getStartDate } from './utils';


export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const [
			totalUsers, totalJobs, activeJobs, flaggedJobs,
			suspendedUsers, newUsersThisWeek,
			newJobsThisWeek
		] = await Promise.all([
			prisma.user.count(),
			prisma.job.count(),
			prisma.job.count({ where: { status: 'active' }}),
			prisma.job.count({ where: { status: 'flagged'}}),
			prisma.user.count({ where: { status: 'suspended'}}),
			prisma.user.count({
				where: {
					createdAt: { gte: getStartDate('7d')},
				},
			}),
			prisma.job.count({
				where: {
					createdAt: { gte: getStartDate('7d')},
				},
			})
		]);

		res.status(StatusCodes.OK).json({
			totalUsers, totalJobs, activeJobs, flaggedJobs,
			suspendedUsers, newUsersThisWeek, newJobsThisWeek
		});
	} catch (error) {
		next(error);
	}
}
