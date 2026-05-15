import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getSocket } from '../lib/socket';
import { useAuth } from './userContext';

interface PresenceContextValue {
	isOnline: (userId: string) => boolean | undefined;
	seed: (entries: Array<{ id: string; isOnline: boolean}>) => void;
	subscribe: (userId: string) => void;
	unsubscribe: (userId: string) => void;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function PresenceProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [map, setMap] = useState<Record<string, boolean>>({});
	const watchers = useRef<Map<string, number>>(new Map());

	useEffect(() => {
		if (!user) {
			setMap({});
			watchers.current.clear();
			return ;
		}

		const socket = getSocket();
		const onPresence = (data: { id: string; isOnline: boolean}) => {
			setMap((prev) => ({...prev, [data.id]: data.isOnline}));
		};
		const onConnect = () => {
			const ids = Array.from(watchers.current.keys());
			if (ids.length > 0) socket.emit('watch_presence', ids);
		};

		socket.on('presence_changed', onPresence);
		socket.on('connect', onConnect);
		return () => {
			socket.off('presence_changed', onPresence);
			socket.off('connect', onConnect);
		};
	}, [user?.id]);

	const isOnline = useCallback(
		(userId: string) => map[userId], [map]
	);

	const seed = useCallback(
		(entries: Array<{ id: string; isOnline: boolean}>) => {
			setMap((prev) => {
				const next = {...prev};
				for (const entry of entries) {
					if (next[entry.id] === undefined)
						next[entry.id] = entry.isOnline;
				}
				return next;
			});
		},
		[]
	);

	const subscribe = useCallback((userId: string) => {
		const cur = watchers.current.get(userId) ?? 0;
		watchers.current.set(userId, cur + 1);
		if (cur === 0)
			getSocket().emit('watch_presence', [userId]);
	}, []);

	const unsubscribe = useCallback((userId: string) => {
		const cur = watchers.current.get(userId) ?? 0;
		if (cur <= 1) {
			watchers.current.delete(userId);
			getSocket().emit('unwatch_presence', [userId]);
		} else {
			watchers.current.set(userId, cur - 1);
		}
	}, []);

	return (
		<PresenceContext.Provider value={{ isOnline, seed, subscribe, unsubscribe }}>
			{children}
		</PresenceContext.Provider>
	);
}

export function usePresence(userId: string): boolean | undefined {
	const context = useContext(PresenceContext);
	if (!context)
		throw new Error('usePresence must be used inside PresenceProvider');

	useEffect(() => {
		if (!userId) return;
		context.subscribe(userId);
		return () => context.unsubscribe(userId);
	}, [userId, context]);

	return context.isOnline(userId);
}

export function usePresenceSeed() {
	const context = useContext(PresenceContext);
	if (!context)
		throw new Error('usePresenceSeed must be used inside PresenceProvider');
	return context.seed;
}
