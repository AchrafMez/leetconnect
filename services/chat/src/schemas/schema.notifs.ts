import { z } from 'zod';

export const notif_params = z.object({
	id: z.coerce.number().int().positive()
});

export type NotifParams = z.infer<typeof notif_params>;
