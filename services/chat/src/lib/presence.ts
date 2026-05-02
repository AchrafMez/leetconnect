import Redis from "ioredis";
import type { Server } from "socket.io";
import prisma from "../config/config.database";
import { publishEvent, EVENTS } from "@leetconnect/shared";

const redis = new Redis(process.env.REDIS_URL!);
redis.on('error', (err) => console.error('[presence] redis error:', err.message));

const KEY = (user_id: string) => `presence:count:${user_id}`;
const TTL_SECONDS = 120;

export async function mark_online(io: Server, user_id: string): Promise<void> {
	const key	= KEY(user_id);
	const count	= await redis.incr(key);
	await redis.expire(key, TTL_SECONDS);

	if (count !== 1)
		return ;

	try {
		await prisma.user.update({
			where: {id: user_id},
			data:{isOnline: true}
		});
	} catch (err) {
		console.error('[presence] mark_online db update failed:', (err as Error).message);
	}

	await publishEvent(EVENTS.USER_ONLINE, {id: user_id});
	io.emit('presence_changed', {id: user_id, isOnline: true});
}

export async function mark_offline(io: Server, user_id: string): Promise<void> {
	const key	= KEY(user_id);
	const rem	=await redis.decr(key);

	if (rem > 0)
		return ;

	await redis.del(key);

	try {
		await prisma.user.update({
			where: {id: user_id},
			data: {isOnline: false}
		});
	} catch (err) {
		console.error('[presence] mark_offline db update failed:', (err as Error).message);
	}

	await publishEvent(EVENTS.USER_OFFLINE, {id: user_id});
	io.emit('presence_changed', {id: user_id, isOnline: false});
}

export async function reset_presence(): Promise<void> {
	await prisma.user.updateMany({
		where: {isOnline: true},
		data: {isOnline: false}
	});

	const stream = redis.scanStream({match: 'presence:count:*'});
	const keys: string[] = [];
	for await (const batch of stream) {
		keys.push(...(batch as string[]));
	}
	if (keys.length > 0)
		await redis.del(...keys);
	await publishEvent(EVENTS.PRESENCE_RESET, {});
	console.log(`[presence] reset complete (cleared ${keys.length} stale keys)`);
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
