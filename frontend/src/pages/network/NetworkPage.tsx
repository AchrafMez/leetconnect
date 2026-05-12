import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Users, Inbox, Send, Check, X, Clock, Loader2,
	MessageCircle, UserMinus, UserPlus,
} from 'lucide-react';
import { friendApi, chatApi, type Friend, type FriendRequest } from '../../lib/api';
import { Card, CardContent } from '@/components/ui/card';

import TabButton from './TabButton';
import EmptyState from './EmptyState';
import UserRow from './UserRow';
import { usePresence, usePresenceSeed } from '@/context/PresenceProvider';

type TabKey = 'connections' | 'incoming' | 'outgoing';

function fullName(u: { username?: string; firstname?: string; lastname?: string } | undefined): string {
	if (!u) return 'Unknown';
	const full = [u.firstname, u.lastname].filter(Boolean).join(' ');
	return full || u.username || 'Unknown';
}


export default function NetworkPage() {
	const seed = usePresenceSeed();
	const navigate = useNavigate();

	// active tab
	const [tab, setTab] = useState<TabKey>('connections');

	const [friends, setFriends] = useState<Friend[]>([]);
	const [incoming, setIncoming] = useState<FriendRequest[]>([]);
	const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);

	const [loading, setLoading] = useState(true);

	const [actionId, setActionId] = useState<string | number | null>(null);

	const [refreshKey, setRefreshKey] = useState(0);

	// load all three lists at once
	useEffect(() => {
		setLoading(true);
		Promise.all([
			friendApi.listFriends(),
			friendApi.listIncoming(),
			friendApi.listOutgoing(),
		])
			.then(([friends, incoming, outgoing]) => {
				setFriends(friends);
				setIncoming(incoming);
				setOutgoing(outgoing);

				seed(friends.map((friend) => ({ id: friend.id, isOnline: friend.is_online })));
			})
			.catch((err) => console.error('failed to load network:', err))
			.finally(() => setLoading(false));
	}, [refreshKey, seed]);

	const refresh = () => setRefreshKey((k) => k + 1);

	//  handlers
	const handleAccept = async (id: number) => {
		setActionId(id);
		try {
			await friendApi.acceptRequest(id);
			refresh();
		} catch (err) {
			console.error('failed to accept request:', err);
		} finally {
			setActionId(null);
		}
	};

	const handleReject = async (id: number) => {
		setActionId(id);
		try {
			await friendApi.rejectRequest(id);
			refresh();
		} catch (err) {
			console.error('failed to reject request:', err);
		} finally {
			setActionId(null);
		}
	};

	const handleRemove = async (friendId: string) => {
		setActionId(friendId);
		try {
			await friendApi.removeFriend(friendId);
			refresh();
		} catch (err) {
			console.error('failed to remove friend:', err);
		} finally {
			setActionId(null);
		}
	};

	const handleMessage = async (friendId: string) => {
		setActionId(friendId);
		try {
			const convers = await chatApi.createConversation({
				type: 'Direct',
				member_ids: [friendId],
			});
			navigate(`/chat?conv=${convers.id}`);
		} catch (err) {
			console.error('failed to open conversation:', err);
		} finally {
			setActionId(null);
		}
	};

	return (
		<div className="max-w-3xl mx-auto py-4 px-4 sm:py-8 pb-20">
			<div className="mb-4 sm:mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold text-foreground">
					Network
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Manage your connections and friend requests.
				</p>
			</div>

			{/* tab bar */}
			<div className="flex gap-1 mb-4 sm:mb-6 border-b border-border/50 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
				<TabButton
					icon={Users}
					label="Connections"
					count={friends.length}
					isActive={tab === 'connections'}
					onClick={() => setTab('connections')}
				/>
				<TabButton
					icon={Inbox}
					label="Incoming"
					count={incoming.length}
					isActive={tab === 'incoming'}
					onClick={() => setTab('incoming')}
				/>
				<TabButton
					icon={Send}
					label="Outgoing"
					count={outgoing.length}
					isActive={tab === 'outgoing'}
					onClick={() => setTab('outgoing')}
				/>
			</div>

			{/* content */}
			<Card className="border-border/50 bg-background-elevated">
				<CardContent className="p-3 sm:p-4">
					{loading ? (
						<div className="flex justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : (
						<>
							{/* connections tab */}
							{tab === 'connections' && (
								friends.length === 0 ? (
									<EmptyState
										icon={Users}
										title="No connections yet"
										message="Visit a user's profile and click Connect to send a request."
									/>
								) : (
									<div className="space-y-1">
										{friends.map((friend) => (
											<ConnectionRow
												key={friend.id}
												friend={friend}
												actionId={actionId}
												onMessage={handleMessage}
												onRemove={handleRemove}
												onSelect={() => navigate(`/profile/${friend.username}`)}
											/>
										))}
									</div>
								)
							)}

							{/* incoming tab */}
							{tab === 'incoming' && (
								incoming.length === 0 ? (
									<EmptyState
										icon={Inbox}
										title="No incoming requests"
										message="When someone sends you a connection request it will show up here."
									/>
								) : (
									<div className="space-y-1">
										{incoming.map((req) => (
											<UserRow
												key={req.id}
												name={fullName(req.sender)}
												avatar={req.sender?.avatar}
												onSelect={() => {
													if (req.sender?.username)
														navigate(`/profile/${req.sender.username}`);
												}}
												subtitle={
													<span className="text-muted-foreground">
														Sent {new Date(req.created_at).toLocaleDateString()}
													</span>
												}
											>
												{actionId === req.id ? (
													<Loader2 className="h-4 w-4 animate-spin text-muted-foreground m-2" />
												) : (
													<>
														<button
															onClick={() => handleAccept(req.id)}
															title="Accept"
															className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
														>
															<Check size={16} />
														</button>
														<button
															onClick={() => handleReject(req.id)}
															title="Reject"
															className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
														>
															<X size={16} />
														</button>
													</>
												)}
											</UserRow>
										))}
									</div>
								)
							)}

							{/* outgoing tab */}
							{tab === 'outgoing' && (
								outgoing.length === 0 ? (
									<EmptyState
										icon={UserPlus}
										title="No outgoing requests"
										message="Pending requests you've sent will appear here."
									/>
								) : (
									<div className="space-y-1">
										{outgoing.map((req) => (
											<UserRow
												key={req.id}
												name={fullName(req.receiver)}
												avatar={req.receiver?.avatar}
												onSelect={() => {
													if (req.receiver?.username)
														navigate(`/profile/${req.receiver.username}`);
												}}
												subtitle={
													<span className="text-muted-foreground flex items-center gap-1">
														<Clock size={10} />
														Pending since {new Date(req.created_at).toLocaleDateString()}
													</span>
												}
											/>
										))}
									</div>
								)
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

interface ConnectionRowProps {
	friend:		Friend;
	actionId:	string | number | null;
	onMessage:	(id: string) => void;
	onRemove:	(id: string) => void;
	onSelect:	() => void;
}

function ConnectionRow({ friend, actionId, onMessage, onRemove, onSelect }: ConnectionRowProps) {
	const live = usePresence(friend.id);
	const online = live ?? friend.is_online;

	return (
		<UserRow
			name={fullName(friend)}
			avatar={friend.avatar}
			online={online}
			onSelect={onSelect}
			subtitle={
				<span className={online ? 'text-primary' : 'text-muted-foreground'}>
					{online ? 'online' : 'offline'}
				</span>
			}
		>
			{actionId === friend.id ? (
				<Loader2 className="h-4 w-4 animate-spin text-muted-foreground m-2" />
			) : (
				<>
					<button
						onClick={() => onMessage(friend.id)}
						title="Send message"
						className="p-2 text-muted-foreground hover:text-foreground hover:bg-background rounded-lg transition-colors cursor-pointer"
					>
						<MessageCircle size={16} />
					</button>
					<button
						onClick={() => onRemove(friend.id)}
						title="Remove connection"
						className="p-2 text-muted-foreground hover:text-destructive hover:bg-background rounded-lg transition-colors cursor-pointer"
					>
						<UserMinus size={16} />
					</button>
				</>
			)}
		</UserRow>
	);
}
