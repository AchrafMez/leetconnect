import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BadRequestError } from './error.handler';

type Schemas = {
	body?: z.ZodType;
	params?: z.ZodType;
	query?: z.ZodType;
};

export function validate(schemas: Schemas) {
	const sources = Object.keys(schemas) as (keyof Schemas)[];
	return (req: Request, _res: Response, next: NextFunction) => {
		for (const src of sources) {
			const schema = schemas[src];
			if (!schema) continue ;
			const res = schema.safeParse(req[src]);
			if (!res.success) {
				const first = res.error.issues[0];
				const path  = first?.path.join('.') || src;
				return next(new BadRequestError(`${path}: ${first?.message ?? 'invalid input'}`));
			}
			(req as any)[src] = res.data;
		}
		next();
	};
}
