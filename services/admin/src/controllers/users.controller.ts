import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { Role, Status } from "../../prisma/generated/client";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ADMIN_EVENTS, publishEvent } from "@leetconnect/shared";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;
	
	if(user?.role !== 'ADMIN' && user?.role !== 'MODERATOR')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});
	try {
		const { search, role, status } = req.query;
		const users = await prisma.user.findMany({
			where: {
				...(role && { role: role as Role }),
				...(status && { status: status as Status }),
				...(search && {
					OR: [
						{ email: { contains: search as string, mode: 'insensitive' } },
						{ firstname: { contains: search as string, mode: 'insensitive' } },
						{ lastname: { contains: search as string, mode: 'insensitive' } },
						{ username: { contains: search as string, mode: 'insensitive' } }
					],
				}),
			},

			select: {
				id: true, email: true, username: true, firstname: true,
				lastname: true, status: true, role: true, type: true,
				avatar: true, createdAt: true
			},
			orderBy: { createdAt: 'desc' }
		});

		return res.status(StatusCodes.OK).json(users);

	} catch (error) {
		console.error('[getAllUsers]', error);
		next(error);
		// res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch users'});
	}
}

export const getUser =  async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	if(user?.role !== 'ADMIN' && user?.role !== 'MODERATOR')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});
	try {
			const id = req.params.id as string;
			if(!id) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user id'});
			}
	
			const u = await prisma.user.findUnique({
				where: { id },
				select: {
					id: true, email: true, username: true, firstname: true,
					lastname: true, status: true, role: true, type: true,
					avatar: true, createdAt: true
				},
			});
	
			if(!u) {
				return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found!'});
			}
	
			return res.status(StatusCodes.OK).json(u);
	} catch (error) {
		console.error('[getUser]: ', error);
		next(error);
		// res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch user'});
	}
}

export const editUserStatus = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});
	try {
			const id = req.params.id as string;
			if(!id) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user id'});
			}
	
			const u = await prisma.user.findUnique({
				where: { id }
			});
			if(u?.role === 'ADMIN')
				return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});

			const { status } = req.body;
	
			const updatedUser = await prisma.user.update({
				where: { id },
				data: { status },
				select: {
					id: true, email: true, username: true, firstname: true,
					lastname: true, status: true, role: true, type: true,
					avatar: true, createdAt: true
				},
			});

			await publishEvent(ADMIN_EVENTS.USER_UPDATED, updatedUser);
			return res.status(StatusCodes.OK).json(updatedUser);
	} catch (error: any) {
		console.error('[updateUserStatus]: ', error);
		next(error);
		// if ( error?.code === 'P2025') {
		// 	return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found'});
		// }
		// res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update user statsu'});
	}
}

export const editUserRole = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});
	try {
		const id = req.params.id as string;
			if(!id) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user id'});
			}
			
			const u = await prisma.user.findUnique({
				where: { id }
			});
			if(u?.role === 'ADMIN')
				return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});

			const { role } = req.body;
	
			const updatedUser = await prisma.user.update({
				where: { id },
				data: { role },
				select: {
					id: true, email: true, username: true, firstname: true,
					lastname: true, status: true, role: true, type: true,
					avatar: true, createdAt: true
				},
			});

			await publishEvent(ADMIN_EVENTS.USER_UPDATED, updatedUser);
			return res.status(StatusCodes.OK).json(updatedUser);
	} catch (error: any) {
		console.error('[updateUserRole]: ', error);
		next(error);
		// if (error?.code === 'P2025') {
		// 	return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found'});
		// }
		// res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update user role'});
	}
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});
	try {
		const id = req.params.id as string;
			if(!id)
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user id'})
	
			const deletedUser = await prisma.user.findUnique({
				where: { id }
			});
			if (deletedUser?.role === 'ADMIN')
				return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});

			await prisma.user.delete({
				where: { id }
			});
	
			await publishEvent(ADMIN_EVENTS.USER_DELETED, { id });
			return res.status(StatusCodes.OK).json( { message: 'User deleted successfully'});
	} catch (error: any) {
		console.error('[deleteUser]: ', error);
		next(error);
		// if(error?.code === 'P2025') {
		// 	return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found'});
		// }
		// res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete user'});
	}
}
