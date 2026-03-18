import dotenv	from 'dotenv';
import express	from 'express';

import health_routes	from './routes/route.health';
import convers_routes	from './routes/route.convers';
import message_routes	from './routes/route.messages';
import notif_routes		from './routes/route.notifs';
import friends_routes	from './routes/route.friends';

import prisma			from './config/config.database';

import error_handler	from './middleware/error.handler';

dotenv.config({ path: '../../.env', quiet: true});

// console.log(process.env);

const app = express();
const PORT = process.env.CHAT_PORT || 3003;

app.use(express.json());

app.use('/api/chat', health_routes);
app.use('/api/chat/convers', convers_routes);
app.use('/api/chat/convers/:id/messages', message_routes);
app.use('/api/notifs', notif_routes);
app.use('/api/friend/requests', friends_routes);

app.use(error_handler);

start_chat_server();

async function start_chat_server() {
	try {
		// TODO: connection to db
		await prisma.$connect().then( () => {
			console.log('connected to database.');
		});
		app.listen(PORT, () => {
			console.log(`chat server running on port: ${PORT}`);
		});
	} catch (err) {
		console.log('error accured');
		process.exit(1);
	}
}

async function server_exit() {
	console.log('\nshutting down chat server');
	await prisma.$disconnect();
	console.log('disconnected from database.');
	process.exit(0);
}

process.on('SIGINT', server_exit);
