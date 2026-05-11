import { ZodSchema } from "zod"
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from 'http-status-codes'

export const validateRequest = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if(req.query) {
			const result = schema.safeParse(req.query);
			if(!result.success) {
				return res.status(StatusCodes.BAD_REQUEST).json({
					message: 'Invalid request params',
					erros: result.error.flatten().fieldErrors
				})
			}
			req.query = result.data as any;
		}
		next();
	}
}