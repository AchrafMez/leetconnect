import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';
import { notify } from '../lib/notify';
import Pusher from 'pusher';
import {
	type MessageParams,
	type MessageQuery, 
	type MessageBody
} from '../schemas/schema.message';

const pusher = new Pusher({
	appId:   process.env.PUSHER_APP_ID!,
	key:     process.env.PUSHER_KEY!,
	secret:  process.env.PUSHER_SECRET!,
	cluster: process.env.PUSHER_CLUSTER!,
	useTLS:  true,
});

async function assert_membership(convers_id: number, user_id: string) {
	const member = await prisma.conversMember.findFirst({
		where: { convers_id, user_id },
		select: { id: true },
	});
	if (!member)
		throw new err.ForbiddenError('not a member of conversation');
}

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const {id: convers_id} = req.params as unknown as MessageParams;
		const {limit, cursor}  = req.query  as unknown as MessageQuery;

		await assert_membership(convers_id, user_id);

		const messages = await prisma.message.findMany({
			where: { convers_id },
			orderBy: { id: 'desc'},
			take: limit + 1,
			...(cursor && { cursor: {id: cursor}, skip: 1 }),
			select: {
				id: true,
				content: true,
				sender_id: true,
				created_at: true,
				sender: { select: { username: true, avatar: true } }
			}
		});

		const has_more = messages.length > limit;
		if (has_more) messages.pop();
		const next_cursor = has_more ? (messages[messages.length - 1]!.id) : null;
		messages.reverse();

		res.status(200).json({ messages, next_cursor });
	} catch (err) {
		next(err);
	}
}

export async function send(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const {id: convers_id} = req.params as unknown as MessageParams;
		const {content}        = req.body   as MessageBody;

		await assert_membership(convers_id, user_id);

		const message = await prisma.message.create({
			data: { content, sender_id: user_id, convers_id },
			select: {
				id: true,
				content: true,
				sender_id: true,
				convers_id: true,
				created_at: true,
				sender: { select: { username: true, avatar: true } }
			}
		});

		await prisma.convers.update({
			where: {id: convers_id},
			data: {updated_at: new Date()}
		});

		// Trigger new message to conversation channel
		await pusher.trigger(`convers-${convers_id}`, 'new_message', message);

		const members: {user_id: string}[] = await prisma.conversMember.findMany({
			where: {convers_id},
			select: {user_id: true}
		});

		const bump_payload = {
			convers_id,
			last_message: {
				content:    message.content,
				sender_id:  message.sender_id,
				created_at: message.created_at,
			},
			updated_at: new Date(),
		};

		// Bump conversation for all members
		await Promise.all(
			members.map((m) =>
				pusher.trigger(`user-${m.user_id}`, 'convers_bumped', bump_payload)
			)
		);

		// Send notifications to recipients
		const recipients = members.filter((m) => m.user_id !== user_id);
		const preview = content.length > 80 ? content.slice(0, 80) + '…' : content;
		const title = `New message from ${message.sender.username}`;

		await Promise.all(
			recipients.map(async (r) => {
				const existing = await prisma.notification.findFirst({
					where: { user_id: r.user_id, type: 'MESSAGE', is_read: false, title }
				});
				if (existing) {
					const updated = await prisma.notification.update({
						where: {id: existing.id},
						data:  {body: preview, created_at: new Date()}
					});
					await pusher.trigger(`user-${r.user_id}`, 'new_notification', {
						...updated,
						created_at: updated.created_at.toISOString(),
					});
				} else {
					await notify(null, {
						user_id: r.user_id,
						type:    'MESSAGE',
						title,
						body:    preview
					});
				}
			})
		);

		res.status(201).json(message);
	} catch (err) {
		next(err);
	}
}

export async function remove(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const {id: convers_id, msg_id} = req.params as unknown as MessageParams;

		if (msg_id === undefined)
			throw new err.BadRequestError('msg_id: required');

		await assert_membership(convers_id, user_id);

		const message = await prisma.message.findFirst({
			where: { id: msg_id, convers_id },
			select: { id: true, sender_id: true }
		});
		if (!message)
			throw new err.NotFoundError('message not found');
		if (message.sender_id !== user_id)
			throw new err.ForbiddenError('can only delete your own messages');

		await prisma.message.delete({where: {id: msg_id}});

		await pusher.trigger(`convers-${convers_id}`, 'delete_message', {
			id: msg_id, convers_id
		});

		res.status(200).json({message: 'message deleted'});
	} catch (err) {
		next(err);
	}
}