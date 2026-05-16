import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import type { JwtPayload } from '@leetconnect/shared';
import prisma from '../config/config.database';
import { mark_offline, mark_online } from '../lib/presence';

const pub_key = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH as string);

export function setup_sockets(io: Server) {
	io.use((socket, next) => {
		const token = socket.handshake.auth?.token
			|| socket.handshake.headers?.authorization?.split(' ')[1];

		if(!token) {
			return next(new Error('ws authentication required'));
		}
		try {
			const decoded = jwt.verify(token, pub_key, {
				algorithms: ['RS256']
			}) as unknown as JwtPayload;

			socket.data.user = decoded;

			next();
		} catch (err) {
			next(new Error('invalid or expired token'));
		}
	});

	io.on('connection', async (socket: Socket) => {
		const userId = socket.data.user.userId;

		socket.join(`user:${userId}`);
		socket.join(`presence:${userId}`);

		try {
			await mark_online(io, userId, socket.id);
		} catch (err) {
			console.error('[presence] mark_online failed:', (err as Error).message);
		}
		socket.on('watch_presence', (ids: unknown) => {
			if (!Array.isArray(ids)) return;
			const valid = ids.filter((id): id is string => typeof id === 'string' && id.length > 0).slice(0, 200);
			for (const id of valid) socket.join(`presence:${id}`);
		});
		socket.on('unwatch_presence', (ids: unknown) => {
			if (!Array.isArray(ids)) return;
			const valid = ids.filter((id): id is string => typeof id === 'string' && id.length > 0).slice(0, 200);
			for (const id of valid) socket.leave(`presence:${id}`);
		});
		socket.on('join_convers', async (convers_id: number) => {
			
			if (!Number.isInteger(convers_id) || convers_id <= 0) return;
			const member = await prisma.conversMember.findFirst({
				where: {convers_id, user_id: userId},
				select: {id: true}
			});
			if (!member) return;

			const room = `convers:${convers_id}`;
			socket.join(room);
		});
		socket.on('leave_convers', (convers_id: number) => {
			if (!Number.isInteger(convers_id) || convers_id <= 0)
				return ;
			const room = `convers:${convers_id}`;
			socket.leave(room);
		});
		socket.on('chat_active', (active: boolean) => {
			socket.data.chatActive = !!active;
		});
		socket.on('disconnect', async (reason: string) => {
			try {
				await mark_offline(io, userId, socket.id);
			} catch(err) {
				console.error('[presence] mark_offline failed:', (err as Error).message);
			}
		});
	});
}
