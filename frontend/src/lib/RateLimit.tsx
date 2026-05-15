import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ApiError } from './api';

interface RateLimitState {
	message: string;
	secondsLeft: number;
}

export function useRateLimit() {
	const [state, setState] = useState<RateLimitState | null>(null);

	useEffect(() => {
		if (!state || state.secondsLeft <= 0) return;
		const t = setInterval(() => {
			setState((s) => {
				if (!s) return s;
				if (s.secondsLeft <= 1) return null;
				return { ...s, secondsLeft: s.secondsLeft - 1 };
			});
		}, 1000);
		return () => clearInterval(t);
	}, [state]);

	function handle(err: unknown): boolean {
		if (err instanceof ApiError && err.status === 429) {
			setState({
				message: err.message,
				secondsLeft: err.retryAfter && err.retryAfter > 0 ? err.retryAfter : 5,
			});
			return true;
		}
		return false;
	}

	return {
		isLimited: state !== null,
		message: state?.message ?? null,
		secondsLeft: state?.secondsLeft ?? 0,
		handle,
	};
}

interface RateLimitBannerProps {
	message: string | null;
	secondsLeft: number;
	className?: string;
}

export function RateLimitBanner({ message, secondsLeft, className }: RateLimitBannerProps) {
	if (!message) return null;
	return (
		<div
			role="alert"
			className={
				'flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs text-destructive ' +
				(className ?? '')
			}
		>
			<AlertTriangle size={14} className="shrink-0" />
			<span className="flex-1">{message}</span>
			<span className="font-mono tabular-nums">retry in {secondsLeft}s</span>
		</div>
	);
}
