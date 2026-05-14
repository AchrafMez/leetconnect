import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { Role, Status } from "../../prisma/generated/client";
import { StatusCodes } from "http-status-codes";
import { ADMIN_EVENTS, publishEvent } from "@leetconnect/shared";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
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
	}
}

export const editUserStatus = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	try {
			const id = req.params.id as string;
			if(!id) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user id'});
			}
	
			if(id === user?.userId) {
				return res.status(StatusCodes.FORBIDDEN).json({ message: 'You cannot change your own status'});
			}

			const { status } = req.body;
	
			const updatedUser = await prisma.user.update({
				where: {
					id,
					role: { not: 'ADMIN' },
				},
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
	}
}

export const editUserRole = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	try {
		const id = req.params.id as string;
			if(!id) {
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user id'});
			}

			if(id === user?.userId) {
				return res.status(StatusCodes.FORBIDDEN).json({ message: 'You cannot change your own role'});
			}

			const { role } = req.body;
	
			const updatedUser = await prisma.user.update({
				where: {
					id,
					role: { not: 'ADMIN' }
				},
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
	}
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;
	try {
		const id = req.params.id as string;
			if(!id)
				return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid user id'})

			if(id === user?.userId) {
				return res.status(StatusCodes.FORBIDDEN).json({ message: 'You cannot delete your own account'});
			}
    		// if the admin delete user also delete all his jobs
			await prisma.job.deleteMany({ where: { clientId: id } });

			await prisma.user.delete({
				where: {
					id,
					role: { not: 'ADMIN' }
				}
			});
	
			await publishEvent(ADMIN_EVENTS.USER_DELETED, { id });
			return res.status(StatusCodes.OK).json( { message: 'User deleted successfully'});
	} catch (error: any) {
		console.error('[deleteUser]: ', error);
		next(error);
	}
}
