import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { ZodSchema } from "zod";

interface ValidationSchemas {
	body?: ZodSchema;
	params?: ZodSchema;
	query?: ZodSchema
}

export const validateReqeust = (schemas: ValidationSchemas) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if(schemas.params) {
			const result = schemas.params?.safeParse(req.params);
			if(!result.success) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid request params',
					error: result.error.flatten().fieldErrors,
				})
			}
			req.params = result.data as any;
		}

		if(schemas.query) {
			const result = schemas.query?.safeParse(req.query);
			if(!result.success) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid query params',
					error: result.error.flatten().fieldErrors,
				})
			}
			req.query = result.data as any;
		}

		if(schemas.body) {
			const result = schemas.body?.safeParse(req.body);
			if(!result.success) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Validation failed',
					error: result.error.flatten().fieldErrors,
				})
			}
			req.body = result.data;
		}
		next();
	}
}
