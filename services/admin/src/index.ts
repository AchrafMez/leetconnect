import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health';
import { errorHandler } from '@leetconnect/shared';

const app = express();
const PORT =  3005;

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`admin service running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('shutting down admin service...');
  process.exit(0);
});