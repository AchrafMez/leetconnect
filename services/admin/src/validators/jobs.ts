import { z } from 'zod'
import { JobStatus } from '../../prisma/generated/client';

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

export const uuidSchema = z.object({
	id: z.string().uuid('Invalid user id'),
});

export const getJobsQuerySchema = z.object({
	search: z.string().max(100, 'Search term too long').optional(),
	status: z.nativeEnum(JobStatus).optional(),
	category: z.string().max(30, 'Category length too long').optional()
})