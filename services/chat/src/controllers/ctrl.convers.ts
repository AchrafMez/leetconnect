import type { Request, Response, NextFunction } from 'express';
import prisma from '../config/config.database';

export async function list(req: Request, res: Response, next: NextFunction) {
	// console.log('List user conversations');
	// res.send('GET: /convers/ endpoint');
}

export function create(req: Request, res: Response, next: NextFunction) {
	console.log('Create a new conversation');
	res.send('POST: /convers/ endpoint');
}

export function get(req: Request, res: Response, next: NextFunction) {
	console.log('Get conversation details');
	res.send(`GET: /convers/${req.params.id} endpoint`);
}

export function update(req: Request, res: Response, next: NextFunction) {
	console.log('Update conversation details (name, etc.)');
	res.send(`PUT: /convers/${req.params.id} endpoint`);
}

export function remove(req: Request, res: Response, next: NextFunction) {
	console.log('Soft delete / leave conversation');
	res.send(`DELETE: /convers/${req.params.id} endpoint`);
}
