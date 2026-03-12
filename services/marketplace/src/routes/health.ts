import { Router, Request, Response, request, response } from 'express';
import sequelize from '../config/database';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', service: 'marketplace', timestamp: new Date().toISOString() });
  } catch (err) {
    const error = err as Error;
    res.status(503).json({ status: 'error', service: 'marketplace', error: error.message });
  }
});
module.exports = router;