import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../config/config.database';

const router = Router();

// http:localhost:1337/api/chat

router.get('/health', async (_req: Request, res: Response) => {
	// console.log('/health endponit');
	// res.send('/health endponit');
	try {
		await prisma.$queryRaw`SELECT 1`;
		res.status(201).json({
			status: 'ok',
			service: 'chat',
			timestamp: new Date()
		});
	}  catch (err) {
		res.status(500).json({
			status: 'error',
			service: 'chat',
			timestamp: new Date()
		});
	}
});

export default router;