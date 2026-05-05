import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';
import { notify, type NotifType } from '../lib/notify';

const NOTIF_TYPES: readonly NotifType[] = ['MESSAGE', 'FRIEND_REQ', 'SYSTEM'];

function parse_user_id(id_param: string | undefined): string {
	const user_id = id_param?.trim();
	if (!user_id) {
		throw new err.BadRequestError('Invalid user id');
	}
	return user_id;
}

function parse_notif_id(id_param: string | undefined): number {
	const notif_id = Number(id_param);
	if (!Number.isInteger(notif_id) || notif_id <= 0) {
		throw new err.BadRequestError('Invalid notification id');
	}
	return notif_id;
}

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId);
		const notifs  = await prisma.notification.findMany({
			where: { user_id },
			orderBy: { created_at: 'desc'},
		});
		res.json(notifs);
	} catch (err) {
		next(err);
	}
}

export async function read(req: Request, res: Response, next: NextFunction) {
	try {
		const notif_id = parse_notif_id(req.params.id as string);
		const user_id  = parse_user_id(req.user?.userId);

		const notif = await prisma.notification.update({
			where: {id: notif_id, user_id: user_id},
			data: {is_read: true}
		});

		const io = req.app.get('io');
		io.to(`user:${notif.user_id}`).emit('notification_read', {id: notif.id});
		res.json(notif);
	} catch (err) {
		next(err);
	}
}

export async function read_all(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId);

		await prisma.notification.updateMany({
			where: {user_id, is_read: false},
			data :{is_read: true}
		});
		const io = req.app.get('io');
		io.to(`user:${user_id}`).emit('notification_read_all');

		res.json({message: 'all notifications marked as read'});
	} catch (err) {
		next(err);
	}
}