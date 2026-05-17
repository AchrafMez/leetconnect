import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import './lib/passport';

// shared resources
import { initEventBus, closeEventBus, errorHandler, getMetrics, httpRequestDuration, httpRequestsTotal, subscribeToEvents, EVENTS, ADMIN_EVENTS, redisClient} from '@leetconnect/shared';

import cookieParser from 'cookie-parser'; // to store tokens in cookies
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';
import healthRoutes from './routes/health';
import { rateLimit } from 'express-rate-limit';
import path from 'path';

const app = express();
app.set('trust proxy', 1);
const PORT =  3001;


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
app.use(passport.initialize());
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(await getMetrics());
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// add rate limiting  fpr login and register routes
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,    // 15 minutes
    max: 10,                     // 10 requests per IP per 15 minutes
    message: { error: "Too many accounts created from this IP, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts, try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});


const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500, // Increased to 500 to prevent 429s during dev page reloads
    message: { error: 'Too many refresh attempts' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/refresh', refreshLimiter);

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
    
    // Subscribe to marketplace review events
    subscribeToEvents(EVENTS.REVIEW_SUBMITTED, async (channel, message: any) => {
      try {
        const { userId, rating: newRating } = message.data;
        if (!userId || newRating === undefined) return;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { rating: true, reviewCount: true }
        });

        if (user) {
          const currentCount = user.reviewCount || 0;
          const currentRating = user.rating || 0;
          const updatedCount = currentCount + 1;
          const updatedRating = ((currentRating * currentCount) + newRating) / updatedCount;

          await prisma.user.update({
            where: { id: userId },
            data: {
              rating: updatedRating,
              reviewCount: updatedCount
            }
          });
          // console.log(`Updated rating for user ${userId}: ${updatedRating.toFixed(2)} (${updatedCount} reviews)`);
        }
      } catch (err) {
        // console.error('Failed to update aggregated rating:', err);
      }
    });

    // subscribe to Admin user deletion
    subscribeToEvents(ADMIN_EVENTS.USER_DELETED, async (channel, message: any) => {
      try {
        const { id } = message.data;
        if (!id) return;

        // Transaction ensures we delete tokens AND user
        await prisma.$transaction([
          prisma.refreshToken.deleteMany({ where: { userId: id } }),
          prisma.user.delete({ where: { id } })
        ]);
        
        if (redisClient) {
          // Block token for 15 minutes (900s) to instantly invalidate access tokens
          await redisClient.setex(`revoked:${id}`, 900, 'true');
        }

        console.log(`[EVENT] Admin deleted user: ${id}. Auth records wiped & revoked in Redis.`);
      } catch (err) {
        // console.error('Admin User Deletion Sync Failed:', err);
      }
    });

    // subscribe to admin user update (changing role ...)
    subscribeToEvents(ADMIN_EVENTS.USER_UPDATED, async (channel, message: any) => {
      try {
        const { id, role, status, email, username } = message.data;
        if (!id) return;

        // If the admin suspended the user, we immediately revoke their sessions
        if (status === 'suspended') {
          await prisma.refreshToken.deleteMany({ where: { userId: id } });
          if (redisClient) {
            await redisClient.setex(`revoked:${id}`, 900, 'true');
          }
          console.log(`[EVENT] User ${id} suspended by admin. Sessions revoked in DB and Redis.`);
        } else if (status === 'active') {
          if (redisClient)
            await redisClient.del(`revoked:${id}`);
        }

        await prisma.user.update({
          where: { id },
          data: {
            role,      // Sync role changes
            status,    // Sync suspension status
          }
        });

        console.log(`[EVENT] Admin updated user: ${id}. Auth DB synchronized.`);
      } catch (err) {
        // console.error('Admin User Update Sync Failed:', err);
      }
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`auth service running on port ${PORT}`);
    });
  } catch (err) {
    const error = err as Error;
    // console.error('auth service failed to start:', error.message);
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