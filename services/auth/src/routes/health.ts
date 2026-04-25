import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

const healthHandler = async (req: Request, res: Response) => {
  try {
    // Prisma equivalent of sequelize.authenticate()
    // This sends a simple 'SELECT 1' to the DB to see if it's alive
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'UP',
      database: 'connected',
      service: 'auth-service'
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

router.get('/', healthHandler);
router.get('/health', healthHandler);

export default router;