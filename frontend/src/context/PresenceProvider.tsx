import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getSocket } from '../lib/socket';
import { useAuth } from './userContext';

interface PresenceContextValue {
	isOnline: (userId: string) => boolean | undefined;
	seed: (entries: Array<{ id: string; isOnline: boolean}>) => void;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function PresenceProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [map, setMap] = useState<Record<string, boolean>>({});

	useEffect(() => {
		if (!user) {
			setMap({}); return ;
		}

		const socket = getSocket();
		const onPresence = (data: { id: string; isOnline: boolean}) => {
			setMap((prev) => ({...prev, [data.id]: data.isOnline}));
		};

		socket.on('presence_changed', onPresence);
		return () => { socket.off('presence_changed', onPresence); };
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
	return (
		<PresenceContext.Provider value={{ isOnline, seed }}>
			{children}
		</PresenceContext.Provider>
	);
}

export function usePresence(userId: string): boolean | undefined {
	const context = useContext(PresenceContext);
	if (!context)
		throw new Error('usePresence must be used inside PresenceProvider');
	return context.isOnline(userId);
}

export function usePresenceSeed() {
	const context = useContext(PresenceContext);
	if (!context)
		throw new Error('usePresenceSeed must be used inside PresenceProvider');
	return context.seed;
}
