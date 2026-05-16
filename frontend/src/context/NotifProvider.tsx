import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { notifApi, type ChatNotif } from '../lib/api';
import { getSocket } from '../lib/socket';

interface NotifContext {
	notifs: ChatNotif[];
	unread: number;
	markRead: (id: number) => Promise<void>;
	markAllRead: () => Promise<void>;
	remove: (id: number) => Promise<void>;
}

const NotifContext = createContext<NotifContext | null>(null);

export function NotifProvider({ children }: { children: ReactNode }) {
	const [notifs, setNotifs] = useState<ChatNotif[]>([]);

	// initial load from REST
	useEffect(() => {
		notifApi.list().then(setNotifs).catch((_err) => { /* handle silently */});
	}, []);

	// live updates from the existing chat socket
	useEffect(() => {
		const socket = getSocket();

		const onNew  = (n: ChatNotif) => setNotifs(p => [n, ...p.filter(x => x.id !== n.id)]);
		const onRead = ({id}: {id: number}) =>
			setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
		const onReadAll  = () =>
			setNotifs(p => p.map(n => ({ ...n, is_read: true })));
		const onDeleted = ({id}: {id: number}) =>
			setNotifs(p => p.filter(n => n.id !== id));

		socket.on('new_notification', onNew);
		socket.on('notification_read', onRead);
		socket.on('notification_read_all', onReadAll);
		socket.on('notification_deleted', onDeleted);

		return () => {
			socket.off('new_notification', onNew);
			socket.off('notification_read', onRead);
			socket.off('notification_read_all', onReadAll);
			socket.off('notification_deleted', onDeleted);
		};
	}, []);

	const markRead = useCallback(async (id: number) => {
		setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
		await notifApi.markRead(id).catch((_err) => { /* handle silently */});
	}, []);

	const markAllRead = useCallback(async () => {
		setNotifs(p => p.map(n => ({ ...n, is_read: true })));
		await notifApi.markAllRead().catch((_err) => { /* handle silently */});
	}, []);

	const remove = useCallback(async (id: number) => {
		let snapshot: ChatNotif[] = [];
		setNotifs(p => {
			snapshot = p;
			return p.filter(n => n.id !== id);
		});
		try {
			await notifApi.remove(id);
		} catch {
			setNotifs(snapshot);
		}
	}, []);

	const unread = notifs.filter(n => !n.is_read).length;
	return (
		<NotifContext.Provider value={{ notifs, unread, markRead, markAllRead, remove }}>
			{children}
		</NotifContext.Provider>
	);
}

export function useNotifications() {
	return useContext(NotifContext);
}
