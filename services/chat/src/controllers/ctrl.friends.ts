import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';
import { notify } from '../lib/notify';

function parse_user_id(value: unknown, label: string): string {
	const val = typeof value === 'string' ? value.trim() : '';
	if (!val)
		throw new err.BadRequestError(`Invalid ${label}`);
	return val;
}

function parse_int_id(value: unknown, label: string): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0)
		throw new err.BadRequestError(`Invalid ${label}`);
	return parsed;
}

function check_pending(status: string): void {
	if (status !== 'PENDING')
		throw new err.BadRequestError('friend request is already handled');
}

export async function send(req: Request, res: Response, next: NextFunction) {
	try {
		const sender_id   = parse_user_id(req.user?.userId, 'sender_id');
		const receiver_id = parse_user_id(req.body.receiver_id, 'receiver_id');

		if (sender_id === receiver_id)
			throw new err.BadRequestError('self request error');
		const [sender, receiver] = await Promise.all([
			prisma.user.findUnique({where: {id: sender_id}, select: {id: true}}),
			prisma.user.findUnique({where: {id: receiver_id}, select: {id: true}})
		]);
		if (!sender || !receiver) {
			throw new err.NotFoundError(
				!sender ? `${sender_id} not found`: `${receiver_id} not found`
			);
		}

		const exist = await prisma.friendRequest.findFirst({
			where: {
				OR: [
					{sender_id: sender_id, receiver_id: receiver_id},
					{sender_id: receiver_id, receiver_id: sender_id}
				]
			}
		});

		if (exist) {
			if (exist.status === 'PENDING')
				throw new err.BadRequestError('a pending request already exists');
			if (exist.status === 'ACCEPTED')
				throw new err.BadRequestError('already friends');

			await prisma.friendRequest.delete({where: {id: exist.id}});
		}

		const request = await prisma.friendRequest.create({
			data: {
				sender_id:   sender_id,
				receiver_id: receiver_id,
				status: 'PENDING'
			}
		});
		// TODO: create a notif
		const sender_info = await prisma.user.findUnique({
			where: {id: sender_id}, select: {username: true},
		});
		const io = req.app.get('io');
		await notify(io, {
			user_id: receiver_id,
			type: 'FRIEND_REQ',
			title: 'New Friend Request',
			body: `${sender_info?.username} wants to connect`
		});
		res.status(201).json(request);
	} catch (err) {
		next(err);
	}
}

export async function accept(req: Request, res: Response, next: NextFunction) {
	try {
		const request_id = parse_int_id(req.params.id, 'request_id');
		const user_id	 = parse_user_id(req.user?.userId, 'user_id');

		const request = await prisma.friendRequest.findUnique({
			where: {id: request_id}
		});
		if (!request)
			throw new err.NotFoundError('friend request not found');

		check_pending(request.status);
		if (request.receiver_id !== user_id)
			throw new err.ForbiddenError('only the receiver can accept');

		const updated = await prisma.friendRequest.update({
			where: {id: request_id},
			data: {status: 'ACCEPTED'}
		});
		// TODO: send notif
		const me = await prisma.user.findUnique({
			where: {id: user_id}, select: {username: true}
		});
		const io = req.app.get('io');
		await notify(io, {
			user_id: request.sender_id,
			type: 'FRIEND_REQ',
			title: 'Friend Request Accepted',
			body: `${me?.username} accepted your request`
		});

		res.status(200).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function reject(req: Request, res: Response, next: NextFunction) {
	try {
		const request_id = parse_int_id(req.params.id, 'request_id');
		const user_id	 = parse_user_id(req.user?.userId, 'user_id');

		const request = await prisma.friendRequest.findUnique({
			where: {id: request_id}
		});
		if (!request)
			throw new err.NotFoundError('friend request not found');

		check_pending(request.status);
		if (request.receiver_id !== user_id)
			throw new err.ForbiddenError('only the receiver can reject');

		const updated = await prisma.friendRequest.update({
			where: {id: request_id},
			data: {status: 'REJECTED'}
		});
		// TODO: send notif
		res.status(200).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function list_incoming(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId, 'user_id');
		const reguest = await prisma.friendRequest.findMany({
			where: {
				receiver_id: user_id,
				status: 'PENDING'
			},
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						avatar: true
					}
				}
			},
			orderBy: {created_at: 'desc'}
		});
		res.status(200).json(reguest);
	} catch (err) {
		next(err);
	}
}

export async function list_outgoing(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId, 'user_id');
		const reguest = await prisma.friendRequest.findMany({
			where: {
				sender_id: user_id,
				status: 'PENDING'
			},
			include: {
				receicer: {
					select: {
						id: true,
						username: true,
						avatar: true
					}
				}
			},
			orderBy: {created_at: 'desc'}
		});

		const mapped = reguest.map(({receicer, ...rest}: 
			{ receicer: {
				id: string;
				username: string;
				avatar: string
			}; [key: string]: unknown
		}) => ({...rest, receiver: receicer}));

		res.status(200).json(mapped);

	} catch (err) {
		next(err);
	}
}

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId, 'user_id');
		const requests = await prisma.friendRequest.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{sender_id: user_id},
					{receiver_id: user_id}
				],
			},
			orderBy: {created_at: 'desc'}
		});

		const friend_ids = requests.map((r: { sender_id: string; receiver_id: string }) =>
			r.sender_id === user_id ? r.receiver_id : r.sender_id
		);

		const users = await prisma.user.findMany({
			where: {id: {in: friend_ids}},
			select: {
				id: true,
				username: true,
				avatar: true,
				isOnline: true
			}
		});

		const friends = users.map((u:
			{ id: string; username: string; avatar: string; isOnline: boolean }) => ({
				id:        u.id,
				username:  u.username,
				avatar:    u.avatar,
				is_online: u.isOnline,
		}));

		res.status(200).json(friends);
	} catch (err) {
		next(err);
	}
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
	try {
		const request_id = parse_int_id(req.params.id, 'request_id');
		const user_id	 = parse_user_id(req.user?.userId, 'user_id');
		const request	 = await prisma.friendRequest.findUnique({
			where: {id: request_id}
		});

		if (!request)
			throw new err.NotFoundError('friend request not found');
		check_pending(request.status);
		if (request.sender_id !== user_id)
			throw new err.UnauthorizedError('only sender can cancel');

		await prisma.friendRequest.delete({
			where: {id: request_id}
		});
		res.status(200).json({message: 'friend request canceled'});
	} catch (err) {
		next(err);
	}
}

export async function remove(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id	= parse_user_id(req.user?.userId, 'user_id');
		const friend_id = parse_user_id(req.body.friend_id, 'friend_id');

		if (user_id === friend_id)
			throw new err.BadRequestError('same accoutn error');

		const friendship = await prisma.friendRequest.findFirst({
			where: {
				status: 'ACCEPTED',
				OR: [
					{sender_id: user_id, receiver_id: friend_id},
					{sender_id: friend_id, receiver_id: user_id}
				]
			},
		});
		// console.log('>>>>>', friendship);
		if (!friendship)
			throw new err.NotFoundError('friendship not found');

		await prisma.friendRequest.delete({
			where: {id: friendship.id}
		});
		res.status(200).json({message: 'friend removed'});
	} catch (err) {
		next(err);
	}
}
