import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { notifApi, type ChatNotif } from '../lib/api';
import { useAuth } from './userContext';
import { getPusher, subscribeToUserChannel } from '../lib/socket';

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
	const { user } = useAuth();

	// initial load from REST
	useEffect(() => {
		notifApi.list().then(setNotifs).catch(() => {});
	}, []);

	// live updates from Pusher
		useEffect(() => {
		if (!user?.id) return;

		const pusher = getPusher();
		const channel = pusher.subscribe(`user-${user.id}`);

		channel.bind('new_notification', (n: ChatNotif) => {
			setNotifs(p => [n, ...p.filter(x => x.id !== n.id)]);
		});

		channel.bind('notification_read', ({id}: {id: number}) => {
			setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
		});

		channel.bind('notification_read_all', () => {
			setNotifs(p => p.map(n => ({ ...n, is_read: true })));
		});

		channel.bind('notification_deleted', ({id}: {id: number}) => {
			setNotifs(p => p.filter(n => n.id !== id));
		});

		return () => {
			pusher.unsubscribe(`user-${user.id}`);
		};
	}, [user?.id]);

	const markRead = useCallback(async (id: number) => {
		setNotifs(p => p.map(n => n.id === id ? { ...n, is_read: true } : n));
		await notifApi.markRead(id).catch(() => {});
	}, []);

	const markAllRead = useCallback(async () => {
		setNotifs(p => p.map(n => ({ ...n, is_read: true })));
		await notifApi.markAllRead().catch(() => {});
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