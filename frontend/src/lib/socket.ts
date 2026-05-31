import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;
let socket: Socket | null = null;

export function getSocket(): Socket {
	if (!socket) {
		socket = io(SOCKET_URL, {
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
