import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/database';
import healthRoutes from './routes/health';
import { initEventBus, closeEventBus } from '@leetconnect/shared';
import { errorHandler } from '@leetconnect/shared';

const app = express();
const PORT = 3004;

// middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// routes
app.use('/api/analytics', healthRoutes);

// error handler (must be after all routes)
app.use(errorHandler);

// start
async function start() {
  try {
    await sequelize.authenticate();
    console.log('analytics db connected');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('analytics models synced');
    initEventBus(process.env.REDIS_URL);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`analytics service running on port ${PORT}`);
    });
  } catch (err) {
    const error = err as Error;
    console.error('analytics service failed to start:', error.message);
    process.exit(1);
  }
}
start();

// shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down analytics service...');
  await closeEventBus();
  await sequelize.close();
  process.exit(0);
});