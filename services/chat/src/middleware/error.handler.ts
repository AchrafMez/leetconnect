import type { Request, Response, NextFunction } from 'express';

export class ChatError extends Error {
	public readonly status: number;

	constructor(message: string, status: number = 500) {
		super(message);
		this.status = status;
		this.name = this.constructor.name;
	}
}

export class NotFoundError extends ChatError {
	constructor(message: string = 'Resource not found') {
		super(message, 404);
	}
}

export class ForbiddenError extends ChatError {
	constructor(message: string = 'Forbidden') {
		super(message, 403);
	}
}

export class BadRequestError extends ChatError {
	constructor(message: string = 'Bad request') {
		super(message, 400);
	}
}

export class UnauthorizedError extends ChatError {
	constructor(message: string = 'Unauthorized') {
		super(message, 401);
	}
}

export default function error_handler(err: ChatError, _req: Request, res: Response, _next: NextFunction) {
	const status  = err.status;
	const message = err.message;

	// console.error('error_handler messsage:', err.message);

	res.status(status).json({
		status: 'error',
		error: message,
	});
}
