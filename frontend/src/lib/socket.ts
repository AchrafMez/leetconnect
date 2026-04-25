import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

let socket: Socket | null = null;

export function getSocket(): Socket {
	if (!socket) {
		socket = io({
			transports: ['websocket'],
			auth: {token: getAccessToken() ?? ''},
			autoConnect: true,
		});
	}
	return (socket);
}

export function disconnectSocket(): void {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
