import type { Server } from 'socket.io';
import prisma from '../config/config.database';

export type NotifType = 'MESSAGE' | 'FRIEND_REQ' | 'SYSTEM';

export interface NotifEventPayload {
	user_id:	string;
	type: 		NotifType;
	title: 		string;
	body?: 		string;
}

export async function notify(io: Server, input: NotifEventPayload) {
	const notif = await prisma.notification.create({
		data: {
			user_id: input.user_id,
			type: input.type,
			title: input.title,
			body: input.body ?? null,
			is_read: false
		}
	});

	io.to(`user:${input.user_id}`).emit('new_notification', {
		...notif, created_at: notif.created_at.toISOString()
	});

	return (notif);
}
