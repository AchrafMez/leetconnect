import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { JobStatus } from "@prisma/client";

export const getAllJobs = async (req: Request, res: Response) => {
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
				id: true,
				title: true,
				description: true,
				budget: true,
				budgetType: true,
				category: true,
				createdBy: true,
				status: true,
				createdAt: true,
				proposals: true,
				skills: true,
				deadline: true,
				postedByName: true
			},
			orderBy: { createdAt: 'desc'} 
		})
		res.status(200).json(jobs);
	} catch (error) {
		console.error('[getAllJobs]: ', error);
		res.status(500).json({ message: 'Failed to fetch jobs'});
	}
}

export const getJob = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string;
		if(!id)
			return res.status(400).json({ message: 'Invalid job id'});
		
		const job = await prisma.job.findUnique({
			where: { id },
			select: {
				id: true,
				title: true,
				description: true,
				budget: true,
				budgetType: true,
				category: true,
				createdBy: true,
				status: true,
				createdAt: true,
				proposals: true,
				skills: true,
				deadline: true,
				postedByName: true
			},
		});

		if(!job)
			return res.status(404).json({ message: 'Job not found'});
		
		res.status(200).json(job);
	} catch (error) {
		console.error('[getJob]: ', error);
		res.status(500).json({ message: 'Failed to fetch job'});
	}
}

export const editJobStatus = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string;
		if(!id)
			return res.status(400).json({ message: 'Invalid job id'});

		const { status } = req.body;

		const updateJob = await prisma.job.update({
			where: { id },
			data: { status },
			select: {
				id: true,
				title: true,
				description: true,
				budget: true,
				budgetType: true,
				category: true,
				createdBy: true,
				status: true,
				createdAt: true,
				proposals: true,
				skills: true,
				deadline: true,
				postedByName: true
			},
		});
		res.status(200).json(updateJob);
	} catch (error: any) {
		if(error?.code === 'P2025') {
			return res.status(404).json({ message: 'Job not found'});
		}
		console.error('[editJob]: ', error);
		res.status(500).json({ message: 'Failed to update job status'});
	}
}

export const deleteJob = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string;
		if(!id)
			return res.status(400).json({ message: 'Invalid job id'});
		await prisma.job.delete({
			where: { id }
		});

		res.status(204).json({ message: 'Job deleted successfully'});
	} catch (error: any) {
		if(error?.code === 'P2025')
			return res.status(404).json({ message: 'Job not foudn'});
		console.error('[deleteJob]: ', error);
		res.status(500).json({ message: 'Failed to delete job'});
	}
}