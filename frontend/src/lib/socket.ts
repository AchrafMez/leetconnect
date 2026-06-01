import Pusher from 'pusher-js';
import { getAccessToken } from './api';

const PUSHER_KEY     = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

let pusherClient: Pusher | null = null;

export function getPusher(): Pusher {
	if (!pusherClient) {
		pusherClient = new Pusher(PUSHER_KEY, {
			cluster: PUSHER_CLUSTER,
			authEndpoint: '/api/chat/pusher/auth',
			auth: {
				headers: {
					Authorization: `Bearer ${getAccessToken()}`
				}
			}
		});
	}
	return pusherClient;
}

export function disconnectSocket(): void {
	if (pusherClient) {
		pusherClient.disconnect();
		pusherClient = null;
	}
}

export function subscribeToUserChannel(userId: string, onNotification: (data: any) => void) {
	const pusher  = getPusher();
	const channel = pusher.subscribe(`user-${userId}`);
	channel.bind('new_notification', onNotification);
	return channel;
}