import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// import healthRoutes from './routes/health';
import { initEventBus,
				 closeEventBus,
				 authMiddleware,
				 errorHandler,
				 getMetrics,
				 httpRequestDuration,
				 httpRequestsTotal } from '@leetconnect/shared';
import analyticsRoutes from "./routes/analytics.route"
import { connectDb, disconnectDb } from './config/prisma';
import { RegisterEventHandlers } from './events';
import { limiter } from './middleware/limiters';
import { Server } from 'node:http';

const app = express();

const PORT = 3004;
const corsOpts = {
  origin: process.env.FRONTEND_URL || 'https://localhost:5173', // Only allows requests from  React frontend
  credentials: false
}

app.set('trust proxy', 1);

app.use(limiter);
app.use(helmet());
app.use(cors(corsOpts));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(authMiddleware);

app.use('/api/admin/analytics', analyticsRoutes);

app.use(errorHandler);

let server: Server;

const startServer = async () => {
  try {
    await connectDb();
    await initEventBus();
    RegisterEventHandlers();

    server = app.listen(PORT, () => {
      console.log(`Admin Service listening on PORT ${PORT}...`);
    });
  } catch (error) {
    console.error('Critical failure during startup:', error);
    process.exit(1);
  }
};
startServer();

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

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(await getMetrics());
});
// routes (health must be before auth middleware)
// app.use('/api/analytics', healthRoutes);

const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  
  if (server) {
    server.close(async () => {
      try {
        await disconnectDb();
        console.log('Database disconnected and server closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during database disconnection:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection at Promise:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  gracefulShutdown('Uncaught Exception');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));