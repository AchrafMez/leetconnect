import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Clock, Loader2, Send } from 'lucide-react';
import { friendApi, type FriendRequest } from '../../lib/api';
import Avatar from '../chat/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FriendRequestsProps {
	refreshTrigger: number;
	onAction: () => void;
}

export default function FriendRequests({ refreshTrigger, onAction }: FriendRequestsProps) {
	const navigate = useNavigate();
	const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
	const [incoming, setIncoming] = useState<FriendRequest[]>([]);
	const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [actionId, setActionId] = useState<number | null>(null);

	useEffect(() => {
		setLoading(true);
		Promise.all([friendApi.listIncoming(), friendApi.listOutgoing()])
			.then(([inData, outData]) => { setIncoming(inData); setOutgoing(outData); })
			.catch((err) => console.error('Failed to fetch requests:', err))
			.finally(() => setLoading(false));
	}, [refreshTrigger]);

	const handleAccept = async (requestId: number) => {
		setActionId(requestId);
		try { await friendApi.acceptRequest(requestId); onAction(); }
		catch (err) { console.error('Failed to accept:', err); }
		finally { setActionId(null); }
	};

	const handleReject = async (requestId: number) => {
		setActionId(requestId);
		try { await friendApi.rejectRequest(requestId); onAction(); }
		catch (err) { console.error('Failed to reject:', err); }
		finally { setActionId(null); }
	};

	const requests = tab === 'incoming' ? incoming : outgoing;

	return (
		<Card className="border-border/50 bg-background-elevated">
			<CardHeader className="p-4 pb-2">
				<CardTitle className="flex items-center gap-2 text-sm">
					<Send size={16} className="text-primary" />
					Requests
				</CardTitle>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				{/* tab switcher */}
				<div className="flex gap-1 mb-3">
					<button
						onClick={() => setTab('incoming')}
						className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
							tab === 'incoming'
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-secondary'
						}`}
					>
						Incoming ({incoming.length})
					</button>
					<button
						onClick={() => setTab('outgoing')}
						className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
							tab === 'outgoing'
								? 'bg-primary text-primary-foreground'
								: 'text-muted-foreground hover:bg-secondary'
						}`}
					>
						Outgoing ({outgoing.length})
					</button>
				</div>

				{/* request list */}
				{loading ? (
					<div className="flex justify-center py-6">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : requests.length === 0 ? (
					<p className="text-muted-foreground text-xs py-4 text-center">
						No {tab} requests.
					</p>
				) : (
					<div className="space-y-1">
						{requests.map((req) => (
							<div
								key={req.id}
								className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors"
							>
								<div
									className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
									onClick={() => {
										const username = tab === 'incoming' ? req.sender?.username : req.receiver?.username;
										if (username) navigate(`/profile/${username}`);
									}}
								>
									<Avatar
										name={(tab === 'incoming' ? req.sender?.username : req.receiver?.username) || '?'}
										image={tab === 'incoming' ? req.sender?.avatar : req.receiver?.avatar}
										size="sm"
									/>
									<div className="min-w-0">
										<p className="text-sm font-medium text-foreground truncate">
											{(tab === 'incoming' ? req.sender?.username : req.receiver?.username) || 'Unknown'}
										</p>
										<p className="text-xs text-muted-foreground flex items-center gap-1">
											{tab === 'incoming'
												? new Date(req.created_at).toLocaleDateString()
												: <><Clock size={10} /> Pending</>
											}
										</p>
									</div>
								</div>

								<div className="flex gap-1 shrink-0">
									{actionId === req.id ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground m-1.5" />
									) : tab === 'incoming' ? (
										<>
											<button
												onClick={() => handleAccept(req.id)}
												title="Accept"
												className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
											>
												<Check size={14} />
											</button>
											<button
												onClick={() => handleReject(req.id)}
												title="Reject"
												className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
											>
												<X size={14} />
											</button>
										</>
									) : null}
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
