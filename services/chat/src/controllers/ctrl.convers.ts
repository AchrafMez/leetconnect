import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import prisma from '../config/config.database';
import * as err from '../middleware/error.handler';
import {
	convers_params,
	convers_create_body,
	convers_update_body,
	convers_add_member_body,
} from '../schemas/schema.convers';

type ConversParams        = z.infer<typeof convers_params>;
type ConversCreateBody    = z.infer<typeof convers_create_body>;
type ConversUpdateBody    = z.infer<typeof convers_update_body>;
type ConversAddMemberBody = z.infer<typeof convers_add_member_body>;

function ensure_unique_ids(ids: string[]): string[] {
	const unique = [...new Set(ids)];
	if (unique.length !== ids.length)
		throw new err.BadRequestError('member_ids must be unique');
	return unique;
}

async function assert_membership(convers_id: number, user_id: string) {
	const member = await prisma.conversMember.findFirst({
		where: {convers_id, user_id},
		select: {id: true}
	});
	if (!member)
		throw new err.ForbiddenError('not a member of conversation');
}

export async function list(req: Request, res: Response, next: NextFunction) {
	try {
		const curr_user = req.user!.userId;
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
								firstname: true,
								lastname: true,
								avatar: true,
								isOnline: true,
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
		res.status(200).json(convers);
	} catch (err) {
		next(err);
	}
}

export async function create(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const body    = req.body as ConversCreateBody;

		let member_ids = [...body.member_ids, user_id];
		member_ids = ensure_unique_ids(member_ids);

		if (body.type === 'Direct' && member_ids.length !== 2)
			throw new err.BadRequestError('Direct conversation must have exactly 2 members');

		let group_name: string | null = null;
		if (body.type === 'Group') {
			if (member_ids.length <= 2)
				throw new err.BadRequestError('Group conversation must have at least 2 members');
			group_name = body.name;
		}

		const users = await prisma.user.findMany({
			where: { id: { in: member_ids } },
			select: { id: true },
		});

		if (users.length !== member_ids.length)
			throw new err.NotFoundError('one or more users do not exist');

		if (body.type === 'Group') {
			const other_ids   = member_ids.filter((id) => id !== user_id);
			const friendships: {sender_id: string; receiver_id: string}[] =
				await prisma.friendRequest.findMany({
					where: {
						status: 'ACCEPTED',
						OR: [
							{sender_id: user_id, receiver_id: {in: other_ids}},
							{receiver_id: user_id, sender_id: {in: other_ids}}
						],
					},
					select: {sender_id: true, receiver_id: true},
				});
			const friend_ids = new Set(
				friendships.map((f) => f.sender_id === user_id ? f.receiver_id : f.sender_id)
			);
			if (other_ids.some((id) => !friend_ids.has(id)))
				throw new err.ForbiddenError('can only add friends to a group conversation');
		}

		if (body.type === 'Direct') {
			const user_a = member_ids[0]!;
			const user_b = member_ids[1]!;

			const possible_directs: {id: number; members: {user_id: string}[]}[] =
				await prisma.convers.findMany({
					where: {
						type: 'Direct',
						AND: [
							{members: {some: {user_id: user_a}}},
							{members: {some: {user_id: user_b}}}
						]
					},
					include: {
						members: {select: {user_id: true}},
					}
				});

			const existing_direct = possible_directs.find((conversation) => {
				if (conversation.members.length !== 2)
					return false;
				const ids = conversation.members.map((m) => m.user_id).sort();
				const target = [user_a, user_b].sort();
				return ids[0] === target[0] && ids[1] === target[1];
			});

			if (existing_direct) {
				const full = await prisma.convers.findUnique({
					where: {id: existing_direct.id},
					include: {
						members: {
							select: {
								user_id: true,
								user: {
									select: {
										username: true,
										firstname: true,
										lastname: true,
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
								created_at: true,
							}
						}
					}
				});
				res.status(200).json(full);
				return;
			}
		}

		const created = await prisma.$transaction(async (trans: any) => {
			const conversation = await trans.convers.create({
				data: {
					type: body.type,
					name: group_name,
				}
			});

			await trans.conversMember.createMany({
				data: member_ids.map((uid) => ({
					convers_id: conversation.id,
					user_id: uid,
				}))
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
									firstname: true,
									lastname: true,
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
							created_at: true,
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
		const user_id = req.user!.userId;
		const {id: convers_id} = req.params as unknown as ConversParams;

		const convers = await prisma.convers.findFirst({
			where: {
				id: convers_id,
				members: {some: {user_id }}
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

export async function add_member(req: Request, res: Response, next: NextFunction) {
	try {
		const requester_id = req.user!.userId;
		const {id: convers_id} = req.params as unknown as ConversParams;
		const {user_id: new_member_id} = req.body as ConversAddMemberBody;

		const convers = await prisma.convers.findUnique({
			where: {id: convers_id},
			select: {id: true, type: true}
		});
		if (!convers)
			throw new err.NotFoundError('conversation not found');
		if (convers.type !== 'Group')
			throw new err.BadRequestError('can only add members to a Group');

		await assert_membership(convers_id, requester_id);

		const target = await prisma.user.findUnique({
			where: {id: new_member_id},
			select: {id: true}
		});
		if (!target)
			throw new err.NotFoundError('user not found');

		const friendship = await prisma.friendRequest.findFirst({
			where: {
				status: 'ACCEPTED',
				OR: [
					{sender_id: requester_id, receiver_id: new_member_id},
					{sender_id: new_member_id, receiver_id: requester_id}
				]
			},
			select: {id: true}
		});
		if (!friendship)
			throw new err.ForbiddenError('can only add friends to a conversation');

		const existing = await prisma.conversMember.findFirst({
			where: {convers_id, user_id: new_member_id},
			select: {id: true}
		});
		if (existing)
			throw new err.BadRequestError('user is already a member');

		await prisma.conversMember.create({
			data: {convers_id, user_id: new_member_id}
		});

		const member = await prisma.conversMember.findFirst({
			where: {convers_id, user_id: new_member_id},
			select: {
				user_id: true,
				user: {
					select: {
						username: true,
						firstname: true,
						lastname: true,
						avatar: true,
						isOnline: true
					}
				}
			}
		});
		res.status(201).json(member);
	} catch (err) {
		next(err);
	}
}

export async function update(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const {id: convers_id} = req.params as unknown as ConversParams;
		const {name}           = req.body   as ConversUpdateBody;

		await assert_membership(convers_id, user_id);

		const convers = await prisma.convers.findUnique({
			where: {id: convers_id},
			select: {id: true, type: true}
		});
		if (!convers)
			throw new err.NotFoundError('conversation not found');

		if (convers.type === 'Direct')
			throw new err.BadRequestError('Direct conversations can not be edited');

		const updated = await prisma.convers.update({
			where: {id: convers_id},
			data: {name},
			include: {
				members: {
					select: {user_id: true, joined_at: true}
				}
			}
		});
		res.status(200).json(updated);
	} catch (err) {
		next(err);
	}
}

export async function remove(req: Request, res: Response, next: NextFunction) {
	try {
		const user_id = req.user!.userId;
		const {id: convers_id} = req.params as unknown as ConversParams;

		const membership = await prisma.conversMember.findFirst({
			where: {convers_id, user_id},
			select: {id: true}
		});
		if (!membership)
			throw new err.ForbiddenError('not a member of conversation');

		let convers_deleted = false;

		await prisma.$transaction(async (trans: any) => {
			await trans.conversMember.deleteMany({
				where: {
					convers_id,
					user_id,
				},
			});

			const members = await trans.conversMember.count({
				where: {convers_id}
			});

			if (members === 0) {
				await trans.convers.delete({
					where: {id: convers_id}
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
