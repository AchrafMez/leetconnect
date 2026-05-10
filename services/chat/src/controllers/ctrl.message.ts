import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';
import { notify } from '../lib/notify';
import {
	type MessageParams,
	type MessageQuery, 
	type MessageBody
} from '../schemas/schema.message';

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
			where: { convers_id: convers_id},
			orderBy: { id: 'desc'},
			take: limit + 1,
			...(cursor && {
				cursor: {id: cursor},
				skip: 1
			}),
			select: {
				id: true,
				content: true,
				sender_id: true,
				created_at: true,
				sender: {
					select: {
						username: true,
						avatar: true
					}
				}
			}
		});

		const has_more = messages.length > limit;
		if (has_more) messages.pop();

		const next_cursor = has_more ? (messages[messages.length - 1]!.id) : null;
		messages.reverse();

		res.status(200).json({ messages, next_cursor});
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
			data: {
				content,
				sender_id: user_id,
				convers_id,
			},
			select: {
				id: true,
				content: true,
				sender_id: true,
				convers_id: true,
				created_at: true,
				sender: {
					select: {
						username: true,
						avatar: true
					}
				}
			}
		});
		await prisma.convers.update({
			where: {id: convers_id},
			data: {updated_at: new Date()}
		});

		const io = req.app.get('io');
		io.to(`convers:${convers_id}`).emit('new_message', message);

		const members: { user_id: string }[] = await prisma.conversMember.findMany({
			where: { convers_id },
			select: { user_id: true },
		});

		const bump_payload = {
			convers_id,
			last_message: {
				content:	message.content,
				sender_id:  message.sender_id,
				created_at: message.created_at,
			},
			updated_at: new Date(),
		};
		for (const m of members) {
			io.to(`user:${m.user_id}`).emit('convers_bumped', bump_payload);
		}

		const recipients = members.filter((m) => m.user_id !== user_id);
		const preview = content.length > 80 ? content.slice(0, 80) + '…' : content;
		const isOnChat = (uid: string) => {
			const room = io.sockets.adapter.rooms.get(`user:${uid}`);
			if (!room) return false;
			for (const sid of room) {
				if (io.sockets.sockets.get(sid)?.data.chatActive) return true;
			}
			return false;
		};
		await Promise.all(
			recipients
				.filter((r) => !isOnChat(r.user_id))
				.map((r) =>
					notify(io, {
						user_id: r.user_id,
						type: 'MESSAGE',
						title: `New message from ${message.sender.username}`,
						body: preview,
					})
				)
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
			where: {
				id: msg_id,
				convers_id
			},
			select: {
				id: true,
				sender_id: true
			}
		});
		if (!message)
			throw new err.NotFoundError('message not found');
		if (message.sender_id !== user_id)
			throw new err.ForbiddenError('can only delete your own messages');

		await prisma.message.delete({where: {id: msg_id}});

		const io = req.app.get('io');
		io.to(`convers:${convers_id}`).emit('delete_message', {
			id: msg_id, convers_id
		});

		res.status(200).json({message: 'message deleted'});
	} catch (err) {
		next(err);
	}
}
