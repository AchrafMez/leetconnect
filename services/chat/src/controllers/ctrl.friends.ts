import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';

function parse_id(value: unknown, label: string): number {
	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0)
		throw new err.BadRequestError(`Invalid ${label}`);
	return (parsed);
}

function check_pending(status: string): void {
	if (status !== 'PENDING')
		throw new err.BadRequestError('friend request is already handled');
}

export async function send(req: Request, res: Response, next: NextFunction) {
	// console.log('Send a friend request');
	// res.send(`POST: api/friend/requests endpoint`);
	try {
		const sender_id   = parse_id(req.body.sender_id, 'sender_id');
		const receiver_id = parse_id(req.body.receiver_id, 'receiver_id');

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
				status: 'PENDING',
				OR: [
					{sender_id: sender_id, receiver_id: receiver_id},
					{sender_id: receiver_id, receiver_id: sender_id}
				]
			}
		});
		if (exist)
			throw new err.BadRequestError('a pending request already exists');

		const request = await prisma.friendRequest.create({
			data: {
				sender_id:   sender_id,
				receiver_id: receiver_id,
				status: 'PENDING'
			}
		});
		// TODO: create a notif
		res.status(201).json(request);
	} catch (err) {
		next(err);
	}
}

export async function accept(req: Request, res: Response, next: NextFunction) {
	// const id = req.params.id;
	// console.log('Accept an incoming friend request');
	// res.send(`PATCH: api/friend/requests/${id}/accept endpoint`);
	try {
		const sender_id = parse_id(req.params.id, 'sender_id');
		const user_id	= parse_id(req.body.receiver_id, 'user_id');

		const request = await prisma.friendRequest.findUnique({
			where: {id: sender_id}
		});
		if (!request)
			throw new err.NotFoundError('friend request not found');

		check_pending(request.status);
		if (request.receiver_id !== user_id)
			throw new err.ForbiddenError('only the receiver can accept');

		const updated = await prisma.friendRequest.update({
			where: {id: sender_id},
			data: {status: 'ACCEPTED'}
		});
		// TODO: send notif
		res.status(200).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function reject(req: Request, res: Response, next: NextFunction) {
	// const id = req.params.id;
	// console.log('Reject an incoming friend request');
	// res.send(`PATCH: api/friend/requests/${id}/reject endpoint`);
	try {
		const sender_id = parse_id(req.params.id, 'sender_id');
		const user_id	= parse_id(req.body.receiver_id, 'user_id');

		const request = await prisma.friendRequest.findUnique({
			where: {id: sender_id}
		});
		if (!request)
			throw new err.NotFoundError('friend request not found');

		check_pending(request.status);
		if (request.receiver_id !== user_id)
			throw new err.ForbiddenError('only the receiver can accept');

		const updated = await prisma.friendRequest.update({
			where: {id: sender_id},
			data: {status: 'REJECTED'}
		});
		// TODO: send notif
		res.status(200).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function list_incoming(req: Request, res: Response, next: NextFunction) {
	// const user_id = req.params.user_id;
	// console.log('List all user incoming friend requests');
	// res.send(`GET: api/friend/requests/incoming/${user_id} endpoint`);
	try {
		const user_id = parse_id(req.params.user_id, 'user_id');
		const reguest = await prisma.friendRequest.findMany({
			where: {
				receiver_id: user_id,
				status: 'PENDING'
			},
			orderBy: {created_at: 'desc'}
		});
		res.status(200).json(reguest);
	} catch (err) {
		next(err);
	}
}

export async function list_outgoing(req: Request, res: Response, next: NextFunction) {
	// const user_id = req.params.user_id;
	// console.log('List all user outgoing friend requests');
	// res.send(`GET: api/friend/requests/outgoing/${user_id} endpoint`);
	try {
		const user_id = parse_id(req.params.user_id, 'user_id');
		const reguest = await prisma.friendRequest.findMany({
			where: {
				sender_id: user_id,
				status: 'PENDING'
			},
			orderBy: {created_at: 'desc'}
		});
		res.status(200).json(reguest);
	} catch (err) {
		next(err);
	}
}

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_id(req.params.user_id, 'user_id');
		const request = await prisma.friendRequest.findMany({
			where: {
				status: 'ACCEPTED',
				OR: [
					{sender_id: user_id},
					{receiver_id: user_id}
				],
			},
			orderBy: {created_at: 'desc'}
		});
		res.status(200).json(request);
	} catch (err) {
		next(err);
	}
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
	try {
		const request_id =parse_id(req.params.id, 'request_id');
		const user_id	 = parse_id(req.body.user_id, 'user_id');
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
		const user_id	= parse_id(req.params.user_id, 'user_id');
		const friend_id = parse_id(req.body.friend_id, 'friend_id');

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
			// select: {
			// 	id: true
			// }
		});
		console.log('>>>>>', friendship);
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
