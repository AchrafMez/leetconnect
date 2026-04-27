import dotenv			from 'dotenv';
import express			from 'express';
import http				from 'http';
import { Server }		from 'socket.io';

import health_routes	from './routes/route.health';
import convers_routes	from './routes/route.convers';
import message_routes	from './routes/route.messages';
import notif_routes		from './routes/route.notifs';
import friends_routes	from './routes/route.friends';
import users_routes		from './routes/route.users';

import prisma			from './config/config.database';

import error_handler	from './middleware/error.handler';
import { setup_sockets } from './sockets/socket.handler';

import {
	initEventBus, subscribeToEvents,
	AUTH_EVENTS,
	getMetrics,
	httpRequestDuration,
	httpRequestsTotal,
} from '@leetconnect/shared';

import { authMiddleware } from '@leetconnect/shared';

dotenv.config({ path: '../../.env', quiet: true});

const PORT = process.env.CHAT_DB_PORT || 3003;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: { origin: '*' },
});

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
app.use('/api/chat/convers', 			  convers_routes);
app.use('/api/chat/convers/:id/messages', message_routes);
app.use('/api/friend/requests', 		  friends_routes);
app.use('/api/notifs', 					  notif_routes);
app.use('/api/chat',					  users_routes);

app.use(error_handler);

setup_sockets(io);
start_chat_server();

async function start_chat_server() {
	try {
		initEventBus();
		subscribeToEvents('user.*', async (channel, message: any) => {
			const data = message.data;
			if (channel === AUTH_EVENTS.USER_REGISTERED) {
				await prisma.user.upsert({
					where:  {id: data.id },
					update: {email: data.email, username: data.datasername, firstname: data.firstname, lastname: data.lastname, role: data.role, type: data.type},
					create: {id: data.id, email: data.email, username: data.username, firstname: data.firstname, lastname: data.lastname, role: data.role, type: data.type}
				});
			} else if (channel === AUTH_EVENTS.USER_UPDATED) {
				await prisma.user.update({
					where: {id: data.id},
					data:  {email: data.email, username: data.username, firstname: data.firstname, lastname: data.lastname, avatar: data.avatar, bio: data.bio}
				});
			}
			console.log(`user synced to chat_db: [${data.id}](${data.username})`);
		});
		await prisma.$connect().then( () => {
			console.log('connected to database.');
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
	io.close(); 
	await prisma.$disconnect();
	console.log('disconnected from database.');
	process.exit(0);
}

process.on('SIGINT', server_exit);
