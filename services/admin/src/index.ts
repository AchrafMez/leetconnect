import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health';
import { errorHandler, getMetrics, httpRequestDuration, httpRequestsTotal } from '@leetconnect/shared';
// import fs from 'fs';
// import https from 'https';


const app = express();
const PORT =  3005;
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
app.use('/api/admin', healthRoutes);

// error handler (must be after all routes)
app.use(errorHandler);

// start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`admin service running on port ${PORT}`);
});



process.on('SIGTERM', () => {
  console.log('shutting down admin service...');
  process.exit(0);
});