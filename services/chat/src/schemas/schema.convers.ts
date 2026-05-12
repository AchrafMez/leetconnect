import { z } from 'zod';

const user_id = z.string().trim().min(1);

export const convers_params = z.object({
	id: z.coerce.number().int().positive()
});

export const convers_create_body = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('Direct'),
		member_ids: z.array(user_id).length(1, 'Direct conversation must have exactly 2 members')
	}),
	z.object({
		type: z.literal('Group'),
		member_ids: z.array(user_id).min(2, 'Group conversation must have at least 2 members'),
		name: z.string().trim().min(1, 'Name is required for Group conversation').max(64)
	})
]);

export const convers_update_body = z.object({
	name: z.string().trim().min(1).max(64)
});

export const convers_add_member_body = z.object({
	user_id
});
