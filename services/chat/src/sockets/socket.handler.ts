import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import type { JwtPayload } from '@leetconnect/shared';
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
		console.log(`socket connected: ${socket.id} (user: ${userId})`);
		socket.join(`user:${userId}`);

		try {
			await mark_online(io, userId);
		} catch (err) {
			console.error('[presence] mark_online failed:', (err as Error).message);
		}
		socket.on('join_convers', (convers_id: number) => {
			// TODO: verify user is a member of this conversation
			const room = `convers:${convers_id}`;
			socket.join(room);
			const roomSize = io.sockets.adapter.rooms.get(room)?.size ?? 0;
			console.log(`socket ${socket.id} joined room ${room}`);
		});
		socket.on('leave_covers', (convers_id: number) => {
			const room = `convers:${convers_id}`;
			socket.leave(room);
			console.log(`socket ${socket.id} left room ${room}`);
			const roomSize = io.sockets.adapter.rooms.get(room)?.size ?? 0;
		});
		socket.on('chat_active', (active: boolean) => {
			socket.data.chatActive = !!active;
		});
		socket.on('disconnect', async (reason: string) => {
			try {
				await mark_offline(io, userId);
			} catch(err) {
				console.error('[presence] mark_offline failed:', (err as Error).message);
			}
			console.log(`socket disconnected: ${socket.id} (${reason})`);
		});
		socket.onAny((event, ...args) => {
			console.log('[WS:event]', socket.id, '→', event, JSON.stringify(args));
		});
	});
}
