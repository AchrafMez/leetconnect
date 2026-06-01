import prisma from '../config/config.database';
import Pusher from 'pusher';

export type NotifType = 'MESSAGE' | 'FRIEND_REQ' | 'SYSTEM';

export interface NotifEventPayload {
	user_id:	string;
	type: 		NotifType;
	title: 		string;
	body?: 		string;
}

const pusher = new Pusher({
	appId:   process.env.PUSHER_APP_ID!,
	key:     process.env.PUSHER_KEY!,
	secret:  process.env.PUSHER_SECRET!,
	cluster: process.env.PUSHER_CLUSTER!,
	useTLS:  true,
});

export async function notify(io: any, input: NotifEventPayload) {
	const notif = await prisma.notification.create({
		data: {
			user_id: input.user_id,
			type:    input.type,
			title:   input.title,
			body:    input.body ?? null,
			is_read: false
		}
	});

	await pusher.trigger(`user-${input.user_id}`, 'new_notification', {
		...notif, created_at: notif.created_at.toISOString()
	});

	return notif;
}