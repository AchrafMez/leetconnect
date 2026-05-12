import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      service: 'marketplace',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const error = err as Error;

    res.status(503).json({
      status: 'error',
      service: 'marketplace',
      error: error.message,
    });
  }
});

export default router;