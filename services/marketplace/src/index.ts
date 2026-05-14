import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from './config/prisma';
import healthRoutes from './routes/health';
import { initEventBus, closeEventBus, errorHandler,  getMetrics,  } from '@leetconnect/shared';
import jobsRoutes from "./routes/jobs";
import proposalsRoutes from "./routes/proposals";

import { initConsumers } from './config/consumer';

const app = express();

const PORT = 3002;

// middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://localhost:5173', // Only allows requests from  React frontend
    credentials: true // Required to accept cookies from the frontend
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(await getMetrics());
});
// routes
app.use('/api/market', healthRoutes);
app.use("/api/market/jobs", jobsRoutes);
app.use("/api/market/proposals", proposalsRoutes);

// global error handler
app.use(errorHandler);

// start server
async function start() {
  try {

    
    await prisma.$connect();
    console.log('marketplace db connected with Prisma');

    initEventBus(process.env.REDIS_URL as string);
    initConsumers();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Marketplace service running on port ${PORT}`);
    });
  } catch (err) {
    const error = err as Error;
    console.error('marketplace service failed to start:', error.message);
    process.exit(1);
  }
}

start();

// graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down marketplace service...');
  await closeEventBus();
  await prisma.$disconnect();
  process.exit(0);
});