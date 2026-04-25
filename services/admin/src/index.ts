import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import usersRoutes from "./routes/users.route"
import jobsRoutes from "./routes/jobs.route"
import rolesRoutes from "./routes/roles.route"
import { connectDb, disconnectDb } from './config/prisma'
import { Server } from "http"
import { authMiddleware, subscribeToEvents, AUTH_EVENTS, initEventBus } from '@leetconnect/shared';
import { prisma } from "./config/prisma"

dotenv.config();
connectDb();
initEventBus();

const app = express();
const PORT = 3005;

// app.use(cors());
app.use(express.json());
app.use(authMiddleware);

app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/jobs', jobsRoutes);
app.use('/api/admin/roles', rolesRoutes);

const server: Server = app.listen(PORT, () => {
	console.log(`Admin listening on PORT ${PORT}...`);
})

async function startEventListener() {
	subscribeToEvents(AUTH_EVENTS.USER_REGISTERED, async(channel, message: any) => {
		try {
			const { id, username, avatar, role, email } = message.data;

			await prisma.user.upsert({
				where: { id: id },
				update: {
					username: username,
					avatar: avatar,
					role: role
				},
				create: {
          id: id, 
          username: username, 
          avatar: avatar,
          role: role,
					email: email
        }
			});

			console.log(`Synced user ${username} to Admin DB`);
		} catch (error) {
			console.error(`Sync failed for user:`, error);
		}
	})
}

startEventListener();

process.on('unhandledRejection', (err) => {
	console.error('Unhadled Rejection', err);
	server.close(async () => {
		await disconnectDb();
		process.exit(1);
	});
});

process.on('uncaughtException', async (err) => {
	console.error('Uncaught Exception', err);
	server.close(async () => {
		await disconnectDb();
		process.exit(1);
	});
});

process.on('SIGTERM', async () => {
	console.log('SIGTERM received, shutting down gracefully');
	server.close(async () => {
		await disconnectDb();
		process.exit(0);
	});
});