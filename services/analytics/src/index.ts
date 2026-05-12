import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/database';
import healthRoutes from './routes/health';
import { initEventBus,
				 closeEventBus,
				 authMiddleware,
				 errorHandler,
				 getMetrics,
				 httpRequestDuration,
				 httpRequestsTotal } from '@leetconnect/shared';
import analyticsRoutes from "./routes/analytics.route"
import { connectDb } from './config/prisma';
import { RegisterEventHandlers } from './events';
import { limiter } from './middleware/limiters';

connectDb();
initEventBus();
RegisterEventHandlers()

const app = express();
const PORT = 3004;

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationSeconds = (Date.now() - start) / 1000;
    const route = req.route?.path ?? req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestDuration.observe(labels, durationSeconds);
    httpRequestsTotal.inc(labels);
  });

  next();
});

const corsOpts = {
  origin: process.env.FRONTEND_URL || 'https://localhost:5173', // Only allows requests from  React frontend
  credentials: true // Required to accept cookies from the frontend
}

// middleware
app.use(limiter);
app.use(helmet());
app.use(cors(corsOpts));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(await getMetrics());
});
// routes (health must be before auth middleware)
app.use('/api/analytics', healthRoutes);

app.use(authMiddleware);

app.use('/api/admin/analytics', analyticsRoutes);

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