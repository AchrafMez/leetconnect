import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health';
import { errorHandler } from '@leetconnect/shared';
import fs from 'fs';
import https from 'https';

const app = express();
const PORT =  3005;
const sslOptions = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH as string)
};


// middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use('/api/admin', healthRoutes);

// error handler (must be after all routes)
app.use(errorHandler);

// start
https.createServer(sslOptions, app).listen(PORT, '0.0.0.0', () => {
  console.log(`admin service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('shutting down admin service...');
  process.exit(0);
});