import dotenv			from 'dotenv';
import express			from 'express';
import morgan			from 'morgan';
import http				from 'http';
import cors				from 'cors';
import helmet			from 'helmet';
import { Server }		from 'socket.io';

import health_routes	from './routes/route.health';
import convers_routes	from './routes/route.convers';
import message_routes	from './routes/route.messages';
import notif_routes		from './routes/route.notifs';
import friends_routes	from './routes/route.friends';
import users_routes		from './routes/route.users';

import prisma			from './config/config.database';

import error_handler	from './middleware/error.handler';
import { rateLimit, ipKeyGenerator }from 'express-rate-limit';
import { setup_sockets } from './sockets/socket.handler';

import {
	initEventBus, subscribeToEvents,
	AUTH_EVENTS,
	ADMIN_EVENTS,
	getMetrics,
	httpRequestDuration,
	httpRequestsTotal,
	EVENTS,
} from '@leetconnect/shared';

import { authMiddleware } from '@leetconnect/shared';
import { reset_presence, shutdown_presence } from './lib/presence';
import {  type NotifEventPayload, notify } from './lib/notify';

dotenv.config({ path: '../../.env', quiet: true});

const PORT = process.env.CHAT_DB_PORT || 3003;
const ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: ORIGIN,
		credentials: true
	}
});

app.set('trust proxy', 1);
const global_limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 1000,
	message: {error: 'Chat service global limiter'},
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.path === '/metrics' || req.path === '/api/chat/health',
});

const message_limiter = rateLimit({
	windowMs: 60 * 1000,
	max: 30,
	message: {error: 'Messaging spam detected.'},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).user?.userId ?? ipKeyGenerator(req.ip ?? ''),
});

const write_limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	max: 60,
	message: {error: 'Too many requests detected.'},
	standardHeaders: true,
	legacyHeaders: false,
	keyGenerator: (req) => (req as any).user?.userId ?? ipKeyGenerator(req.ip ?? ''),
	skip: (req) => req.method === 'GET' || req.method === 'HEAD'
});

app.use(helmet());

app.use(cors({
	origin: ORIGIN,
	credentials: true
}));

app.use(global_limiter);

app.use(morgan('dev'));
app.use(express.json());
app.set('io', io);

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

app.get('/metrics', async (_req, res) => {
	res.set('Content-Type', 'text/plain; version=0.0.4');
	res.send(await getMetrics());
});

app.use('/api/chat', health_routes);

app.use(authMiddleware);
app.use('/api/chat/convers', 			  write_limiter, convers_routes);
app.use('/api/chat/convers/:id/messages', message_limiter, message_routes);
app.use('/api/friend/requests', 		  write_limiter, friends_routes);
app.use('/api/notifs', 					  notif_routes);
app.use('/api/chat',					  users_routes);

app.use(error_handler);

setup_sockets(io);
start_chat_server();

async function start_chat_server() {
	try {
		await prisma.$connect().then( () => {
			console.log('connected to database.');
		});

		initEventBus();
		subscribeToEvents('user.*', async (channel, message: any) => {
			try {
				const data = message?.data;
				if (!data?.id) return;

				if (channel === AUTH_EVENTS.USER_REGISTERED) {
					await prisma.user.upsert({
						where:  {id: data.id},
						update: {email: data.email, username: data.username,
							firstname: data.firstname, lastname: data.lastname,
							role: data.role, type: data.type, avatar: data.avatar
						},
						create: {id: data.id, email: data.email, username: data.username,
							firstname: data.firstname, lastname: data.lastname,
							role: data.role, type: data.type, avatar: data.avatar
						}
					});
				} else if (channel === AUTH_EVENTS.USER_UPDATED) {
					await prisma.user.update({
					where: {id: data.id},
					data:  {
							email: data.email, username: data.username, firstname: data.firstname,
							lastname: data.lastname, avatar: data.avatar, bio: data.bio,
							location: data.location, website: data.website, title: data.title
						}
					});
				} else if (channel === ADMIN_EVENTS.USER_DELETED) {
					await prisma.user.delete({where: {id: data.id}}).catch((err: any) => {
						console.error('failed to delete user:', err);
						throw err;
					});
				} else {
					return ;
				}
				console.log(`user synced to chat_db: ${channel} [${data.id}]`);
			} catch (err) {
				console.error(`[user sync] ${channel} failed:`, (err as Error).message);
			}
		});

		await reset_presence();

		subscribeToEvents(EVENTS.NOTIF_CREATE, async (channel, message: any) => {
			if (channel !== EVENTS.NOTIF_CREATE) return;
			try {
				const data = message?.data as NotifEventPayload | undefined;
				if (!data?.user_id || !data.type || !data.title) return;

				await notify(io, {
					user_id: data.user_id,
					type:	 data.type,
					title:	 data.title,
					...(data.body != null && { body: data.body }),
				});
			} catch (err) {
				console.error('[notif] sync failed:', (err as Error).message);
			}
		});
		server.listen(PORT, () => {
			console.log(`chat server running on port: ${PORT}`);
		});
	} catch (err) {
		console.log('error accured');
		process.exit(1);
	}
}

async function server_exit() {
	console.log('\nshutting down chat server');
	await shutdown_presence();
	io.close(); 
	await prisma.$disconnect();
	console.log('disconnected from database.');
	process.exit(0);
}

process.on('SIGINT', server_exit);
process.on('SIGTERM', server_exit);
