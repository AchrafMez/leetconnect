import Redis from "ioredis";
import prisma from "../config/config.database";
import { publishEvent, EVENTS } from "@leetconnect/shared";
import Pusher from "pusher";

const redis = new Redis(process.env.REDIS_URL!, {
	maxRetriesPerRequest: 3,
	connectTimeout: 30000,
	lazyConnect: true,
});
redis.on('error', (err) => console.error('[presence] redis error:', err.message));

const pusher = new Pusher({
	appId:   process.env.PUSHER_APP_ID!,
	key:     process.env.PUSHER_KEY!,
	secret:  process.env.PUSHER_SECRET!,
	cluster: process.env.PUSHER_CLUSTER!,
	useTLS:  true,
});

const KEY = (user_id: string) => `presence:sockets:${user_id}`;

export async function mark_online(io: any, user_id: string, socket_id: string): Promise<void> {
	try {
		const key  = KEY(user_id);
		await redis.sadd(key, socket_id);
		const size = await redis.scard(key);
		if (size !== 1) return;

		await prisma.user.updateMany({
			where: {id: user_id},
			data:  {isOnline: true}
		});

		await publishEvent(EVENTS.USER_ONLINE, {id: user_id});
		await pusher.trigger(`presence-${user_id}`, 'presence_changed', {id: user_id, isOnline: true});
	} catch (err) {
		console.warn('[presence] mark_online failed:', (err as Error).message);
	}
}

export async function mark_offline(io: any, user_id: string, socket_id: string): Promise<void> {
	try {
		const key  = KEY(user_id);
		await redis.srem(key, socket_id);
		const size = await redis.scard(key);
		if (size > 0) return;

		await redis.del(key);

		await prisma.user.updateMany({
			where: {id: user_id},
			data:  {isOnline: false}
		});

		await publishEvent(EVENTS.USER_OFFLINE, {id: user_id});
		await pusher.trigger(`presence-${user_id}`, 'presence_changed', {id: user_id, isOnline: false});
	} catch (err) {
		console.warn('[presence] mark_offline failed:', (err as Error).message);
	}
}

export async function reset_presence(): Promise<void> {
	try {
		await prisma.user.updateMany({
			where: {isOnline: true},
			data: {isOnline: false}
		});

		const stream = redis.scanStream({match: 'presence:sockets:*'});
		const keys: string[] = [];
		for await (const batch of stream) {
			keys.push(...(batch as string[]));
		}
		if (keys.length > 0) await redis.del(...keys);
		await publishEvent(EVENTS.PRESENCE_RESET, {});
	} catch (err) {
		console.warn('[presence] reset_presence failed:', (err as Error).message);
	}
}

export async function shutdown_presence(): Promise<void> {
	try {
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
	} catch (err) {
		console.warn('[presence] shutdown_presence failed:', (err as Error).message);
	}
}