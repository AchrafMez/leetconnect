import { Router, Request, Response } from "express";
import { authMiddleware } from "@leetconnect/shared";
import prisma from "../config/config.database";
import { NotFoundError } from "../middleware/error.handler";

const router = Router();

router.get('/users/:username', authMiddleware, async (req: Request, res: Response, next) => {
		try {
				const user = await prisma.user.findUnique({
						where: {
							username: req.params.username as string
						},
						select: {
							id: true,
							username: true,
							firstname: true,
							lastname: true,
							avatar: true,
							isOnline: true,
							type: true,
							title: true,
							bio: true,
							location: true,
							website: true,
							createdAt: true
						},
				});
				if (!user) {
					throw new NotFoundError('user not found');
				}
				res.json(user);
		} catch (err) {
			next(err);
		}
});

export default router;