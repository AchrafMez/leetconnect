import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import type { NotifParams } from '../schemas/schema.notifs';

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const notifs  = await prisma.notification.findMany({
			where: { user_id: user_id },
			orderBy: { created_at: 'desc'},
		});
		res.json(notifs);
	} catch (err) {
		next(err);
	}
}

export async function read(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id  = req.user!.userId;
		const {id: notif_id} = req.params as unknown as NotifParams;

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
		const user_id = req.user!.userId;

		await prisma.notification.updateMany({
			where: {user_id: user_id, is_read: false},
			data :{is_read: true}
		});
		const io = req.app.get('io');
		io.to(`user:${user_id}`).emit('notification_read_all');

		res.json({message: 'all notifications marked as read'});
	} catch (err) {
		next(err);
	}
}