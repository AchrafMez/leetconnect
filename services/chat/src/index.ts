import dotenv			from 'dotenv';
import express			from 'express';
import http			from 'http';
// import https			from 'https';
// import fs				from 'fs';
import { Server }		from 'socket.io';

import health_routes	from './routes/route.health';
import convers_routes	from './routes/route.convers';
import message_routes	from './routes/route.messages';
import notif_routes		from './routes/route.notifs';
import friends_routes	from './routes/route.friends';

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

// console.log(process.env);

const PORT = process.env.CHAT_DB_PORT || 3003;

console.log('>>>>>>>>>', process.env.SSL_KEY_PATH);
console.log('>>>>>>>>>', process.env.SSL_CERT_PATH);

// const sslOptions = {
//     key: fs.readFileSync(process.env.SSL_KEY_PATH as string),
//     cert: fs.readFileSync(process.env.SSL_CERT_PATH as string)
// };

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

app.use(error_handler);

setup_sockets(io);
start_chat_server();

async function start_chat_server() {
	try {
		initEventBus();
		subscribeToEvents(AUTH_EVENTS.USER_REGISTERED, async (channel, message: any) => {
			const {id, email, username, role} = message.data;

			await prisma.user.upsert({
				where:  {id: id },
				update: {email, username, role},
				create: {id, email, username, role}
			});
			console.log(`user synced to chat_db: [${id}](${username})`);
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
