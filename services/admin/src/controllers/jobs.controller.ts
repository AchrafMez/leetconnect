import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { JobStatus } from "../../prisma/generated/client";
import { StatusCodes } from 'http-status-codes'
import { ADMIN_EVENTS, publishEvent } from "@leetconnect/shared";

export const getAllJobs = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { search, status, category } = req.query;
		const jobs = await prisma.job.findMany({
			where: {
				...(status && { status: status as JobStatus }),
				...(category && { category: category as string }),
				...(search && {
					OR: [
						{ title: { contains: search as string, mode: 'insensitive'} },
						{ postedByName: { contains: search as string, mode: 'insensitive'} },
						{ skills: { has: search as string } }
					],
				}),
			},

			select: {
				id: true, title: true, description: true, budget: true,
				budgetType: true, category: true, createdBy: true, status: true,
				createdAt: true, proposals: true, skills: true,
				deadline: true, postedByName: true
			},
			orderBy: { createdAt: 'desc'} 
		})
		return res.status(StatusCodes.OK).json(jobs);
	} catch (error) {
		console.error('[getAllJobs]: ', error);
		next(error);
	}
}

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id as string;
		if(!id)
			return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid job id'});
		
		const job = await prisma.job.findUnique({
			where: { id },
			select: {
				id: true, title: true, description: true, budget: true,
				budgetType: true, category: true, createdBy: true, status: true,
				createdAt: true, proposals: true, skills: true,
				deadline: true, postedByName: true
			},
		});

		if(!job)
			return res.status(StatusCodes.NOT_FOUND).json({ message: 'Job not found'});
		
		return res.status(StatusCodes.OK).json(job);
	} catch (error) {
		console.error('[getJob]: ', error);
		next(error);
	}
}

export const editJobStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id as string;
		if(!id)
			return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid job id'});

		const { status } = req.body;

		const updatedJob = await prisma.job.update({
			where: { id },
			data: { status },
			select: {
				id: true, title: true, description: true, budget: true,
				budgetType: true, category: true, createdBy: true, status: true,
				createdAt: true, proposals: true, skills: true,
				deadline: true, postedByName: true
			},
		});

		await publishEvent(ADMIN_EVENTS.CONTENT_UPDATED, updatedJob);
		return res.status(StatusCodes.OK).json(updatedJob);
	} catch (error: any) {
		console.error('[editJob]: ', error);
		next(error);
	}
}

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = req.params.id as string;
		if(!id)
			return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid job id'});
		await prisma.job.delete({
			where: { id }
		});

		await publishEvent(ADMIN_EVENTS.CONTENT_DELETED, { id });
		return res.status(StatusCodes.OK).json({ message: 'Job deleted successfully'});
	} catch (error: any) {
		console.error('[deleteJob]: ', error);
		next(error);
	}
}