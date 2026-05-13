import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';
import { notify } from '../lib/notify';
import type {
	FriendSendBody,
	FriendParams,
	FriendRemoveBody,
} from '../schemas/schema.friends';

// function parse_user_id(value: unknown, label: string): string {
// 	const val = typeof value === 'string' ? value.trim() : '';
// 	if (!val)
// 		throw new err.BadRequestError(`Invalid ${label}`);
// 	return val;
// }

// function parse_int_id(value: unknown, label: string): number {
// 	const parsed = Number(value);
// 	if (!Number.isInteger(parsed) || parsed <= 0)
// 		throw new err.BadRequestError(`Invalid ${label}`);
// 	return parsed;
// }

function check_pending(status: string): void {
	if (status !== 'PENDING')
		throw new err.BadRequestError('friend request is already handled');
}

async function ensure_direct_conversation(user_a: string, user_b: string) {
	const existing: {id: number; members: {user_id: string}[]} | null = await prisma.convers.findFirst({
		where: {
			type: 'Direct',
			AND: [
				{members: {some: {user_id: user_a}}},
				{members: {some: {user_id: user_b}}},
			],
		},
		include: {members: {select: {user_id: true}}},
	});
	if (existing && existing.members.length === 2)
		return existing;

	return prisma.$transaction(async (trans: any) => {
		const convers = await trans.convers.create({data: {type: 'Direct'}});
		await trans.conversMember.createMany({
			data: [
				{convers_id: convers.id, user_id: user_a},
				{convers_id: convers.id, user_id: user_b},
			],
		});
		return convers;
	});
}

export async function send(req: Request, res: Response, next: NextFunction) {
	try {
		const sender_id   = req.user!.userId;
		const {receiver_id} = req.body as FriendSendBody;

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

		const sender_info = await prisma.user.findUnique({
			where: {id: sender_id}, select: {username: true},
		});
		const io = req.app.get('io');
		await notify(io, {
			user_id: receiver_id,
			type: 'FRIEND_REQ',
			title: 'New Connection Request',
			body: `${sender_info?.username} wants to connect`
		});
		res.status(201).json(request);
	} catch (err) {
		next(err);
	}
}

export async function accept(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const {id: request_id} = req.params as unknown as FriendParams;

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

		await ensure_direct_conversation(request.sender_id, request.receiver_id);

		const me = await prisma.user.findUnique({
			where: {id: user_id}, select: {username: true}
		});
		const io = req.app.get('io');
		await notify(io, {
			user_id: request.sender_id,
			type: 'FRIEND_REQ',
			title: 'Connection Request Accepted',
			body: `${me?.username} accepted your request`
		});

		res.status(200).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function reject(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id	 = req.user!.userId;
		const {id: request_id} = req.params as unknown as FriendParams;

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

		const me = await prisma.user.findUnique({
			where: {id: user_id}, select: {username: true}
		});
		const io = req.app.get('io');
		await notify(io, {
			user_id: request.sender_id,
			type: 'FRIEND_REQ',
			title: 'Connection Request Rejected',
			body: `${me?.username} rejected your request`
		});
		res.status(200).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function list_incoming(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const requests = await prisma.friendRequest.findMany({
			where: {
				receiver_id: user_id,
				status: 'PENDING'
			},
			include: {
				sender: {
					select: {
						id: true,
						username: true,
						firstname: true,
						lastname: true,
						avatar: true
					}
				}
			},
			orderBy: {created_at: 'desc'}
		});
		res.status(200).json(requests);
	} catch (err) {
		next(err);
	}
}

export async function list_outgoing(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const requests = await prisma.friendRequest.findMany({
			where: {
				sender_id: user_id,
				status: 'PENDING'
			},
			include: {
				receiver: {
					select: {
						id: true,
						username: true,
						firstname: true,
						lastname: true,
						avatar: true
					}
				}
			},
			orderBy: {created_at: 'desc'}
		});

		res.status(200).json(requests);

	} catch (err) {
		next(err);
	}
}

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const requests: {sender_id: string; receiver_id: string}[] =
			await prisma.friendRequest.findMany({
				where: {
					status: 'ACCEPTED',
					OR: [
						{sender_id: user_id},
						{receiver_id: user_id}
					],
				},
				orderBy: {created_at: 'desc'},
				select: {sender_id: true, receiver_id: true}
			});

		const friend_ids = requests.map((r) =>
			r.sender_id === user_id ? r.receiver_id : r.sender_id
		);

		const users: {id: string; username: string; firstname: string; lastname: string; avatar: string; isOnline: boolean}[] =
			await prisma.user.findMany({
				where: {id: {in: friend_ids}},
				select: {
					id: true,
					username: true,
					firstname: true,
					lastname: true,
					avatar: true,
					isOnline: true
				}
			});

		const friends = users.map((u) => ({
				id:			u.id,
				username:	u.username,
				firstname:	u.firstname,
				lastname:	u.lastname,
				avatar:		u.avatar,
				is_online:	u.isOnline,
		}));

		res.status(200).json(friends);
	} catch (err) {
		next(err);
	}
}

export async function remove(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id	= req.user!.userId;
		const {friend_id} = req.body as FriendRemoveBody;

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
