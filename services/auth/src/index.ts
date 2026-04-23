import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// shared resources
import { initEventBus, closeEventBus, errorHandler} from '@leetconnect/shared';

// ensure zero trust 
// import fs from 'fs';
// import https from 'https';
import cookieParser from 'cookie-parser'; // to store tokens in cookies
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health';
import { rateLimit } from 'express-rate-limit';

const app = express();
const PORT =  3001;

// SSL configuration
// const sslOptions = {
//     key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
//     cert: fs.readFileSync(process.env.SSL_CERT_PATH as string)
// };

// middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://localhost:5173', // Only allows requests from  React frontend
    credentials: true // Required to accept cookies from the frontend
}));
app.use(morgan('dev')); // display logs
app.use(express.json()); // takes body of request and turn it into req.body object
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// add rate limiting 
// const authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,    // 15 minutes
//     max: 10,                     // 10 requests per IP per 15 minutes
//     message: { error: "Too many accounts created from this IP, try again later" },
//     standardHeaders: true,
//     legacyHeaders: false,
// });

// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 5,
//     message: { error: 'Too many login attempts, try again later' },
//     standardHeaders: true,
//     legacyHeaders: false,
// });


// app.use('/api/auth/register', authLimiter);
// app.use('/api/auth/login', loginLimiter);

// routes
app.use('/api/auth', healthRoutes);
app.use('/api/auth/', authRoutes);

// error handler (must be after all routes)
app.use(errorHandler);

// start
async function start() {
  try {
    await prisma.$connect(); // connect with postgres database
    console.log('auth db connected');
    initEventBus(process.env.REDIS_URL); // conntect Auth service to Redis ??
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`auth service running on port ${PORT}`);
    });
  } catch (err) {
    const error = err as Error;
    console.error('auth service failed to start:', error.message);
    process.exit(1);
  }
}
start();

// shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down auth service...');
  await closeEventBus();
  await prisma.$disconnect();
  process.exit(0);
});