import { z } from 'zod';

const user_id = z.string().trim().min(1);

export const friend_params = z.object({
	id: z.coerce.number().int().positive()
});

export const friend_send_body = z.object({
	receiver_id: user_id
});

export const friend_remove_body = z.object({
	friend_id: user_id
});

export type FriendParams = z.infer<typeof friend_params>;
export type FriendSendBody = z.infer<typeof friend_send_body>;
export type FriendRemoveBody = z.infer<typeof friend_remove_body>;
