import { z } from 'zod';

const id_param = z.coerce.number().int().positive();

export const message_params = z.object({
	id: id_param,
	msg_id: id_param.optional()
});

export const message_query = z.object({
	limit: z.coerce.number().int().min(1).max(50).default(20),
	cursor: z.coerce.number().int().positive().optional()
});

export const message_body = z.object({
	content: z.string().trim().min(1, 'content is missing').max(3000, 'content too long')
});
