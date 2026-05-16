import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import { NotFoundError } from '../middleware/error.handler';
import type { UsersParams } from '../schemas/schema.users';

export async function get(req: Request, res: Response, next: NextFunction) {
	try {
		const {username} = req.params as unknown as UsersParams;

		const user = await prisma.user.findUnique({
			where: {username},
			select: {
				id:		   true,
				username:  true,
				firstname: true,
				lastname:  true,
				avatar:	   true,
				isOnline:  true,
				type:	   true,
				title:	   true,
				bio:	   true,
				location:  true,
				website:   true,
				createdAt: true
			}
		});

		if (!user)
			throw new NotFoundError('user not found');

		res.json(user);
	} catch (err) {
		next(err);
	}
}
