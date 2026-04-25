import { Request, Response } from "express";
import { prisma } from "../config/prisma";

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

export const getRoles = async (req: Request, res: Response) => {
	const user = req.user;

	if(user?.role !== 'ADMIN')
		return res.status(403).json({ message: 'Forbidden'});

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

		return res.status(200).json(roles);
	} catch (error) {
		console.error('[getPermissionConfig]: ', error);
		return res.status(500).json({ message: 'Failed to fetch roles'});
	}
}
