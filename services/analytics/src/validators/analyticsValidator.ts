import { z } from 'zod'

const VALID_RANGES = ['7d', '30d', '90d', '1y'] as const;

const calendarDateString = (field: string) =>
  z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: `${field} must be in YYYY-MM-DD format` })
    .refine(val => new Date(val) <= new Date(), {
      message: `${field} cannot be in the future`,
    });

export const analyticsQueryParams = z.union([
	z.object({
		range: z.enum(VALID_RANGES).default('30d'),
		from: z.undefined().optional(),
		to: z.undefined().optional()
	}).transform(data => ({
		range: data.range
	})),

	z.object({
		from: calendarDateString('from'),
		to: calendarDateString('to'),
		range: z.undefined().optional(),
	}).refine(
		data => new Date(data.from!) <= new Date(data.to!),
		{ message: 'from must be before or equal to to', path: ['from'] }
	).transform(data => ({
		from: data.from,
		to: data.to
	}))
])