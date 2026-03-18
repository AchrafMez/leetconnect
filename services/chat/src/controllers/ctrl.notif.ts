import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';

function parse_user_id(id_param: string | undefined): number {
	const user_id = Number(id_param);
	if (!Number.isInteger(user_id) || user_id <= 0) {
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

export async function create(req: Request , res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.params.user_id as string);
		const {type, title, body} = req.body;
		const notif = await prisma.notifcation.create({
			data: {
				user_id: user_id,
				type: type,
				title: title,
				body: body,
				is_read: false,
			}
		});
		res.json(notif);
	} catch (err) {
		next(err);
	}
}

export async function list(req: Request, res: Response, next: NextFunction) {
	// console.log('List user notifications');
	// res.send(`GET: /api/chat/notifs endpoint`);
	try {
		const user_id = parse_user_id(req.params.user_id as string);
		const notifs  = await prisma.notifcation.findMany({
			where: { user_id },
			orderBy: { created_at: 'desc'},
		});
		res.json(notifs);
	} catch (err) {
		next(err);
	}
}

export async function read(req: Request, res: Response, next: NextFunction) {
	// console.log('Mark a notification as read');
	// res.send(`PATCH: /api/chat/notifs/${req.params.id}/read endpoint`);
	try {
		const notif_id = parse_notif_id(req.params.id as string);
		const notifs = await prisma.notifcation.update({
			where: {id: notif_id},
			data: {is_read: true},
		});
		res.json(notifs);
	} catch (err) {
		next(err);
	}
}

export async function read_all(req: Request, res: Response, next: NextFunction) {
	// console.log('Mark all notifications as read');
	// res.send(`PATCH: /api/chat/notifs/read-all endpoint`);
	try {
		const user_id = parse_user_id(req.params.user_id as string);
		await prisma.notifcation.updateMany({
			where: {user_id, is_read: false},
			data :{is_read: true},
		});
		res.json('All notifications marked as read');
	} catch (err) {
		next(err);
	}
}