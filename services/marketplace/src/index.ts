import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import healthRoutes from './routes/health';
import { initEventBus, closeEventBus, errorHandler } from '@leetconnect/shared';
import fs from 'fs';
import https from 'https';
import jobsRoutes from "./routes/jobs";
import proposalsRoutes from "./routes/proposals";

const app = express();
const prisma = new PrismaClient();
const PORT = 3002;

const sslOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH as string),
};

// middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

    https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
      console.log(`marketplace service running on port ${PORT}`);
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