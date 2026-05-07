import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

const ROLE_CONFIG = {
  ADMIN: {
    label:       'Admin',
    description: 'Full system access',
    permissions: [
      'users:read', 'users:create', 'users:edit', 'users:delete',
      'roles:read', 'roles:create', 'roles:edit', 'roles:delete',
      'content:read', 'content:create', 'content:edit', 'content:delete', 'content:moderate',
    ],
  },
  MODERATOR: {
    label:       'Moderator',
    description: 'Content & user oversight',
    permissions: [
      'content:read', 'content:create', 'content:edit', 'content:delete',
      'content:moderate', 'users:read',
    ],
  },
  USER: {
    label:       'User',
    description: 'Standard platform access',
    permissions: [
      'content:read', 'content:create', 'content:edit',
    ],
  },
};

export const getRoles = async (req: Request, res: Response, next: NextFunction) => {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(StatusCodes.FORBIDDEN).json({ message: ReasonPhrases.FORBIDDEN});

	try {
		const roleCounts = await prisma.user.groupBy({
			by: ['role'],
			_count: { role: true},
		});

		const countMap = roleCounts.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {} as Record<string, number>);

		const roles = Object.entries(ROLE_CONFIG).map(([id, config]) => ({
			id,
			label: config.label,
			description: config.description,
			userCount: countMap[id] ?? 0,
			permissions: config.permissions
		}));

		return res.status(StatusCodes.OK).json(roles);
	} catch (error) {
		console.error('[getPermissionConfig]: ', error);
		next(error);
		// return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch roles'});
	}
}
