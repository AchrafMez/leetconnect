import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { chatApi, type UserProfile } from '../../lib/api';

export default function ProfilePage() {
	const { username } = useParams<{ username: string }>();
	const [user, setUser]   = useState<UserProfile | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!username) return;
		setUser(null);
		setError(null);
		chatApi.getUser(username)
			.then(setUser)
			.catch((e) => setError(String(e)));
	}, [username]);

	return (
		<div className="space-y-4">
			<Link to="/chat" className="text-sm text-muted-foreground hover:text-foreground">
				← back
			</Link>

			<h1 className="text-2xl font-semibold">Profile debug</h1>

			<div className="text-sm">
				<span className="text-muted-foreground">url param: </span>
				<code className="font-mono">{username ?? '(none)'}</code>
			</div>

			<div className="p-4 rounded-lg bg-secondary text-sm">
				<div className="text-muted-foreground mb-2">GET /api/chat/users/{username}</div>
				{error && <pre className="text-destructive">{error}</pre>}
				{user && !error && (
					<pre className="whitespace-pre-wrap break-all">
						{JSON.stringify(user, null, 2)}
					</pre>
				)}
				{!user && !error && <div className="opacity-60">loading…</div>}
			</div>
		</div>
	);
}
