import Redis from "ioredis";
import type { Server } from "socket.io";
import prisma from "../config/config.database";
import { publishEvent, EVENTS } from "@leetconnect/shared";

const redis = new Redis(process.env.REDIS_URL!);
redis.on('error', (err) => console.error('[presence] redis error:', err.message));

const KEY = (user_id: string) => `presence:sockets:${user_id}`;
const ROOM = (user_id: string) => `presence:${user_id}`;

export async function mark_online(io: Server, user_id: string, socket_id: string): Promise<void> {
	const key  = KEY(user_id);
	await redis.sadd(key, socket_id);
	const size = await redis.scard(key);

	if (size !== 1)
		return ;

	await prisma.user.updateMany({
		where: {id: user_id},
		data:  {isOnline: true}
	});

	await publishEvent(EVENTS.USER_ONLINE, {id: user_id});
	io.to(ROOM(user_id)).emit('presence_changed', {id: user_id, isOnline: true});
}

export async function mark_offline(io: Server, user_id: string, socket_id: string): Promise<void> {
	const key  = KEY(user_id);
	await redis.srem(key, socket_id);
	const size = await redis.scard(key);

	if (size > 0)
		return ;

	await redis.del(key);

	await prisma.user.updateMany({
		where: {id: user_id},
		data:  {isOnline: false}
	});

	await publishEvent(EVENTS.USER_OFFLINE, {id: user_id});
	io.to(ROOM(user_id)).emit('presence_changed', {id: user_id, isOnline: false});
}

export async function reset_presence(): Promise<void> {
	await prisma.user.updateMany({
		where: {isOnline: true},
		data: {isOnline: false}
	});

	const stream = redis.scanStream({match: 'presence:sockets:*'});
	const keys: string[] = [];
	for await (const batch of stream) {
		keys.push(...(batch as string[]));
	}
	if (keys.length > 0)
		await redis.del(...keys);
	await publishEvent(EVENTS.PRESENCE_RESET, {});
}


export async function shutdown_presence(): Promise<void> {
	const online = await prisma.user.findMany({
		where: {isOnline: true},
		select: {id: true}
	});
	for (const user of online) {
		await publishEvent(EVENTS.USER_OFFLINE, {id: user.id});
	}
	await prisma.user.updateMany({
		where: {isOnline: true},
		data: {isOnline: false}
	});
	await redis.quit();
}
