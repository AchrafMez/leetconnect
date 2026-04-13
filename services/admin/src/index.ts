import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import usersRoutes from "./routes/users"
import jobsRoutes from "./routes/jobs"
import { connectDb, disconnectDb } from './config/prisma'
import { Server } from "http"

dotenv.config();
connectDb();

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/jobs', jobsRoutes);

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