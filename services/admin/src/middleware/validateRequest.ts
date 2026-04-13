import { NextFunction, Request, Response } from "express"
import { ZodSchema } from "zod";

export const validateReqeust = (schema: ZodSchema) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);

		if(!result.success) {
			return res.status(400).json({
				message: 'Validation falied',
				errors: result.error.flatten().fieldErrors,
			});
		}

		req.body = result.data;
		next();
	}
}
