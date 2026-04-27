import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, UserMinus, Loader2, Users } from 'lucide-react';
import { chatApi, friendApi, type Friend } from '../../lib/api';
import Avatar from '../chat/Avatar';

interface FriendListProps {
	refreshTrigger: number;
	onAction: () => void;
}

export default function FriendList({ refreshTrigger, onAction }: FriendListProps) {
	const [friends, setFriends] = useState<Friend[]>([]);
	const [loading, setLoading] = useState(true);
	const [removingId, setRemovingId] = useState<string | null>(null);
	const [openingId, setOpeningId] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleMessage = async (friendId: string) => {
		setOpeningId(friendId);
		try {
			const convers = await chatApi.createConversation({
				type: 'Direct',
				member_ids: [friendId],
			});
			navigate(`/chat?conv=${convers.id}`);
		} catch (err) {
			console.error('Failed to open conversation:', err);
		} finally {
			setOpeningId(null);
		}
	};

	useEffect(() => {
		setLoading(true);
		friendApi.listFriends()
			.then(setFriends)
			.catch((err) => console.error('Failed to fetch friends:', err))
			.finally(() => setLoading(false));
	}, [refreshTrigger]);

	const handleRemove = async (friendId: string) => {
		setRemovingId(friendId);
		try {
			await friendApi.removeFriend(friendId);
			onAction();
		} catch (err) {
			console.error('Failed to remove friend:', err);
		} finally {
			setRemovingId(null);
		}
	};

	return (
		<div className="bg-secondary/50 rounded-xl p-4 border border-border">
			<div className="flex items-center gap-2 mb-3">
				<Users size={16} className="text-primary" />
				<h3 className="text-sm font-semibold text-foreground">
					Connections ({friends.length})
				</h3>
			</div>

			{loading ? (
				<div className="flex justify-center py-6">
					<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
				</div>
			) : friends.length === 0 ? (
				<p className="text-muted-foreground text-xs py-4 text-center">
					No friends yet.
				</p>
			) : (
				<div className="space-y-1">
					{friends.map((friend) => (
						<div
							key={friend.id}
							className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors"
						>
							<div
								className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
								onClick={() => navigate(`/profile/${friend.username}`)}
							>
								<div className="relative shrink-0">
									<Avatar name={friend.username || '?'} image={friend.avatar} size="sm" />
									<span
										className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-secondary ${
											friend.is_online ? 'bg-primary' : 'bg-muted-foreground'
										}`}
									/>
								</div>
								<div className="min-w-0">
									<p className="text-sm font-medium text-foreground truncate">
										{friend.username}
									</p>
									<p className={`text-xs ${friend.is_online ? 'text-primary' : 'text-muted-foreground'}`}>
										{friend.is_online ? 'online' : 'offline'}
									</p>
								</div>
							</div>

							<div className="flex gap-1 shrink-0">
								{openingId === friend.id ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground m-1.5" />
								) : (
									<button
										onClick={() => handleMessage(friend.id)}
										title="Send message"
										className="p-1.5 text-muted-foreground hover:text-foreground
											hover:bg-background rounded-lg transition-colors"
									>
										<MessageCircle size={14} />
									</button>
								)}
								{removingId === friend.id ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground m-1.5" />
								) : (
									<button
										onClick={() => handleRemove(friend.id)}
										title="Remove friend"
										className="p-1.5 text-muted-foreground hover:text-destructive
											hover:bg-background rounded-lg transition-colors"
									>
										<UserMinus size={14} />
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
