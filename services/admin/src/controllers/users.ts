import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { Role, Status } from '@prisma/client'

export const getAllUsers = async (req: Request, res: Response) => {
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
				id: true,
				email: true,
				username: true,
				firstname: true,
				lastname: true,
				status: true,
				role: true,
				type: true,
				avatar: true,
				createdAt: true
			},
			orderBy: { createdAt: 'desc' }
		});

		const transformed = users.map(user => ({
			...user,
			name: `${user.firstname} ${user.lastname}`.trim()
		}));
		res.status(200).json(transformed);
	} catch (error) {
		console.error('[getAllUsers]', error);
		res.status(500).json({ message: 'Failed to fetch users'});
	}
}

export const getUser =  async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string;
		if(!id) {
			return res.status(400).json({ message: 'Invalid user id'});
		}

		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				username: true,
				firstname: true,
				lastname: true,
				status: true,
				role: true,
				type: true,
				avatar: true,
				createdAt: true
			},
		});

		if(!user) {
			return res.status(404).json({ message: 'User not found!'});
		}

		const transformed = {
			...user,
			name: `${user.firstname} ${user.lastname}`.trim(),
		}

		res.status(200).json(transformed);
			
	} catch (error) {
		console.error('[getUser]: ', error);
		res.status(500).json({ message: 'Failed to fetch user'});
	}
}

export const editUserStatus = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string;
		if(!id) {
			return res.status(400).json({ message: 'Invalid user id'});
		}

		const { status } = req.body;

		const updateUser = await prisma.user.update({
			where: { id },
			data: { status },
			select: {
				id: true,
				email: true,
				username: true,
				firstname: true,
				lastname: true,
				status: true,
				role: true,
				type: true,
				avatar: true,
				createdAt: true
			},
		});

		const transformed = {
			...updateUser,
			name: `${updateUser.firstname} ${updateUser.lastname}`.trim()
		}
		res.status(200).json(transformed);

	} catch (error: any) {
		if ( error?.code === 'P2025') {
			return res.status(404).json({ message: 'User not found'});
		}
		console.error('[updateUserStatus]: ', error);
		res.status(500).json({ message: 'Failed to update user statsu'});
	}
}

export const editUserRole = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string;
		if(!id) {
			return res.status(400).json({ message: 'Invalid user id'});
		}

		const { role } = req.body;

		const updateUser = await prisma.user.update({
			where: { id },
			data: { role },
			select: {
				id: true,
				email: true,
				username: true,
				firstname: true,
				lastname: true,
				status: true,
				role: true,
				type: true,
				avatar: true,
				createdAt: true
			},
		});

		const transformed = {
			...updateUser,
			name: `${updateUser.firstname} ${updateUser.lastname}`.trim()
		}
		res.status(200).json(transformed);
	} catch (error: any) {
		if (error?.code === 'P2025') {
			return res.status(404).json({ message: 'User not found'});
		}
		console.error('[updateUserRole]: ', error);
		res.status(500).json({ message: 'Failed to update user role'});
	}
}

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const id = req.params.id as string
		if(!id)
			return res.status(400).json({ message: 'Invalid user id'})

		await prisma.user.delete({
			where: { id }
		});

		res.status(204).json( { message: 'User deleted successfully'})
	} catch (error: any) {
		if(error?.code === 'P2025') {
			return res.status(404).json({ message: 'User not found'});
		}
		console.error('[deleteUser]: ', error);
		res.status(500).json({ message: 'Failed to delete user'});
	}
}
