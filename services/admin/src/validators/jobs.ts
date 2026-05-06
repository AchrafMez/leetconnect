import { z } from 'zod'

export const updateJobStatusSchema = z.object({
	status: z.enum([
		'active',
		'flagged',
		'closed'
	], {
		error: () => ({
			message: 'Status must be one of: active, flagged, closed'
		})
	})
})