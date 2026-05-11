import express from "express"
import cors from "cors"
import helmet from 'helmet'
import usersRoutes from "./routes/users.route"
import jobsRoutes from "./routes/jobs.route"
import rolesRoutes from "./routes/roles.route"
import healthRoutes from "./routes/health"
import { connectDb, disconnectDb } from './config/prisma'
import { Server } from "http"
import { authMiddleware, initEventBus } from '@leetconnect/shared';
import { errorHandler } from "./errorHandler"
import { RegisterEventHandlers } from "./events"

connectDb();
initEventBus();
RegisterEventHandlers();

const app = express();
const PORT = 3005;

const corsOpts = {
  origin: process.env.FRONTEND_URL || 'https://localhost:5173', // Only allows requests from  React frontend
  credentials: true // Required to accept cookies from the frontend
}

app.use(cors(corsOpts));
app.use(express.json());
app.use(helmet());

// Register health route before auth middleware so healthchecks don't need a token
app.use('/api/admin', healthRoutes);

app.use(authMiddleware);

app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/jobs', jobsRoutes);
app.use('/api/admin/roles', rolesRoutes);

app.use(errorHandler);

const server: Server = app.listen(PORT, () => {
	console.log(`Admin listening on PORT ${PORT}...`);
})


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