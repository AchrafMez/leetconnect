import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/database';
import healthRoutes from './routes/health';
import { closeEventBus, errorHandler, getMetrics, httpRequestDuration, httpRequestsTotal, initEventBus } from '@leetconnect/shared';
// import fs from 'fs';
// import https from 'https';

const app = express();
const PORT =  3002;

// const sslOptions = {
//     key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
//     cert: fs.readFileSync(process.env.SSL_CERT_PATH as string)
// };


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

// middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(await getMetrics());
});
// routes
app.use('/api/market', healthRoutes);

// error handler (must be after all routes)
app.use(errorHandler);

// start
async function start() {
  try {
    await sequelize.authenticate();
    console.log('marketplace db connected');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('marketplace models synced');
    initEventBus(process.env.REDIS_URL);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`marketplace service running on port ${PORT}`);
    });
  } catch (err) {
    const error = err as Error;
    console.error('marketplace service failed to start:', error.message);
    process.exit(1);
  }
}
start();

// shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down marketplace service...');
  await closeEventBus();
  await sequelize.close();
  process.exit(0);
});