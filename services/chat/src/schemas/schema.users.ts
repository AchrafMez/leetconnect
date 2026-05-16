import { z } from 'zod';

export const users_params = z.object({
	username: z.string().trim().min(1)
});

export type UsersParams = z.infer<typeof users_params>;
