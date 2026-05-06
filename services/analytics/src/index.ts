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
				 httpRequestsTotal,
				 AUTH_EVENTS,
				 subscribeToEvents,  
				 ADMIN_EVENTS } from '@leetconnect/shared';
import analyticsRoutes from "./routes/analytics.route"
import { connectDb, prisma } from './config/prisma';


// import fs from 'fs';
// import https from 'https';
connectDb();
initEventBus();

const app = express();
const PORT = 3004;
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
app.use(authMiddleware);

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4');
  res.send(await getMetrics());
});
// routes
app.use('/api/analytics', healthRoutes);
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

	subscribeToEvents(AUTH_EVENTS.USER_REGISTERED, async(channel, message: any) => {
		try {
			const { id, username, avatar, role, email, firstname, lastname, status, createdAt } = message.data;

			await prisma.user.upsert({
				where: { id: id },
				update: {
					username: username, avatar: avatar, firstname: firstname,
					lastname: lastname, status: status, role: role
				},
				create: {
          id: id, username: username, avatar: avatar, role: role,
					email: email, firstname: firstname, lastname: lastname,
					status: status, createdAt: createdAt
        }
			});

			console.log(`Synced user ${username} to Analytics DB`);
		} catch (error) {
			console.error(`Sync failed for user:`, error);
		}
	})
	subscribeToEvents(AUTH_EVENTS.USER_UPDATED, async(channel, message: any) => {
		try {
			const { id, username, avatar, email, firstname, lastname } = message.data;
	
			await prisma.user.update({
				where: { id: id },
				data: { username, avatar, firstname, lastname, email},
				select: {
					id: true, email: true, firstname: true, lastname: true, avatar: true, username: true
				}
			});
			
			console.log(`Synced user ${username} to Analytics DB`);
		} catch (error) {
			console.error(`Sync failed for user:`, error);
		}
	})
	subscribeToEvents(ADMIN_EVENTS.USER_UPDATED, async(channel, message: any) => {
		try {
			const { id , username, role, status } = message.data;

			await prisma.user.update({
				where: { id: id },
				data: { role },
				select: {
					id: true,
					role: true
				}
			});

			console.log(`Synced user ${username} to Analytics DB`);
		} catch (error) {
			console.error(`Sync failed for user:`, error);
		}
	})


// shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down analytics service...');
  await closeEventBus();
  await sequelize.close();
  process.exit(0);
});