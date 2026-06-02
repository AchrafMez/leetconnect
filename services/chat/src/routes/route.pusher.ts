import { Router } from 'express';
import Pusher from 'pusher';
import {authMiddleware} from '@leetconnect/shared';


const router = Router();

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID!,
	key: process.env.PUSHER_KEY!,
	secret: process.env.PUSHER_SECRET!,
	cluster: process.env.PUSHER_CLUSTER!,
	useTLS: true,
});

router.post('/pusher/auth', authMiddleware, (req: any, res) => {
	try {
		const { socket_id, channel_name } = req.body;

		if (!socket_id || !channel_name) {
			return res.status(400).json({
				error: 'Missing socket_id or channel_name',
			});
		}

		// Presence channels
		if (channel_name.startsWith('presence-')) {
			if (!req.user) {
				return res.status(401).json({
					error: 'Unauthorized',
				});
			}

			const authResponse = pusher.authorizeChannel(
				socket_id,
				channel_name,
				{
					user_id: String(req.user.id),
					user_info: {
						id: req.user.id,
						username: req.user.username,
					},
				}
			);

			return res.send(authResponse);
		}

		// Private channels
		const authResponse = pusher.authorizeChannel(
			socket_id,
			channel_name
		);

		return res.send(authResponse);

	} catch (err) {
		console.error('Pusher auth error:', err);

		return res.status(500).json({
			error: 'Pusher auth failed',
		});
	}
});

export default router;
