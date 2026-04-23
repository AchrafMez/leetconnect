// import { Router, Request, Response } from 'express';
// import sequelize from'../config/database';

// const router = Router();

// router.get('/health', async (req: Request, res: Response) => {
//     try {
//         await sequelize.authenticate();
//         res.json({ status: 'ok', service: 'chat', timestamp: new Date().toISOString() });
//     } catch (err) {
//         const error = err as Error;
//         res.status(503).json({ status: 'error', service: 'chat', error: error.message });
//     }
// });
// export default router;
