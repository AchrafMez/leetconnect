import type { Request, Response, NextFunction } from 'express';

export function list(req: Request, res: Response, next: NextFunction) {
	console.log('List user messages');
	res.send(`GET: convers/${req.params.id}/messages endpoint`);
}

export function send(req: Request, res: Response, next: NextFunction) {
	console.log('Send a message');
	res.send(`POST: convers/${req.params.id}/messages endpoint`);
}

export function get(req: Request, res: Response, next: NextFunction) {
	console.log('Get a single message');
	res.send(`GET: convers/${req.params.id}/messages/${req.params.msg_id} endpoint`);
}

export function remove(req: Request, res: Response, next: NextFunction) {
	console.log('Delete a single message');
	res.send(`DELETE: convers/${req.params.id}/messages/${req.params.msg_id} endpoint`);
}
