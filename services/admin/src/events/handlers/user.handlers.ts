import { AUTH_EVENTS } from "@leetconnect/shared";
import { prisma } from "../../config/prisma";

export async function handleUserRegistred(channel: string, message: any): Promise<void> {
	if (channel !== AUTH_EVENTS.USER_REGISTERED) return;
	try {
		const { id, username, avatar, role, email, firstname, lastname, status, createdAt, type } = message.data;

		await prisma.user.upsert({
			where: { id: id },
			update: {
				username: username, avatar: avatar, firstname: firstname,
				lastname: lastname, status: status, role: role, type: type
			},
			create: {
        id: id, username: username, avatar: avatar, role: role,
				email: email, firstname: firstname, lastname: lastname,
				status: status, createdAt: createdAt, type: type
      }
		});

		// console.log(`[EVENT] USER_REGISTERED — synced user ${username}`);
	} catch (error) { }
}

export async function handleUserUpdated(channel: string, message: any): Promise<void> {
	if (channel !== AUTH_EVENTS.USER_UPDATED) return;
	try {
		const { id, username, avatar, email, firstname, lastname } = message.data;

		await prisma.user.update({
			where: { id: id },
			data: { username, avatar, firstname, lastname, email},
		});
		
		// console.log(`[EVENT] USER_UPDATED — synced user ${username}`);
	} catch (error) {
		const { id } = message.data;
		if ((error as any)?.code === 'P2025') {
      // console.warn(`[EVENT] USER_UPDATED — user ${id} not in local DB yet, skipping`);
      return;
    }
    // console.error('[EVENT] USER_UPDATED — sync failed:', error);
	}
}