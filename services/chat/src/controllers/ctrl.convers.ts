import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';

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

function parse_type(value: unknown) {
	if (value === 'Direct' || value === 'Group')
		return value;
	throw new err.BadRequestError('type must be Direct or Group');
}

function ensure_unique_ids(ids: string[]): string[] {
	const unique = [...new Set(ids)];
	if (unique.length !== ids.length)
		throw new err.BadRequestError('member_ids must be unique');
	return unique;
}

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const curr_user = parse_user_id(req.user?.userId, 'user_id');
		const convers = await prisma.convers.findMany({
			where: {
				members: {
					some: {user_id: curr_user}
				}
			},
			orderBy: {updated_at: 'desc'},
			include: {
				members: {
					select: {
						user_id: true,
						user: {
							select: {
								username: true,
								avatar: true,
								isOnline: true
							}
						}
					}
				},
				messages: {
					orderBy: {created_at: 'desc'},
					take: 1,
					select: {
						content:true,
						sender_id: true,
						created_at: true
					}
				}
			}
		});
		res.status(200).json(convers);
	} catch (err) {
		next(err);
	}
}

export async function create(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId, 'user_id');
		const type = parse_type(req.body.type);

		if (!Array.isArray(req.body.member_ids))
			throw new err.BadRequestError('member_ids must be an array');

		let member_ids = req.body.member_ids.map((id: any) => parse_user_id(id, 'member_id'));

		member_ids.push(user_id);
		member_ids = ensure_unique_ids(member_ids);

		if (type === 'Direct' && member_ids.length !== 2)
			throw new err.BadRequestError('Direct conversation must have exactly 2 members');

		if (type === 'Group' && member_ids.length <= 2)
			throw new err.BadRequestError('Group conversation must have at least 2 members');

		if (type === 'Group' && (!req.body.name || !req.body.name.trim()))
			throw new err.BadRequestError('Name is required for Group conversation');

		const users = await prisma.user.findMany({
			where: { id: { in: member_ids } },
			select: { id: true },
		});

		if (users.length !== member_ids.length)
			throw new err.NotFoundError('one or more users do not exist');

		if (type === 'Direct') {
			const [user_a, user_b] = member_ids;

			const possible_directs = await prisma.convers.findMany({
				where: {
					type: 'Direct',
					AND: [
						{members:{some:{user_id:user_a}}},
						{members:{some:{user_id:user_b}}},
					],
				},
				include: {
					members: { select: { user_id: true } },
				},
			});

			const existing_direct = possible_directs.find((conversation) => {
				if (conversation.members.length !== 2)
					return (false);
				const ids = conversation.members.map((m) => m.user_id).sort();
				const target = [user_a, user_b].sort();
				return (ids[0] === target[0] && ids[1] === target[1]);
			});

			if (existing_direct)
				throw new err.BadRequestError('conversation already exists');
		}

		const created = await prisma.$transaction(async (trans) => {
			const conversation = await trans.convers.create({
				data: {
					type: type,
					name: type === 'Group' ? req.body.name!.trim() : null,
				},
			});

			await trans.conversMember.createMany({
				data: member_ids.map((uid: any) => ({
					convers_id: conversation.id,
					user_id: uid,
				})),
			});

			return trans.convers.findUnique({
				where: { id: conversation.id },
				include: {
					members: {
						select: {
							user_id: true,
							user: {
								select: {
									username: true,
									avatar: true
								}
							}
						}
					},
					messages: {
						orderBy: {created_at: 'desc'},
						take: 1,
						select: {
							content: true,
							sender_id: true,
							created_at: true
						}
					}
				}
			});
		});

		res.status(201).json(created);
	} catch (err) {
		next(err);
	}
}

export async function get(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId, 'user_id');
		const convers_id = parse_int_id(req.params.id, 'convers_id');

		const convers = await prisma.convers.findFirst({
			where: {
				id: convers_id,
				members: {some: {user_id: user_id}}
			},
			include: {
				members: {
					select: {user_id: true, joined_at: true}
				},
				messages: {
					orderBy: {created_at: 'desc'},
					take: 20,
					select: {
						id: true,
						sender_id: true,
						content: true,
						created_at: true,
					}
				}
			}
		});
		if (!convers)
			throw new err.NotFoundError('conversation not found');
		res.status(200).json(convers);

	} catch (err) {
		next(err);
	}
}

async function assert_membership(convers_id: number, user_id: string) {
	const member = await prisma.conversMember.findFirst({
		where: {
			convers_id: convers_id,
			user_id,
		},
		select: { id: true },
	});

	if (!member)
		throw new err.ForbiddenError('not a member of conversation');
}

export async function update(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId, 'user_id');
		const convers_id = parse_int_id(req.params.id, 'convers_id');

		await assert_membership(convers_id, user_id);

		const convers = await prisma.convers.findUnique({
			where: {id: convers_id},
			select: {id: true, type: true},
		});
		if (!convers)
			throw new err.NotFoundError('conversation not found');

		if (convers.type === 'Direct')
			throw new err.BadRequestError('Direct conversations can not be edited');
		if (!req.body.name || !req.body.name.trim())
			throw new err.BadRequestError('name is required');

		const updated = await prisma.convers.update({
			where: {id: convers_id},
			data: {name: req.body.name.trim()},
			include: {
				members: {
					select: {user_id: true, joined_at: true},
				}
			}
		});
		res.status(201).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function remove(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = parse_user_id(req.user?.userId, 'user_id');
		const convers_id = parse_int_id(req.params.id, 'convers_id');

		const membership = await prisma.conversMember.findFirst({
			where: {convers_id, user_id},
			select: {id: true},
		});
		if (!membership)
			throw new err.ForbiddenError('not a member of conversation');

		let convers_deleted = false;

		await prisma.$transaction(async (trans) => {
			await trans.conversMember.deleteMany({
				where: {
					convers_id,
					user_id,
				},
			});

			const members = await trans.conversMember.count({
				where: {convers_id},
			});

			if (members === 0) {
				await trans.convers.delete({
					where: {id: convers_id},
				});
				convers_deleted = true;
			}
		});

		res.status(200).json({
			message: convers_deleted
				? 'conversation deleted'
				: 'left conversation',
		});
	} catch (err) {
		next(err);
	}
}
