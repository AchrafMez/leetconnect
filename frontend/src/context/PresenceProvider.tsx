import type { ReactNode } from 'react';
import { getPusher } from '../lib/socket';
import { useAuth } from './userContext';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	useMemo,
	useRef
} from 'react';

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
			return;
		}

		const pusher = getPusher();
		const channel = pusher.subscribe(`presence-${user.id}`);

		channel.bind('presence_changed', (data: { id: string; isOnline: boolean }) => {
			setMap((prev) => ({ ...prev, [data.id]: data.isOnline }));
		});

		return () => {
			pusher.unsubscribe(`presence-${user.id}`);
		};
	}, [user?.id]);

	const isOnline = useCallback(
		(userId: string) => map[userId], [map]
	);

	const seed = useCallback(
		(entries: Array<{ id: string; isOnline: boolean }>) => {
			setMap((prev) => {
				const next = { ...prev };
				for (const entry of entries) {
					if (next[entry.id] === undefined)
						next[entry.id] = entry.isOnline;
				}
				return next;
			});
		}, []
	);

	const subscribe = useCallback((userId: string) => {
		const cur = watchers.current.get(userId) ?? 0;
		watchers.current.set(userId, cur + 1);
	}, []);

	const unsubscribe = useCallback((userId: string) => {
		const cur = watchers.current.get(userId) ?? 0;
		if (cur <= 1) {
			watchers.current.delete(userId);
		} else {
			watchers.current.set(userId, cur - 1);
		}
	}, []);

	const value = useMemo(
		() => ({ isOnline, seed, subscribe, unsubscribe }),
		[isOnline, seed, subscribe, unsubscribe]
	);

	return (
		<PresenceContext.Provider value={value}>
			{children}
		</PresenceContext.Provider>
	);
}

export function usePresence(userId: string): boolean | undefined {
	const context = useContext(PresenceContext);
	if (!context)
		throw new Error('usePresence must be used inside PresenceProvider');

	const { subscribe, unsubscribe, isOnline } = context;

	useEffect(() => {
		if (!userId) return;
		subscribe(userId);
		return () => unsubscribe(userId);
	}, [userId, subscribe, unsubscribe]);

	return isOnline(userId);
}

export function usePresenceSeed() {
	const context = useContext(PresenceContext);
	if (!context)
		throw new Error('usePresenceSeed must be used inside PresenceProvider');
	return context.seed;
}